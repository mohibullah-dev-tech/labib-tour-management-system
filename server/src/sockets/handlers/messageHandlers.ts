import type { Socket, Server as SocketIOServer } from 'socket.io';
import { z } from 'zod';
import { ROOMS } from '../socketRooms.js';
import { verifyConversationAccess } from '../socketAuth.js';
import { Conversation, Message } from '@/models/index.js';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  MessagePayload,
} from '../socketTypes.js';
import { logger } from '@/utils/logger.js';

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
type TypedIO = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

const sendMessageSchema = z.object({
  conversationId: z.string().regex(/^[\da-f]{24}$/i, 'Invalid conversation ID'),
  content: z.string().trim().max(5000).default(''),
  attachments: z
    .array(
      z.object({
        name: z.string().trim().max(255),
        url: z.string().url().max(2048),
        mimeType: z.string().max(120),
        sizeBytes: z.number().min(0).max(25_000_000).optional(),
      }),
    )
    .optional(),
});

const typingSchema = z.object({
  conversationId: z.string().regex(/^[\da-f]{24}$/i, 'Invalid conversation ID'),
});

const statusUpdateSchema = z.object({
  conversationId: z.string().regex(/^[\da-f]{24}$/i, 'Invalid conversation ID'),
  messageId: z.string().regex(/^[\da-f]{24}$/i, 'Invalid message ID'),
});

export function registerMessageHandlers(io: TypedIO, socket: TypedSocket): void {
  // Join Conversation Room
  socket.on('conversation:join', async (payload, callback) => {
    try {
      const parsed = z
        .object({ conversationId: z.string().regex(/^[\da-f]{24}$/i, 'Invalid conversation ID') })
        .safeParse(payload);
      if (!parsed.success) {
        callback?.({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid conversation ID' },
        });
        return;
      }

      const { conversationId } = parsed.data;
      const isParticipant = await verifyConversationAccess(socket.data.user, conversationId);
      if (!isParticipant) {
        callback?.({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You are not a participant in this conversation' },
        });
        return;
      }

      const room = ROOMS.conversation(conversationId);
      await socket.join(room);
      socket.data.joinedRooms.add(room);
      callback?.({ success: true });
    } catch (error) {
      logger.error('Error joining conversation room', { error });
      callback?.({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to join conversation room' },
      });
    }
  });

  // Leave Conversation Room
  socket.on('conversation:leave', async (payload, callback) => {
    try {
      const parsed = z
        .object({ conversationId: z.string().regex(/^[\da-f]{24}$/i, 'Invalid conversation ID') })
        .safeParse(payload);
      if (!parsed.success) {
        callback?.({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid conversation ID' },
        });
        return;
      }

      const room = ROOMS.conversation(parsed.data.conversationId);
      await socket.leave(room);
      socket.data.joinedRooms.delete(room);
      callback?.({ success: true });
    } catch (error) {
      logger.error('Error leaving conversation room', { error });
      callback?.({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to leave conversation room' },
      });
    }
  });

  // 1. Send Message
  socket.on('message:send', async (payload, callback) => {
    try {
      const parsed = sendMessageSchema.safeParse(payload);
      if (!parsed.success) {
        callback?.({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid message payload' },
        });
        return;
      }

      const { conversationId, content, attachments = [] } = parsed.data;
      if (!content.trim() && attachments.length === 0) {
        callback?.({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Message requires text or attachment' },
        });
        return;
      }

      const user = socket.data.user;
      const isParticipant = await verifyConversationAccess(user, conversationId);
      if (!isParticipant) {
        callback?.({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You are not a participant in this conversation' },
        });
        return;
      }

      const conversation = await Conversation.findById(conversationId);
      if (!conversation || conversation.isClosed) {
        callback?.({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Conversation is closed or not found' },
        });
        return;
      }

      // Ensure socket has joined conversation room
      const convRoom = ROOMS.conversation(conversationId);
      await socket.join(convRoom);
      socket.data.joinedRooms.add(convRoom);

      // Persist to MongoDB (source of truth)
      const messageDoc = await Message.create({
        conversationId,
        senderId: user.id,
        content,
        attachments,
        status: 'sent',
      });

      conversation.lastMessageId = messageDoc._id;
      conversation.lastMessageAt = messageDoc.createdAt;
      await conversation.save();

      const broadcastMessage: MessagePayload = {
        id: messageDoc._id.toString(),
        conversationId,
        senderId: user.id,
        senderName: user.name,
        content: messageDoc.content,
        attachments: messageDoc.attachments?.map((a) => ({
          name: a.name,
          url: a.url,
          mimeType: a.mimeType,
          sizeBytes: a.sizeBytes ?? undefined,
        })),
        status: 'sent',
        createdAt: messageDoc.createdAt.toISOString(),
      };

      // Broadcast to conversation room
      io.to(convRoom).emit('message:new', broadcastMessage);

      // Deliver notification to other participants' personal rooms
      for (const participant of conversation.participants) {
        const participantId = participant.userId.toString();
        if (participantId !== user.id) {
          // Push notification to user personal room
          io.to(ROOMS.user(participantId)).emit('notification:new', {
            id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            type: 'message',
            title: `New message from ${user.name}`,
            message: content.slice(0, 100) || 'Sent an attachment',
            createdAt: new Date().toISOString(),
            metadata: { conversationId, messageId: messageDoc._id.toString() },
          });
        }
      }

      callback?.({ success: true, data: { messageId: messageDoc._id.toString() } });
    } catch (error) {
      logger.error('Error handling message:send', { error });
      callback?.({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to send message' },
      });
    }
  });

  // 2. Typing Indicators (short-lived, non-persisted)
  socket.on('message:typing', async (payload) => {
    const parsed = typingSchema.safeParse(payload);
    if (!parsed.success) return;

    const { conversationId } = parsed.data;
    const user = socket.data.user;
    const isParticipant = await verifyConversationAccess(user, conversationId);
    if (!isParticipant) return;

    socket.to(ROOMS.conversation(conversationId)).emit('message:typing', {
      conversationId,
      userId: user.id,
      userName: user.name,
    });
  });

  socket.on('message:stop-typing', async (payload) => {
    const parsed = typingSchema.safeParse(payload);
    if (!parsed.success) return;

    const { conversationId } = parsed.data;
    const user = socket.data.user;
    const isParticipant = await verifyConversationAccess(user, conversationId);
    if (!isParticipant) return;

    socket.to(ROOMS.conversation(conversationId)).emit('message:stop-typing', {
      conversationId,
      userId: user.id,
    });
  });

  // 3. Message Delivery Status
  socket.on('message:delivered', async (payload) => {
    const parsed = statusUpdateSchema.safeParse(payload);
    if (!parsed.success) return;

    const { conversationId, messageId } = parsed.data;
    const user = socket.data.user;
    const isParticipant = await verifyConversationAccess(user, conversationId);
    if (!isParticipant) return;

    await Message.updateOne(
      { _id: messageId, conversationId, senderId: { $ne: user.id }, status: 'sent' },
      { $set: { status: 'delivered', deliveredAt: new Date() } },
    );

    io.to(ROOMS.conversation(conversationId)).emit('message:delivered', {
      conversationId,
      messageId,
    });
  });

  // 4. Message Seen Status
  socket.on('message:seen', async (payload) => {
    const parsed = statusUpdateSchema.safeParse(payload);
    if (!parsed.success) return;

    const { conversationId, messageId } = parsed.data;
    const user = socket.data.user;
    const isParticipant = await verifyConversationAccess(user, conversationId);
    if (!isParticipant) return;

    const now = new Date();
    await Message.updateOne(
      { _id: messageId, conversationId, senderId: { $ne: user.id } },
      { $set: { status: 'seen', readAt: now } },
    );

    // Update conversation participant lastReadAt
    await Conversation.updateOne(
      { _id: conversationId, 'participants.userId': user.id },
      { $set: { 'participants.$.lastReadAt': now } },
    );

    io.to(ROOMS.conversation(conversationId)).emit('message:seen', {
      conversationId,
      messageId,
    });
  });
}

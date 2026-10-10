import type mongoose from 'mongoose';
import { Conversation, Message } from '@/models/index.js';
import { ApiError } from '@/utils/ApiError.js';
import { logger } from '@/utils/logger.js';
import { getIO, ROOMS, type MessagePayload } from '@/sockets/index.js';
import { ConversationService } from './conversation.service.js';
import { AiTravelAssistantService } from './ai/ai.service.js';
import { getChannelAdapter } from '../adapters/index.js';
import type { InboundMessagePayload } from '../types/communication.types.js';

export class MessageService {
  /**
   * Processes an incoming message from any channel (Website, WhatsApp, Messenger, IG, Telegram).
   * Ensures idempotency and deduplication via providerMessageId.
   */
  static async processInboundMessage(payload: InboundMessagePayload) {
    // 1. Deduplication check
    if (payload.providerMessageId) {
      const existing = await Message.findOne({
        channel: payload.channel,
        providerMessageId: payload.providerMessageId,
      }).lean();
      if (existing) {
        logger.info('Duplicate message skipped', {
          channel: payload.channel,
          providerMessageId: payload.providerMessageId,
        });
        return existing;
      }
    }

    // 2. Find or create conversation
    let conversation;
    if (payload.channel === 'website') {
      conversation = await ConversationService.findOrCreateWebsiteConversation({
        externalContactId: payload.externalContactId,
        customerDisplayName: payload.customerDisplayName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
      });
    } else {
      conversation = await ConversationService.findOrCreateExternalConversation({
        channel: payload.channel,
        externalContactId: payload.externalContactId,
        customerDisplayName: payload.customerDisplayName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
      });
    }

    const conversationIdStr = conversation._id.toString();

    // 3. Persist inbound message to MongoDB
    const messageDoc = await Message.create({
      conversationId: conversation._id,
      channel: payload.channel,
      direction: 'inbound',
      senderType: 'customer',
      senderName: payload.customerDisplayName || 'Customer',
      providerMessageId: payload.providerMessageId,
      content: payload.content,
      attachments: payload.attachments || [],
      status: 'delivered',
      metadata: payload.metadata || {},
    });

    // 4. Update conversation state
    conversation.lastMessageId = messageDoc._id as unknown as mongoose.Types.ObjectId;
    conversation.lastMessageAt = messageDoc.createdAt;
    conversation.unreadCountAdmin = (conversation.unreadCountAdmin || 0) + 1;
    if (conversation.status === 'resolved' || conversation.status === 'closed') {
      conversation.status = 'open';
      conversation.isClosed = false;
    }
    await conversation.save();

    // 5. Broadcast real-time event to conversation room and admin inbox
    try {
      const io = getIO();
      const payloadBroadcast: MessagePayload = {
        id: messageDoc._id.toString(),
        conversationId: conversationIdStr,
        senderType: 'customer',
        senderName: messageDoc.senderName || undefined,
        direction: 'inbound',
        channel: payload.channel,
        content: messageDoc.content,
        attachments: messageDoc.attachments?.map((a) => ({
          name: a.name,
          url: a.url,
          mimeType: a.mimeType,
          sizeBytes: a.sizeBytes ?? undefined,
        })),
        status: messageDoc.status,
        createdAt: messageDoc.createdAt.toISOString(),
      };

      io.to(ROOMS.conversation(conversationIdStr)).emit('message:new', payloadBroadcast);
      io.to(ROOMS.inbox()).emit('conversation:updated', {
        conversation: conversation.toObject(),
        lastMessage: payloadBroadcast,
      });
    } catch {
      // Socket optional
    }

    // 6. Automated AI Travel Assistant Reply (if conversation is in AI handling mode)
    if (conversation.handlingMode === 'ai' && payload.content.trim()) {
      try {
        const aiResult = await AiTravelAssistantService.generateReply(payload.content);

        // Check if customer requested handover to human
        if (aiResult.shouldHandover) {
          conversation.handlingMode = 'human';
          await conversation.save();

          try {
            const io = getIO();
            io.to(ROOMS.inbox()).emit('conversation:handover', {
              conversationId: conversationIdStr,
              mode: 'human',
              reason: aiResult.handoverReason || 'Customer requested human agent',
              conversation: conversation.toObject(),
            });
          } catch {
            // Socket optional
          }
        }

        // Persist AI reply
        const aiMessageDoc = await Message.create({
          conversationId: conversation._id,
          channel: payload.channel,
          direction: 'outbound',
          senderType: 'ai',
          senderName: 'Labib AI Assistant',
          content: aiResult.reply,
          status: 'sent',
          metadata: {
            confidence: aiResult.confidence,
            sourcesUsed: aiResult.sourcesUsed,
            handover: aiResult.shouldHandover,
          },
        });

        // Dispatch to external channel adapter if not website
        if (payload.channel !== 'website') {
          const adapter = getChannelAdapter(payload.channel);
          await adapter.sendMessage({
            conversationId: conversationIdStr,
            channel: payload.channel,
            content: aiResult.reply,
            recipientContactId: payload.externalContactId,
            senderType: 'ai',
            senderName: 'Labib AI Assistant',
          });
        }

        // Update conversation last message
        conversation.lastMessageId = aiMessageDoc._id as unknown as mongoose.Types.ObjectId;
        conversation.lastMessageAt = aiMessageDoc.createdAt;
        await conversation.save();

        // Broadcast AI message via Socket.io
        try {
          const io = getIO();
          const aiPayloadBroadcast: MessagePayload = {
            id: aiMessageDoc._id.toString(),
            conversationId: conversationIdStr,
            senderType: 'ai',
            senderName: 'Labib AI Assistant',
            direction: 'outbound',
            channel: payload.channel,
            content: aiMessageDoc.content,
            status: 'sent',
            createdAt: aiMessageDoc.createdAt.toISOString(),
          };

          io.to(ROOMS.conversation(conversationIdStr)).emit('message:new', aiPayloadBroadcast);
          io.to(ROOMS.inbox()).emit('conversation:updated', {
            conversation: conversation.toObject(),
            lastMessage: aiPayloadBroadcast,
          });
        } catch {
          // Socket optional
        }
      } catch (aiErr) {
        logger.error('Error generating AI reply', { error: aiErr });
      }
    }

    return messageDoc;
  }

  /**
   * Sends an outbound reply from an Admin/Staff member via Unified Inbox.
   */
  static async sendStaffReply(input: {
    conversationId: string;
    staffUserId: string;
    staffName: string;
    content: string;
    attachments?: Array<{ name: string; url: string; mimeType: string; sizeBytes?: number }>;
  }) {
    const conversation = await Conversation.findById(input.conversationId);
    if (!conversation) throw ApiError.notFound('Conversation not found');

    // Automatically switch handling mode to human if staff sends a manual reply
    if (conversation.handlingMode === 'ai') {
      conversation.handlingMode = 'human';
    }

    const conversationIdStr = conversation._id.toString();

    // 1. Dispatch through appropriate channel adapter
    const adapter = getChannelAdapter(conversation.channel);
    let adapterResult: { success: boolean; providerMessageId?: string; error?: string } = {
      success: true,
    };

    if (conversation.channel !== 'website') {
      adapterResult = await adapter.sendMessage({
        conversationId: conversationIdStr,
        channel: conversation.channel,
        content: input.content,
        recipientContactId: conversation.externalContactId || undefined,
        senderType: 'staff',
        senderId: input.staffUserId,
        senderName: input.staffName,
        attachments: input.attachments,
      });
    }

    // 2. Persist message in MongoDB
    const messageDoc = await Message.create({
      conversationId: conversation._id,
      channel: conversation.channel,
      direction: 'outbound',
      senderType: 'staff',
      senderId: input.staffUserId,
      senderName: input.staffName,
      providerMessageId: adapterResult.providerMessageId,
      content: input.content,
      attachments: input.attachments || [],
      status: adapterResult.success ? 'delivered' : 'failed',
      deliveryError: adapterResult.error,
    });

    // 3. Update conversation last message & read state
    conversation.lastMessageId = messageDoc._id as unknown as mongoose.Types.ObjectId;
    conversation.lastMessageAt = messageDoc.createdAt;
    conversation.unreadCountAdmin = 0; // staff saw it
    conversation.unreadCountCustomer = (conversation.unreadCountCustomer || 0) + 1;
    await conversation.save();

    // 4. Emit via Socket.io
    try {
      const io = getIO();
      const broadcast: MessagePayload = {
        id: messageDoc._id.toString(),
        conversationId: conversationIdStr,
        senderType: 'staff',
        senderId: input.staffUserId,
        senderName: input.staffName,
        direction: 'outbound',
        channel: conversation.channel,
        content: messageDoc.content,
        attachments: messageDoc.attachments?.map((a) => ({
          name: a.name,
          url: a.url,
          mimeType: a.mimeType,
          sizeBytes: a.sizeBytes ?? undefined,
        })),
        status: messageDoc.status,
        createdAt: messageDoc.createdAt.toISOString(),
      };

      io.to(ROOMS.conversation(conversationIdStr)).emit('message:new', broadcast);
      io.to(ROOMS.inbox()).emit('conversation:updated', {
        conversation: conversation.toObject(),
        lastMessage: broadcast,
      });
    } catch {
      // Socket optional
    }

    return messageDoc;
  }

  /**
   * Retrieves messages for a conversation with pagination.
   */
  static async getMessagesByConversationId(conversationId: string, limit = 100) {
    return Message.find({ conversationId })
      .populate('senderId', 'name avatar role')
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();
  }
}

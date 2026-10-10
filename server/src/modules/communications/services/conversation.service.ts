import mongoose from 'mongoose';
import { Conversation } from '@/models/index.js';
import { ApiError } from '@/utils/ApiError.js';
import { getIO, ROOMS } from '@/sockets/index.js';
import type { CommunicationChannel, ConversationStatus, HandlingMode } from '@/constants/index.js';

export class ConversationService {
  /**
   * Finds or creates a website visitor or authenticated user conversation.
   */
  static async findOrCreateWebsiteConversation(options: {
    externalContactId: string;
    customerDisplayName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerId?: string;
  }) {
    let conversation = await Conversation.findOne({
      channel: 'website',
      externalContactId: options.externalContactId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        channel: 'website',
        type: 'support',
        externalContactId: options.externalContactId,
        customerDisplayName: options.customerDisplayName || 'Website Visitor',
        customerEmail: options.customerEmail,
        customerPhone: options.customerPhone,
        customerId: options.customerId,
        status: 'open',
        handlingMode: 'ai',
        unreadCountAdmin: 0,
        unreadCountCustomer: 0,
      });

      try {
        const io = getIO();
        io.to(ROOMS.inbox()).emit('conversation:new', {
          conversation: conversation.toObject(),
        });
      } catch {
        // Socket optional
      }
    } else if (options.customerId && !conversation.customerId) {
      conversation.customerId = new mongoose.Types.ObjectId(options.customerId);
      if (options.customerDisplayName)
        conversation.customerDisplayName = options.customerDisplayName;
      await conversation.save();
    }

    return conversation;
  }

  /**
   * Finds or creates a conversation for an external channel (WhatsApp, FB, IG, Telegram).
   */
  static async findOrCreateExternalConversation(options: {
    channel: CommunicationChannel;
    externalContactId: string;
    customerDisplayName?: string;
    customerPhone?: string;
    customerEmail?: string;
  }) {
    let conversation = await Conversation.findOne({
      channel: options.channel,
      externalContactId: options.externalContactId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        channel: options.channel,
        type: 'support',
        externalContactId: options.externalContactId,
        customerDisplayName:
          options.customerDisplayName ||
          `${options.channel.toUpperCase()} Contact (${options.externalContactId.slice(-4)})`,
        customerPhone: options.customerPhone,
        customerEmail: options.customerEmail,
        status: 'open',
        handlingMode: 'ai',
        unreadCountAdmin: 0,
        unreadCountCustomer: 0,
      });

      try {
        const io = getIO();
        io.to(ROOMS.inbox()).emit('conversation:new', {
          conversation: conversation.toObject(),
        });
      } catch {
        // Socket optional
      }
    }

    return conversation;
  }

  /**
   * Lists conversations for Admin Unified Inbox with search and filters.
   */
  static async listConversations(query: {
    channel?: string;
    status?: string;
    priority?: string;
    handlingMode?: string;
    assignedTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 25));
    const filter: Record<string, unknown> = {};

    if (query.channel && query.channel !== 'all') {
      filter.channel = query.channel;
    }
    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }
    if (query.priority && query.priority !== 'all') {
      filter.priority = query.priority;
    }
    if (query.handlingMode && query.handlingMode !== 'all') {
      filter.handlingMode = query.handlingMode;
    }
    if (query.assignedTo) {
      filter.assignedTo = query.assignedTo;
    }

    if (query.search && query.search.trim()) {
      const sanitized = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
      const termRegex = new RegExp(sanitized, 'i');
      filter.$or = [
        { customerDisplayName: termRegex },
        { customerPhone: termRegex },
        { customerEmail: termRegex },
        { externalContactId: termRegex },
        { title: termRegex },
      ];
    }

    const [items, total] = await Promise.all([
      Conversation.find(filter)
        .populate('assignedTo', 'name email role')
        .populate('customerId', 'name email phone avatar')
        .populate(
          'bookingId',
          'bookingReference bookingStatus totalAmount receivedAmount dueAmount',
        )
        .populate('eventId', 'title destination departureDate')
        .populate('lastMessageId')
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Conversation.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves single conversation by ID with populated details.
   */
  static async getConversationById(id: string) {
    const conversation = await Conversation.findById(id)
      .populate('assignedTo', 'name email role')
      .populate('customerId', 'name email phone avatar')
      .populate('bookingId')
      .populate('eventId', 'title destination departureDate pricing')
      .populate('lastMessageId')
      .lean();

    if (!conversation) throw ApiError.notFound('Conversation not found');
    return conversation;
  }

  /**
   * Assigns or reassigns a conversation to a staff member.
   */
  static async assignStaff(conversationId: string, assignedToUserId?: string | null) {
    const update = assignedToUserId
      ? { assignedTo: assignedToUserId }
      : { $unset: { assignedTo: 1 } };
    const conversation = await Conversation.findByIdAndUpdate(conversationId, update, { new: true })
      .populate('assignedTo', 'name email role')
      .lean();

    if (!conversation) throw ApiError.notFound('Conversation not found');

    try {
      const io = getIO();
      io.to(ROOMS.inbox()).emit('conversation:updated', { conversation });
    } catch {
      // Socket optional
    }

    return conversation;
  }

  /**
   * Updates conversation status (open, pending, resolved, closed).
   */
  static async updateStatus(conversationId: string, status: ConversationStatus) {
    const isClosed = status === 'closed' || status === 'resolved';
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { $set: { status, isClosed } },
      { new: true },
    )
      .populate('assignedTo', 'name email role')
      .lean();

    if (!conversation) throw ApiError.notFound('Conversation not found');

    try {
      const io = getIO();
      io.to(ROOMS.inbox()).emit('conversation:updated', { conversation });
    } catch {
      // Socket optional
    }

    return conversation;
  }

  /**
   * Toggles AI or Human handling mode.
   */
  static async setHandlingMode(conversationId: string, mode: HandlingMode, reason?: string) {
    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { $set: { handlingMode: mode } },
      { new: true },
    )
      .populate('assignedTo', 'name email role')
      .lean();

    if (!conversation) throw ApiError.notFound('Conversation not found');

    try {
      const io = getIO();
      io.to(ROOMS.inbox()).emit('conversation:handover', {
        conversationId,
        mode,
        reason:
          reason ||
          (mode === 'human' ? 'Transferred to human staff' : 'Switched back to AI Assistant'),
        conversation,
      });
      io.to(ROOMS.conversation(conversationId)).emit('conversation:updated', { conversation });
    } catch {
      // Socket optional
    }

    return conversation;
  }

  /**
   * Links a verified Booking, Event or registered Customer User to a conversation.
   */
  static async linkContext(
    conversationId: string,
    data: { bookingId?: string; eventId?: string; customerId?: string; tags?: string[] },
  ) {
    const update: Record<string, unknown> = {};
    if (data.bookingId) update.bookingId = data.bookingId;
    if (data.eventId) update.eventId = data.eventId;
    if (data.customerId) update.customerId = data.customerId;
    if (data.tags) update.tags = data.tags;

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { $set: update },
      { new: true },
    )
      .populate('assignedTo', 'name email role')
      .populate('customerId', 'name email phone avatar')
      .populate('bookingId')
      .populate('eventId')
      .lean();

    if (!conversation) throw ApiError.notFound('Conversation not found');

    try {
      const io = getIO();
      io.to(ROOMS.inbox()).emit('conversation:updated', { conversation });
    } catch {
      // Socket optional
    }

    return conversation;
  }

  /**
   * Marks conversation read for admin staff or customer.
   */
  static async markAsRead(conversationId: string, reader: 'admin' | 'customer') {
    const update =
      reader === 'admin' ? { $set: { unreadCountAdmin: 0 } } : { $set: { unreadCountCustomer: 0 } };

    const conversation = await Conversation.findByIdAndUpdate(conversationId, update, {
      new: true,
    }).lean();
    if (!conversation) throw ApiError.notFound('Conversation not found');
    return conversation;
  }
}

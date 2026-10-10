import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '@/config/env.js';
import { ApiError } from '@/utils/ApiError.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import { ConversationService } from '../services/conversation.service.js';
import { MessageService } from '../services/message.service.js';
import { ChannelConfigService } from '../services/channelConfig.service.js';
import { Conversation } from '@/models/index.js';

const envelope = (data: unknown) => ({ success: true, data });
const getParam = (param: string | string[] | undefined): string =>
  Array.isArray(param) ? param[0] : param || '';

export class CommunicationController {
  /**
   * Public: Generates or restores a secure website guest chat session.
   */
  static createWebsiteSession = asyncHandler(async (req, res) => {
    const input = z
      .object({
        sessionId: z.string().trim().max(100).optional(),
        name: z.string().trim().max(100).optional(),
        email: z.string().trim().email().optional().or(z.literal('')),
        phone: z.string().trim().max(30).optional().or(z.literal('')),
      })
      .parse(req.body || {});

    // If an authenticated user is calling, link to their account
    const authenticatedUser = req.user;
    const sessionId = input.sessionId || `guest_${crypto.randomBytes(16).toString('hex')}`;
    const displayName = authenticatedUser?.name || input.name || 'Website Visitor';
    const email = authenticatedUser?.email || input.email || undefined;
    const phone = input.phone || undefined;

    const conversation = await ConversationService.findOrCreateWebsiteConversation({
      externalContactId: sessionId,
      customerDisplayName: displayName,
      customerEmail: email,
      customerPhone: phone,
      customerId: authenticatedUser?.id ?? undefined,
    });

    const conversationIdStr = conversation._id.toString();

    // Sign a secure guest session JWT with 7 days expiration
    const token = jwt.sign(
      {
        type: 'guest_chat_session',
        sessionId,
        conversationId: conversationIdStr,
        name: displayName,
        email,
      },
      env.JWT_ACCESS_SECRET,
      {
        issuer: 'ltms-guest-session',
        expiresIn: '7d',
      },
    );

    res.json(
      envelope({
        sessionId,
        token,
        conversationId: conversationIdStr,
        conversation,
      }),
    );
  });

  /**
   * Public / Guest: Retrieves messages for a website chat session.
   * Verifies guest session token or user ownership to prevent cross-customer data leaks.
   */
  static getWebsiteMessages = asyncHandler(async (req, res) => {
    const conversationId = getParam(req.params.conversationId);
    const sessionToken =
      req.headers['x-guest-session'] || req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken || typeof sessionToken !== 'string') {
      throw ApiError.unauthorized('Guest session token required');
    }

    let isAuthorized = false;

    // Check if token is guest token
    try {
      const claims = jwt.verify(sessionToken, env.JWT_ACCESS_SECRET, {
        issuer: 'ltms-guest-session',
      }) as jwt.JwtPayload & { conversationId?: string; sessionId?: string; name?: string };
      if (claims && claims.conversationId === conversationId) {
        isAuthorized = true;
      }
    } catch {
      // not guest token, check user auth
    }

    // Check if authenticated user owns the conversation
    if (!isAuthorized && req.user) {
      const conv = await Conversation.findById(conversationId)
        .select('customerId externalContactId')
        .lean();
      if (
        conv &&
        (String(conv.customerId) === req.user.id ||
          req.user.role === 'admin' ||
          req.user.role === 'super_admin')
      ) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw ApiError.forbidden('You are not authorized to view this conversation');
    }

    const messages = await MessageService.getMessagesByConversationId(conversationId, 150);
    res.json(envelope(messages));
  });

  /**
   * Public / Guest: Sends a message in the website chat session.
   */
  static sendWebsiteMessage = asyncHandler(async (req, res) => {
    const conversationId = getParam(req.params.conversationId);
    const sessionToken =
      req.headers['x-guest-session'] || req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken || typeof sessionToken !== 'string') {
      throw ApiError.unauthorized('Guest session token required');
    }

    let sessionId: string | undefined;
    let customerName = 'Website Visitor';

    try {
      const claims = jwt.verify(sessionToken, env.JWT_ACCESS_SECRET, {
        issuer: 'ltms-guest-session',
      }) as jwt.JwtPayload & { conversationId?: string; sessionId?: string; name?: string };
      if (claims && claims.conversationId === conversationId) {
        sessionId = claims.sessionId;
        customerName = claims.name || customerName;
      }
    } catch {
      // check user
    }

    if (!sessionId && req.user) {
      const conv = await Conversation.findById(conversationId)
        .select('externalContactId customerId')
        .lean();
      if (conv && (String(conv.customerId) === req.user.id || req.user.role === 'admin')) {
        sessionId = conv.externalContactId || undefined;
        customerName = req.user.name;
      }
    }

    if (!sessionId) {
      throw ApiError.forbidden('You are not authorized to post to this conversation');
    }

    const { content } = z
      .object({
        content: z.string().trim().min(1, 'Message cannot be empty').max(5000),
      })
      .parse(req.body);

    const message = await MessageService.processInboundMessage({
      channel: 'website',
      externalContactId: sessionId,
      customerDisplayName: customerName,
      content,
    });

    res.status(201).json(envelope(message));
  });

  /**
   * Public / Guest: Explicitly requests handover to a human support agent.
   */
  static requestHandover = asyncHandler(async (req, res) => {
    const conversationId = getParam(req.params.conversationId);
    const conversation = await ConversationService.setHandlingMode(
      conversationId,
      'human',
      'Customer clicked handover button',
    );
    res.json(envelope({ success: true, handlingMode: conversation.handlingMode }));
  });

  /**
   * Public: Returns public social & contact buttons config.
   */
  static getPublicChannels = asyncHandler(async (_req, res) => {
    const data = ChannelConfigService.getPublicContactChannels();
    res.json(envelope(data));
  });

  // ==========================================
  // Admin Unified Inbox Handlers
  // ==========================================

  /**
   * Admin: Lists conversations with filtering & search.
   */
  static listAdminConversations = asyncHandler(async (req, res) => {
    const query = z
      .object({
        channel: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        handlingMode: z.string().optional(),
        assignedTo: z.string().optional(),
        search: z.string().optional(),
        page: z.coerce.number().optional(),
        limit: z.coerce.number().optional(),
      })
      .parse(req.query);

    const data = await ConversationService.listConversations(query);
    res.json(envelope(data));
  });

  /**
   * Admin: Gets a conversation by ID.
   */
  static getAdminConversation = asyncHandler(async (req, res) => {
    const conversationId = getParam(req.params.id);
    const conversation = await ConversationService.getConversationById(conversationId);
    res.json(envelope(conversation));
  });

  /**
   * Admin: Gets message thread for a conversation.
   */
  static getAdminConversationMessages = asyncHandler(async (req, res) => {
    const conversationId = getParam(req.params.id);
    const messages = await MessageService.getMessagesByConversationId(conversationId);
    // Mark as read for admin
    await ConversationService.markAsRead(conversationId, 'admin');
    res.json(envelope(messages));
  });

  /**
   * Admin: Sends staff reply through Unified Inbox.
   */
  static sendStaffReply = asyncHandler(async (req, res) => {
    const conversationId = getParam(req.params.id);
    const { content, attachments } = z
      .object({
        content: z.string().trim().min(1, 'Message cannot be empty').max(5000),
        attachments: z
          .array(
            z.object({
              name: z.string(),
              url: z.string().url(),
              mimeType: z.string(),
              sizeBytes: z.number().optional(),
            }),
          )
          .optional(),
      })
      .parse(req.body);

    const message = await MessageService.sendStaffReply({
      conversationId,
      staffUserId: req.user!.id,
      staffName: req.user!.name,
      content,
      attachments,
    });

    res.status(201).json(envelope(message));
  });

  /**
   * Admin: Assigns conversation to a staff member.
   */
  static assignStaff = asyncHandler(async (req, res) => {
    const conversationId = getParam(req.params.id);
    const { assignedTo } = z
      .object({
        assignedTo: z
          .string()
          .regex(/^[\da-f]{24}$/i)
          .nullable()
          .optional(),
      })
      .parse(req.body);

    const conversation = await ConversationService.assignStaff(conversationId, assignedTo);
    res.json(envelope(conversation));
  });

  /**
   * Admin: Updates conversation status (open, pending, resolved, closed).
   */
  static updateStatus = asyncHandler(async (req, res) => {
    const conversationId = getParam(req.params.id);
    const { status } = z
      .object({ status: z.enum(['open', 'pending', 'resolved', 'closed']) })
      .parse(req.body);

    const conversation = await ConversationService.updateStatus(conversationId, status);
    res.json(envelope(conversation));
  });

  /**
   * Admin: Switches handling mode between AI and Human.
   */
  static setHandlingMode = asyncHandler(async (req, res) => {
    const conversationId = getParam(req.params.id);
    const { mode, reason } = z
      .object({
        mode: z.enum(['ai', 'human']),
        reason: z.string().optional(),
      })
      .parse(req.body);

    const conversation = await ConversationService.setHandlingMode(conversationId, mode, reason);
    res.json(envelope(conversation));
  });

  /**
   * Admin: Links a booking, event, or customer to conversation.
   */
  static linkContext = asyncHandler(async (req, res) => {
    const conversationId = getParam(req.params.id);
    const input = z
      .object({
        bookingId: z
          .string()
          .regex(/^[\da-f]{24}$/i)
          .optional(),
        eventId: z
          .string()
          .regex(/^[\da-f]{24}$/i)
          .optional(),
        customerId: z
          .string()
          .regex(/^[\da-f]{24}$/i)
          .optional(),
        tags: z.array(z.string().trim()).optional(),
      })
      .parse(req.body);

    const conversation = await ConversationService.linkContext(conversationId, input);
    res.json(envelope(conversation));
  });

  /**
   * Admin: Returns configuration and connection status of all communication channels.
   */
  static getChannelStatuses = asyncHandler(async (_req, res) => {
    const channels = ChannelConfigService.getAdminChannelStatuses();
    const ai = ChannelConfigService.getAiStatus();
    res.json(envelope({ channels, ai }));
  });
}

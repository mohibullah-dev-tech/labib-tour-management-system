import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/authenticate.js';
import { CommunicationController } from '../controllers/communication.controller.js';
import { WebhookController } from '../controllers/webhook.controller.js';

const router = Router();
const adminOnly = [authenticate, authorize('admin', 'super_admin')];

// ==========================================
// Public & Website Live Chat Endpoints
// ==========================================
router.get('/communications/public/channels', CommunicationController.getPublicChannels);
router.post('/communications/website/session', CommunicationController.createWebsiteSession);
router.get(
  '/communications/website/conversations/:conversationId/messages',
  CommunicationController.getWebsiteMessages,
);
router.post(
  '/communications/website/conversations/:conversationId/messages',
  CommunicationController.sendWebsiteMessage,
);
router.post(
  '/communications/website/conversations/:conversationId/handover',
  CommunicationController.requestHandover,
);

// ==========================================
// External Channel Webhook Endpoints
// ==========================================
router.get('/communications/webhooks/meta', WebhookController.verifyMeta);
router.post('/communications/webhooks/meta', WebhookController.handleMeta);
router.post('/communications/webhooks/telegram', WebhookController.handleTelegram);

// ==========================================
// Admin Unified Inbox Endpoints
// ==========================================
router.get(
  '/communications/admin/channels',
  ...adminOnly,
  CommunicationController.getChannelStatuses,
);
router.get(
  '/communications/admin/conversations',
  ...adminOnly,
  CommunicationController.listAdminConversations,
);
router.get(
  '/communications/admin/conversations/:id',
  ...adminOnly,
  CommunicationController.getAdminConversation,
);
router.get(
  '/communications/admin/conversations/:id/messages',
  ...adminOnly,
  CommunicationController.getAdminConversationMessages,
);
router.post(
  '/communications/admin/conversations/:id/messages',
  ...adminOnly,
  CommunicationController.sendStaffReply,
);
router.patch(
  '/communications/admin/conversations/:id/assignment',
  ...adminOnly,
  CommunicationController.assignStaff,
);
router.patch(
  '/communications/admin/conversations/:id/status',
  ...adminOnly,
  CommunicationController.updateStatus,
);
router.patch(
  '/communications/admin/conversations/:id/handover',
  ...adminOnly,
  CommunicationController.setHandlingMode,
);
router.patch(
  '/communications/admin/conversations/:id/context',
  ...adminOnly,
  CommunicationController.linkContext,
);

export default router;

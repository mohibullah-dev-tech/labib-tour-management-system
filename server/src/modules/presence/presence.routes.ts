import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/authenticate.js';
import { PresenceController } from './presence.controller.js';

const router = Router();
const adminOnly = [authenticate, authorize('admin', 'super_admin')];

// Public presence summary (count of active travelers/visitors)
router.get('/presence/summary', PresenceController.getSummary);

// Admin-only presence roster
router.get('/presence/active-users', ...adminOnly, PresenceController.getActiveUsers);

export { router as presenceRoutes };


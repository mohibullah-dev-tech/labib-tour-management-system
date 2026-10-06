import { Router, type Request, type Response } from 'express';
import { getDatabaseStatus } from '@/config/database.js';
import { env } from '@/config/env.js';

/**
 * Root API router. Feature modules (auth, tours, bookings, payments, ...)
 * will each expose their own `Router` from `src/modules/<feature>/*.routes.ts`
 * and get mounted here — e.g. `router.use('/auth', authRoutes)`.
 * Keeps this file a thin composition root instead of a growing switchboard.
 */
const router = Router();

export function healthHandler(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    data: {
      api: 'ok',
      database: getDatabaseStatus(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
  });
}

router.get('/health', healthHandler);

export default router;

import { Router } from 'express';

/**
 * Root API router. Feature modules (auth, tours, bookings, payments, ...)
 * will each expose their own `Router` from `src/modules/<feature>/*.routes.ts`
 * and get mounted here — e.g. `router.use('/auth', authRoutes)`.
 * Keeps this file a thin composition root instead of a growing switchboard.
 */
const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'LTMS API is healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;

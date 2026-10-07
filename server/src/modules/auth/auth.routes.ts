import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '@/controllers/auth.controller.js';
import { authenticate } from '@/middlewares/authenticate.js';
import { requireTrustedOrigin } from '@/middlewares/trustedOrigin.js';
import { asyncHandler } from '@/utils/asyncHandler.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMITED',
      message: 'Too many authentication attempts; try again later',
    },
  },
});

const router = Router();
router.use(authLimiter);
router.post('/register', requireTrustedOrigin, asyncHandler(authController.register));
router.post('/login', requireTrustedOrigin, asyncHandler(authController.login));
router.post('/refresh', requireTrustedOrigin, asyncHandler(authController.refresh));
router.post('/logout', requireTrustedOrigin, asyncHandler(authController.logout));
router.get('/me', authenticate, asyncHandler(authController.me));
router.post('/change-password', authenticate, asyncHandler(authController.changePassword));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/verify-reset-code', asyncHandler(authController.verifyResetCode));
router.post('/reset-password', asyncHandler(authController.resetPassword));
router.post('/verify-email', asyncHandler(authController.verifyEmail));

export default router;

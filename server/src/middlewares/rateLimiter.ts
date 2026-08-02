import rateLimit from 'express-rate-limit';
import { env } from '@/config/env.js';

/**
 * Global API rate limiter. Stricter, endpoint-specific limiters (e.g. login,
 * OTP requests) will be layered on top of this in the Auth phase.
 */
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

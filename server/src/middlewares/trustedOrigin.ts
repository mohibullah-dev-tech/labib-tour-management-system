import type { RequestHandler } from 'express';
import { env } from '@/config/env.js';
import { ApiError } from '@/utils/ApiError.js';

/** Cookie-authenticated mutations accept browser requests only from the configured client origin. */
export const requireTrustedOrigin: RequestHandler = (req, _res, next) => {
  const origin = req.get('origin');
  if (!origin || origin !== env.CLIENT_URL)
    return next(ApiError.forbidden('Untrusted request origin'));
  next();
};

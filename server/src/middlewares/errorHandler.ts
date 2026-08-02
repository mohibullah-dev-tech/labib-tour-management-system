import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '@/utils/ApiError.js';
import { logger } from '@/utils/logger.js';
import { env } from '@/config/env.js';

/**
 * Single global error handler (must be the LAST middleware registered).
 * Every route/controller can just `throw` or call `next(err)` — no
 * try/catch boilerplate scattered across the codebase, and the response
 * shape is guaranteed consistent for the frontend to rely on.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof ApiError) {
    if (!err.isOperational) {
      logger.error(`${req.method} ${req.originalUrl} — ${err.message}`, { stack: err.stack });
    }
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { errors: err.details } : {}),
    });
    return;
  }

  const error = err as Error;
  logger.error(`${req.method} ${req.originalUrl} — ${error.message}`, { stack: error.stack });

  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    ...(env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
}

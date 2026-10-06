import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { ApiError } from '@/utils/ApiError.js';
import { logger } from '@/utils/logger.js';
import { env } from '@/config/env.js';

type MongoServerErrorLike = Error & { code?: number; keyValue?: Record<string, unknown> };

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.fromEntries(
      Object.entries(err.errors).map(([field, issue]) => [field, issue.message]),
    );
    res
      .status(400)
      .json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Document validation failed', details },
      });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res
      .status(400)
      .json({
        success: false,
        error: { code: 'INVALID_ID', message: `Invalid value for ${err.path}` },
      });
    return;
  }

  const mongoError = err as MongoServerErrorLike;
  if (mongoError?.code === 11000) {
    const field = Object.keys(mongoError.keyValue ?? {})[0];
    res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_RESOURCE',
        message: field
          ? `A record with this ${field} already exists`
          : 'A duplicate record already exists',
      },
    });
    return;
  }

  if (err instanceof ApiError) {
    if (!err.isOperational)
      logger.error(`${req.method} ${req.originalUrl} — ${err.message}`, { stack: err.stack });
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  const error = err instanceof Error ? err : new Error('Unknown error');
  logger.error(`${req.method} ${req.originalUrl} — ${error.message}`, { stack: error.stack });
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    },
  });
}

import type { Request, Response } from 'express';
import { ApiError } from '@/utils/ApiError.js';

export function notFoundHandler(req: Request, _res: Response): void {
  throw ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`);
}

import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from '@/config/env.js';
import { morganStream } from '@/utils/logger.js';
import { apiRateLimiter } from '@/middlewares/rateLimiter.js';
import { errorHandler } from '@/middlewares/errorHandler.js';
import { notFoundHandler } from '@/middlewares/notFound.js';
import apiRouter from '@/routes/index.js';

/**
 * Express app is assembled here, separately from server.ts (which owns
 * HTTP server lifecycle). This split keeps the app importable without opening
 * a database connection or starting a real listening port.
 */
export function createApp(): Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — allow known client origins, Vercel deployments, and allow credentials for httpOnly cookies
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/$/, '');
        const cleanClientUrl = (env.CLIENT_URL || '').replace(/\/$/, '');

        if (
          cleanOrigin === cleanClientUrl ||
          cleanOrigin.endsWith('.vercel.app') ||
          cleanOrigin.includes('localhost') ||
          cleanOrigin.includes('127.0.0.1')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }),
  );

  // Body/cookie parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  // Response compression
  app.use(compression());

  // HTTP request logging -> routed through Winston
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: morganStream }));

  // Rate limiting for all /api routes
  app.use('/api', apiRateLimiter);

  // API routes
  app.use('/api', apiRouter);
  app.use('/api/v1', apiRouter);

  // Root welcome / health ping
  app.get('/', (_req, res) => {
    res.json({
      name: 'Labib Tour Management System API',
      status: 'active',
      environment: env.NODE_ENV,
      healthCheck: '/api/v1/health',
      timestamp: new Date().toISOString(),
    });
  });

  // 404 + centralized error handler (must be registered last, in this order)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

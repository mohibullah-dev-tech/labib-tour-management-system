import { createServer } from 'node:http';
import { createApp } from '@/app.js';
import { initSocketServer } from '@/sockets/index.js';
import { connectDatabase } from '@/config/database.js';
import { connectRedis } from '@/config/redis.js';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';

/**
 * Process entry point. Owns startup order and graceful shutdown —
 * everything else (app assembly, DB, Redis, sockets) is imported and
 * composed here so there is exactly one place that boots/tears down
 * the process.
 */
async function bootstrap(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  const app = createApp();
  const httpServer = createServer(app);
  initSocketServer(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(`🚀 LTMS API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    httpServer.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
    // Force-exit if shutdown hangs
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
  });
}

bootstrap().catch((err) => {
  logger.error(`Failed to start server: ${err}`);
  process.exit(1);
});

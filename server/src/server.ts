import { createServer } from 'node:http';
import { createApp } from '@/app.js';
import { connectDatabase, disconnectDatabase } from '@/config/database.js';
import { connectRedis, disconnectRedis } from '@/config/redis.js';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';

async function bootstrap(): Promise<void> {
  const httpServer = createServer(createApp());

  await new Promise<void>((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(env.PORT, () => {
      httpServer.off('error', reject);
      logger.info(`LTMS API running on port ${env.PORT} [${env.NODE_ENV}]`);
      resolve();
    });
  });

  // Connect databases in background resiliently
  void connectRedis();

  let reconnectTimer: NodeJS.Timeout | undefined;
  const connectWithRetry = async (): Promise<void> => {
    try {
      await connectDatabase();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = undefined;
    } catch (error) {
      logger.warn('MongoDB is unavailable; API remains available in degraded mode', { error });
      reconnectTimer = setTimeout(() => {
        void connectWithRetry();
      }, 15_000);
      reconnectTimer.unref();
    }
  };
  void connectWithRetry();

  let isShuttingDown = false;
  const shutdown = (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info(`${signal} received. Shutting down gracefully.`);
    if (reconnectTimer) clearTimeout(reconnectTimer);
    const timeout = setTimeout(() => process.exit(1), 10_000);
    timeout.unref();
    httpServer.close((error) => {
      if (error) logger.error('HTTP server close failed', { error });
      void Promise.allSettled([disconnectDatabase(), disconnectRedis()]).then(() => {
        process.exit(error ? 1 : 0);
      });
    });
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason: unknown) =>
    logger.error('Unhandled rejection', { reason }),
  );
}

bootstrap().catch(async (error: unknown) => {
  logger.error('Failed to start server', { error });
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});

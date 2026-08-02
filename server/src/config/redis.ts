import Redis from 'ioredis';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';

/**
 * Single shared ioredis client. Used for: session/refresh-token storage,
 * rate limiting store, caching frequently-read data (e.g. tour listings),
 * and as the Socket.IO adapter backing store in a multi-instance deployment.
 */
export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redisClient.on('connect', () => logger.info('Redis connected'));
redisClient.on('error', (err) => logger.error(`Redis connection error: ${err}`));

export async function connectRedis(): Promise<void> {
  await redisClient.connect();
}

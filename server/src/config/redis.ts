import { Redis } from 'ioredis';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';

export type RedisConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'unavailable';

let isConnecting = false;

/**
 * Single shared ioredis client.
 * Configured with retry strategy, lazy connect, and error resilience.
 */
export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  enableOfflineQueue: false,
  retryStrategy(times) {
    if (times > 5) {
      logger.warn('Redis retry attempts exceeded; backing off');
      return null; // Stop retrying automatically to prevent log spam
    }
    return Math.min(times * 500, 2000);
  },
});

redisClient.on('connect', () => {
  logger.info('Redis connection established');
});

redisClient.on('ready', () => {
  logger.info('Redis client ready');
});

redisClient.on('error', (err: Error) => {
  logger.warn(`Redis connection warning: ${err.message}`);
});

redisClient.on('close', () => {
  logger.info('Redis connection closed');
});

/**
 * Returns current Redis connection status for health checks.
 */
export function getRedisStatus(): RedisConnectionStatus {
  const status = redisClient.status;
  if (status === 'ready' || status === 'connect') return 'connected';
  if (status === 'connecting' || status === 'reconnecting') return 'connecting';
  if (status === 'close' || status === 'end') return 'disconnected';
  return 'unavailable';
}

/**
 * Check if Redis is actively connected and ready to process commands.
 */
export function isRedisConnected(): boolean {
  return redisClient.status === 'ready' || redisClient.status === 'connect';
}

/**
 * Connects to Redis safely without duplicate connections or unhandled crashes.
 */
export async function connectRedis(): Promise<void> {
  const status = redisClient.status;
  if (status === 'ready' || status === 'connect' || isConnecting) {
    return;
  }

  isConnecting = true;
  try {
    await redisClient.connect();
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.warn('Redis is unavailable; proceeding in degraded mode for seat locks if needed', {
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    isConnecting = false;
  }
}

/**
 * Graceful shutdown for Redis client.
 */
export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient.status !== 'end') {
      await redisClient.quit();
      logger.info('Redis disconnected gracefully');
    }
  } catch (error) {
    logger.warn('Error during Redis disconnection', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

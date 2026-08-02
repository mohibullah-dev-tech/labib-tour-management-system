import winston from 'winston';
import { env } from '@/config/env.js';

/**
 * Winston logger — used everywhere instead of console.log so that:
 * - logs are structured and leveled (info/warn/error/debug)
 * - production can ship to a file/log-aggregator without code changes
 * - Morgan's HTTP logs and app logs share one consistent format
 */
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.combine(winston.format.colorize(), winston.format.simple()),
  ),
  transports: [new winston.transports.Console()],
});

export const morganStream = {
  write: (message: string) => logger.http?.(message.trim()) ?? logger.info(message.trim()),
};

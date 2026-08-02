import type { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';

/**
 * Socket.IO bootstrap. Real-time features (live booking updates, admin
 * notifications, support chat) will register their own namespaces/handlers
 * here as separate modules — kept as a placeholder connection log for now.
 */
export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

import type { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from './socketTypes.js';
import { socketAuthMiddleware } from './socketAuth.js';
import { registerEventHandlers } from './handlers/eventHandlers.js';
import { registerLocationHandlers } from './handlers/locationHandlers.js';
import { registerSeatBroadcaster } from './handlers/seatHandlers.js';
import { registerMessageHandlers } from './handlers/messageHandlers.js';
import {
  registerNotificationHandlers,
  registerNotificationBroadcaster,
} from './handlers/notificationHandlers.js';

let ioInstance: SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

export function initSocketServer(
  httpServer: HttpServer,
): SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
  const allowedOrigins = [
    env.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  const io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // Authentication Middleware
  io.use(socketAuthMiddleware);

  // Register Broadcasters
  registerSeatBroadcaster(io);
  registerNotificationBroadcaster(io);

  // Client Connection Handler
  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(
      `Socket connected: ${socket.id} (User: ${user.name} [${user.id}], Role: ${user.role})`,
    );

    // Register all feature handlers
    registerEventHandlers(io, socket);
    registerLocationHandlers(io, socket);
    registerMessageHandlers(io, socket);
    registerNotificationHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (User: ${user.id}, Reason: ${reason})`);
      socket.data.joinedRooms?.clear();
    });

    socket.on('error', (err) => {
      logger.error(`Socket error on socket ${socket.id}:`, { err });
    });
  });

  ioInstance = io;
  logger.info('Socket.IO real-time server initialized successfully');
  return io;
}

export function getIO(): SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> {
  if (!ioInstance) {
    throw new Error('Socket.IO has not been initialized. Call initSocketServer() first.');
  }
  return ioInstance;
}

export async function closeSocketServer(): Promise<void> {
  if (ioInstance) {
    await new Promise<void>((resolve) => {
      ioInstance!.close(() => {
        logger.info('Socket.IO server closed');
        ioInstance = null;
        resolve();
      });
    });
  }
}

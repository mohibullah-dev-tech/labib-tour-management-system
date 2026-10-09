import type { Socket, Server as SocketIOServer } from 'socket.io';
import { z } from 'zod';
import { ROOMS } from '../socketRooms.js';
import { Notification } from '@/models/index.js';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  NotificationPayload,
} from '../socketTypes.js';
import { logger } from '@/utils/logger.js';

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
type TypedIO = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let ioInstance: TypedIO | null = null;

export function registerNotificationBroadcaster(io: TypedIO): void {
  ioInstance = io;
}

const notificationIdSchema = z.object({
  id: z.string().regex(/^[\da-f]{24}$/i, 'Invalid notification ID'),
});

export function registerNotificationHandlers(_io: TypedIO, socket: TypedSocket): void {
  // Mark single notification as read
  socket.on('notification:read', async (payload, callback) => {
    try {
      const parsed = notificationIdSchema.safeParse(payload);
      if (!parsed.success) {
        callback?.({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid notification ID' },
        });
        return;
      }

      const { id } = parsed.data;
      const userId = socket.data.user.id;

      const updated = await Notification.findOneAndUpdate(
        { _id: id, userId },
        { isRead: true, readAt: new Date() },
        { new: true },
      );

      if (!updated) {
        callback?.({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Notification not found' },
        });
        return;
      }

      // Notify other active sockets/devices of this user
      socket.to(ROOMS.user(userId)).emit('notification:read', { id });
      socket.emit('notification:read', { id });

      callback?.({ success: true });
    } catch (error) {
      logger.error('Error handling notification:read', { error });
      callback?.({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to mark notification as read' },
      });
    }
  });

  // Mark all unread notifications as read
  socket.on('notification:read-all', async (callback) => {
    try {
      const userId = socket.data.user.id;

      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() },
      );

      // Notify all active sessions of this user
      socket.to(ROOMS.user(userId)).emit('notification:read-all');
      socket.emit('notification:read-all');

      callback?.({ success: true });
    } catch (error) {
      logger.error('Error handling notification:read-all', { error });
      callback?.({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to mark all notifications as read' },
      });
    }
  });
}

/**
 * Emit a new notification to a specific user's room.
 */
export function emitNotification(userId: string, payload: NotificationPayload): void {
  if (!ioInstance) return;
  ioInstance.to(ROOMS.user(userId)).emit('notification:new', payload);
  logger.debug(`Emitted notification:new to user ${userId} (${payload.type})`);
}

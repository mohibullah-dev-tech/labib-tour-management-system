import type { Socket, Server as SocketIOServer } from 'socket.io';
import { z } from 'zod';
import { ROOMS } from '../socketRooms.js';
import { verifyEventAccess } from '../socketAuth.js';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '../socketTypes.js';
import { logger } from '@/utils/logger.js';

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

const eventIdSchema = z.string().regex(/^[\da-f]{24}$/i, 'Invalid event ID');

export function registerEventHandlers(
  _io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  socket: TypedSocket,
): void {
  socket.on('event:join', async (payload, callback) => {
    try {
      const parsed = eventIdSchema.safeParse(payload?.eventId);
      if (!parsed.success) {
        callback?.({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid tour event ID' },
        });
        return;
      }

      const eventId = parsed.data;
      const isAuthorized = await verifyEventAccess(socket.data.user, eventId);
      if (!isAuthorized) {
        callback?.({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You are not authorized to access real-time events for this tour',
          },
        });
        return;
      }

      const mainRoom = ROOMS.event(eventId);
      const seatRoom = ROOMS.seat(eventId);
      const locationRoom = ROOMS.liveLocation(eventId);

      await socket.join([mainRoom, seatRoom, locationRoom]);
      socket.data.joinedRooms.add(mainRoom);
      socket.data.joinedRooms.add(seatRoom);
      socket.data.joinedRooms.add(locationRoom);

      // Join role-specific subrooms
      if (socket.data.user.role === 'host') {
        const hostRoom = ROOMS.eventHosts(eventId);
        await socket.join(hostRoom);
        socket.data.joinedRooms.add(hostRoom);
      } else if (socket.data.user.role === 'guest') {
        const guestRoom = ROOMS.eventGuests(eventId);
        await socket.join(guestRoom);
        socket.data.joinedRooms.add(guestRoom);
      } else if (socket.data.user.role === 'admin' || socket.data.user.role === 'super_admin') {
        const adminRoom = ROOMS.eventAdmins(eventId);
        await socket.join(adminRoom);
        socket.data.joinedRooms.add(adminRoom);
      }

      logger.debug(
        `User ${socket.data.user.id} (${socket.data.user.role}) joined event room: ${eventId}`,
      );

      callback?.({ success: true });
    } catch (error) {
      logger.error('Error handling event:join', { error });
      callback?.({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to join event room' },
      });
    }
  });

  socket.on('event:leave', async (payload, callback) => {
    try {
      const parsed = eventIdSchema.safeParse(payload?.eventId);
      if (!parsed.success) {
        callback?.({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid tour event ID' },
        });
        return;
      }

      const eventId = parsed.data;
      const mainRoom = ROOMS.event(eventId);
      const seatRoom = ROOMS.seat(eventId);
      const locationRoom = ROOMS.liveLocation(eventId);

      await socket.leave(mainRoom);
      await socket.leave(seatRoom);
      await socket.leave(locationRoom);

      socket.data.joinedRooms.delete(mainRoom);
      socket.data.joinedRooms.delete(seatRoom);
      socket.data.joinedRooms.delete(locationRoom);

      callback?.({ success: true });
    } catch (error) {
      logger.error('Error handling event:leave', { error });
      callback?.({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to leave event room' },
      });
    }
  });
}

import type { Socket, Server as SocketIOServer } from 'socket.io';
import { z } from 'zod';
import { ROOMS } from '../socketRooms.js';
import { verifyHostAssignedToEvent } from '../socketAuth.js';
import { LiveLocation, TourEvent } from '@/models/index.js';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  ServerLocationUpdatePayload,
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

const eventIdSchema = z.string().regex(/^[\da-f]{24}$/i, 'Invalid event ID');

const locationStartSchema = z.object({
  eventId: eventIdSchema,
  initialCoords: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracy: z.number().min(0).optional(),
      heading: z.number().min(0).max(360).nullable().optional(),
      speed: z.number().min(0).nullable().optional(),
    })
    .optional(),
  timestamp: z.number().optional(),
});

const locationUpdateSchema = z.object({
  eventId: eventIdSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).nullable().optional(),
  speed: z.number().min(0).nullable().optional(),
  timestamp: z.number().optional(),
});

const locationStopSchema = z.object({
  eventId: eventIdSchema,
  reason: z.enum(['host_stopped', 'tour_ended', 'emergency']).optional(),
  timestamp: z.number().optional(),
});

// In-memory throttle timestamps to prevent flooding DB with dozens of GPS updates per second
const lastLocationUpdateTimes = new Map<string, number>();

export function registerLocationHandlers(io: TypedIO, socket: TypedSocket): void {
  // 1. Host starts sharing location
  socket.on('location:start', async (payload, callback) => {
    try {
      const parsed = locationStartSchema.safeParse(payload);
      if (!parsed.success) {
        callback?.({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid location parameters' },
        });
        return;
      }

      const { eventId, initialCoords } = parsed.data;
      const hostId = socket.data.user.id;

      // Verify user is assigned host
      const isAssigned = await verifyHostAssignedToEvent(hostId, eventId);
      if (!isAssigned) {
        callback?.({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only the assigned host can initiate location sharing for this tour',
          },
        });
        return;
      }

      const event = await TourEvent.findById(eventId).select('busId').lean();
      if (!event) {
        callback?.({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Event not found' },
        });
        return;
      }

      const now = new Date();
      await LiveLocation.findOneAndUpdate(
        { eventId },
        {
          $set: {
            hostId,
            busId: event.busId,
            latitude: initialCoords?.latitude ?? 23.8103, // Default Dhaka fallback if initial not provided
            longitude: initialCoords?.longitude ?? 90.4125,
            accuracy: initialCoords?.accuracy ?? 10,
            headingDegrees: initialCoords?.heading ?? 0,
            speed: initialCoords?.speed ?? 0,
            status: 'active',
            timestamp: now,
          },
        },
        { upsert: true, new: true },
      );

      // Broadcast location:started to the event's live-location room
      io.to(ROOMS.liveLocation(eventId)).emit('location:started', {
        eventId,
        hostId,
      });

      logger.info(`Live location sharing started by Host ${hostId} for event ${eventId}`);
      callback?.({ success: true });
    } catch (error) {
      logger.error('Error starting live location', { error });
      callback?.({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to start live location' },
      });
    }
  });

  // 2. Host sends continuous location update
  socket.on('location:update', async (payload, callback) => {
    try {
      const parsed = locationUpdateSchema.safeParse(payload);
      if (!parsed.success) {
        callback?.({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid coordinates' },
        });
        return;
      }

      const { eventId, latitude, longitude, accuracy, heading, speed } = parsed.data;
      const hostId = socket.data.user.id;

      // Throttle DB updates to at most one write per 1.5 seconds per event
      const nowMs = Date.now();
      const lastUpdate = lastLocationUpdateTimes.get(eventId) || 0;
      const shouldWriteToDb = nowMs - lastUpdate >= 1500;

      if (shouldWriteToDb) {
        lastLocationUpdateTimes.set(eventId, nowMs);
        const isAssigned = await verifyHostAssignedToEvent(hostId, eventId);
        if (!isAssigned) {
          callback?.({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Not authorized for this event' },
          });
          return;
        }

        await LiveLocation.updateOne(
          { eventId, hostId },
          {
            $set: {
              latitude,
              longitude,
              accuracy: accuracy ?? 10,
              headingDegrees: heading ?? null,
              speed: speed ?? null,
              status: 'active',
              timestamp: new Date(),
            },
          },
        );
      }

      // Broadcast real-time location immediately to listening guests & admins
      const broadcastPayload: ServerLocationUpdatePayload = {
        eventId,
        hostId,
        latitude,
        longitude,
        accuracy,
        heading,
        speed,
        status: 'active',
        timestamp: new Date().toISOString(),
      };

      io.to(ROOMS.liveLocation(eventId)).emit('location:update', broadcastPayload);
      callback?.({ success: true });
    } catch (error) {
      logger.error('Error updating live location', { error });
      callback?.({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to broadcast location' },
      });
    }
  });

  // 3. Host stops sharing location
  socket.on('location:stop', async (payload, callback) => {
    try {
      const parsed = locationStopSchema.safeParse(payload);
      if (!parsed.success) {
        callback?.({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid parameters' },
        });
        return;
      }

      const { eventId, reason } = parsed.data;
      const hostId = socket.data.user.id;

      const isAssigned = await verifyHostAssignedToEvent(hostId, eventId);
      if (!isAssigned) {
        callback?.({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Not authorized for this event' },
        });
        return;
      }

      await LiveLocation.updateOne(
        { eventId, hostId },
        {
          $set: {
            status: 'stopped',
            timestamp: new Date(),
          },
        },
      );

      lastLocationUpdateTimes.delete(eventId);

      // Broadcast location:stopped
      io.to(ROOMS.liveLocation(eventId)).emit('location:stopped', {
        eventId,
        hostId,
        reason: reason || 'host_stopped',
      });

      logger.info(`Live location sharing stopped by Host ${hostId} for event ${eventId}`);
      callback?.({ success: true });
    } catch (error) {
      logger.error('Error stopping live location', { error });
      callback?.({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to stop location sharing' },
      });
    }
  });
}

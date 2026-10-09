import type { Server as SocketIOServer } from 'socket.io';
import { ROOMS } from '../socketRooms.js';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  SeatLockedPayload,
  SeatReleasedPayload,
  SeatExpiredPayload,
  SeatBookedPayload,
} from '../socketTypes.js';
import { logger } from '@/utils/logger.js';

type TypedIO = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let ioInstance: TypedIO | null = null;

export function registerSeatBroadcaster(io: TypedIO): void {
  ioInstance = io;
}

/**
 * Broadcast seat:locked to all clients monitoring the event's seat map.
 * Anonymizes lockedBy to protect guest privacy.
 */
export function broadcastSeatLocked(eventId: string, seats: string[], expiresAt: string): void {
  if (!ioInstance) return;
  const payload: SeatLockedPayload = {
    eventId,
    seats,
    lockedBy: 'held',
    expiresAt,
  };
  ioInstance.to(ROOMS.seat(eventId)).emit('seat:locked', payload);
  logger.debug(`Broadcasted seat:locked for event ${eventId}, seats: ${seats.join(',')}`);
}

/**
 * Broadcast seat:released when temporary holds are freed or unselected.
 */
export function broadcastSeatReleased(eventId: string, seats: string[]): void {
  if (!ioInstance) return;
  const payload: SeatReleasedPayload = {
    eventId,
    seats,
  };
  ioInstance.to(ROOMS.seat(eventId)).emit('seat:released', payload);
  logger.debug(`Broadcasted seat:released for event ${eventId}, seats: ${seats.join(',')}`);
}

/**
 * Broadcast seat:expired when TTL elapses.
 */
export function broadcastSeatExpired(eventId: string, seats: string[]): void {
  if (!ioInstance) return;
  const payload: SeatExpiredPayload = {
    eventId,
    seats,
  };
  ioInstance.to(ROOMS.seat(eventId)).emit('seat:expired', payload);
  logger.debug(`Broadcasted seat:expired for event ${eventId}, seats: ${seats.join(',')}`);
}

/**
 * Broadcast seat:booked when a booking transaction permanently commits in MongoDB.
 */
export function broadcastSeatBooked(eventId: string, seats: string[], bookingId?: string): void {
  if (!ioInstance) return;
  const payload: SeatBookedPayload = {
    eventId,
    seats,
    bookingId,
  };
  ioInstance.to(ROOMS.seat(eventId)).emit('seat:booked', payload);
  logger.debug(`Broadcasted seat:booked for event ${eventId}, seats: ${seats.join(',')}`);
}

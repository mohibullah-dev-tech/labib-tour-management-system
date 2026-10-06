/**
 * Socket.io Real-Time Tracking Event Contracts
 * Labib Tour Management System (LTMS) — Phase 11
 *
 * NOTE: These typed contracts prepare the frontend architecture for the
 * upcoming Socket.io real-time server integration without building
 * real socket connections yet.
 *
 * SECURITY NOTICE:
 * - Backend must verify that the emitting socket's hostId is authorized for eventId.
 * - Backend must verify that subscribing guest has an active booking for eventId.
 */

import type { LocationSharingStatus, LiveLocation } from './location.types';

// ==========================================
// Host -> Server Payloads
// ==========================================

export interface LocationStartPayload {
  eventId: string;
  hostId: string;
  initialCoords?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    heading?: number | null;
    speed?: number | null;
  };
  timestamp: number;
}

export interface LocationUpdatePayload {
  eventId: string;
  hostId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface LocationStopPayload {
  eventId: string;
  hostId: string;
  reason?: 'host_stopped' | 'tour_ended' | 'emergency';
  timestamp: number;
}

export interface LocationStatusPayload {
  eventId: string;
  hostId: string;
  status: LocationSharingStatus;
  timestamp: number;
}

// ==========================================
// Guest / Admin -> Server Room Subscriptions
// ==========================================

export interface JoinEventLocationPayload {
  eventId: string;
}

export interface LeaveEventLocationPayload {
  eventId: string;
}

// ==========================================
// Server -> Client Broadcast Payloads
// ==========================================

export interface ServerLocationUpdateEvent {
  eventId: string;
  location: LiveLocation;
}

export interface ServerLocationStatusEvent {
  eventId: string;
  status: LocationSharingStatus;
  message?: string;
  timestamp: number;
}

// ==========================================
// Socket.io Type Definitions (for typed client socket)
// ==========================================

export interface SocketClientToServerEvents {
  'location:start': (payload: LocationStartPayload) => void;
  'location:update': (payload: LocationUpdatePayload) => void;
  'location:stop': (payload: LocationStopPayload) => void;
  'location:status': (payload: LocationStatusPayload) => void;
  'event:join-location': (payload: JoinEventLocationPayload) => void;
  'event:leave-location': (payload: LeaveEventLocationPayload) => void;
}

export interface SocketServerToClientEvents {
  'location:update': (payload: ServerLocationUpdateEvent) => void;
  'location:status': (payload: ServerLocationStatusEvent) => void;
  'location:error': (error: { code: string; message: string }) => void;
}

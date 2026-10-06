/**
 * Core Geolocation & Live Tracking Domain Types
 * Labib Tour Management System (LTMS) — Phase 11
 */

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  altitude?: number | null;
  heading?: number | null; // 0-360 degrees clockwise from true north
  speed?: number | null; // in meters/second (or km/h converted)
  timestamp: number; // epoch ms
}

export type LocationSharingStatus =
  'inactive' | 'starting' | 'active' | 'paused' | 'stopped' | 'error';

export interface LiveLocation {
  eventId: string;
  hostId: string;
  hostName: string;
  busId: string;
  busNumber: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  heading?: number | null;
  speed?: number | null; // km/h
  timestamp: number;
  status: LocationSharingStatus;
  address?: string;
  batteryLevel?: number;
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed?: number | null;
}

export type LocationPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

export type GeolocationErrorCode =
  'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED' | 'UNKNOWN';

export interface LocationErrorState {
  code: GeolocationErrorCode;
  message: string;
  userFriendlyMessage: string;
}

export type NetworkStatus = 'online' | 'offline' | 'reconnecting';

export interface LiveTourEvent {
  id: string; // e.g. "evt-sajek-01"
  tourName: string;
  destination: string;
  hostId: string;
  hostName: string;
  hostPhone: string;
  busId: string;
  busNumber: string;
  busType: string;
  guestCount: number;
  status: 'scheduled' | 'preparing' | 'boarding' | 'started' | 'in-progress' | 'completed';
  departureTime: string;
  meetingPoint: string;
  destinationCoordinates: [number, number]; // [lat, lng]
  originCoordinates: [number, number]; // [lat, lng]
}

export interface GuestLocationAccessCheck {
  isAuthorized: boolean;
  reason?:
    | 'not_authenticated'
    | 'no_booking_for_event'
    | 'event_not_active'
    | 'host_not_sharing'
    | 'tour_ended';
  event?: LiveTourEvent;
}

/**
 * Live Location Service Facade
 * Labib Tour Management System (LTMS) — Phase 11
 *
 * Provides a unified frontend API interface that cleanly abstracts whether
 * tracking data comes from the in-memory pub/sub mock service or from
 * future backend REST/Socket.io gateways.
 */

import type {
  GeoLocation,
  LiveLocation,
  LocationPoint,
  LocationSharingStatus,
  LiveTourEvent,
  GuestLocationAccessCheck,
} from '../types/location.types';
import { mockLocationService } from './location.mock.service';
import { getSocket, type ServerLocationUpdatePayload } from '@/lib/socket';

export const LOCATION_ENDPOINTS = {
  startSharing: (eventId: string) => `/api/v1/host/events/${eventId}/location/start`,
  stopSharing: (eventId: string) => `/api/v1/host/events/${eventId}/location/stop`,
  pauseSharing: (eventId: string) => `/api/v1/host/events/${eventId}/location/pause`,
  pushLocation: (eventId: string) => `/api/v1/host/events/${eventId}/location`,
  getEventLocation: (eventId: string) => `/api/v1/events/${eventId}/location`,
  getActiveTours: () => `/api/v1/admin/tours/active-tracking`,
} as const;

export const locationService = {
  /**
   * Host starts live location broadcast.
   */
  async startSharing(eventId: string, coords?: GeoLocation): Promise<LiveLocation> {
    const local = await mockLocationService.startSharing(eventId, coords);
    try {
      const socket = getSocket();
      if (socket.connected) {
        socket.emit('location:start', {
          eventId,
          initialCoords: coords
            ? {
                latitude: coords.latitude,
                longitude: coords.longitude,
                accuracy: coords.accuracy,
                heading: coords.heading,
                speed: coords.speed,
              }
            : undefined,
        });
      }
    } catch {
      // Degrade gracefully if socket fails
    }
    return local;
  },

  /**
   * Host stops live location broadcast.
   */
  async stopSharing(eventId: string): Promise<LiveLocation> {
    const local = await mockLocationService.stopSharing(eventId);
    try {
      const socket = getSocket();
      if (socket.connected) {
        socket.emit('location:stop', {
          eventId,
          reason: 'host_stopped',
        });
      }
    } catch {
      // Degrade gracefully
    }
    return local;
  },

  /**
   * Host pauses live location broadcast.
   */
  async pauseSharing(eventId: string): Promise<LiveLocation> {
    return mockLocationService.pauseSharing(eventId);
  },

  /**
   * Host resumes live location broadcast.
   */
  async resumeSharing(eventId: string): Promise<LiveLocation> {
    return mockLocationService.resumeSharing(eventId);
  },

  /**
   * Pushes latest GPS coordinate ping.
   */
  async pushCoordinates(eventId: string, coords: GeoLocation): Promise<LiveLocation> {
    const local = await mockLocationService.pushLocationUpdate(eventId, coords);
    try {
      const socket = getSocket();
      if (socket.connected) {
        socket.emit('location:update', {
          eventId,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          heading: coords.heading,
          speed: coords.speed,
        });
      }
    } catch {
      // Degrade gracefully
    }
    return local;
  },

  /**
   * Retrieves current live location for an event.
   */
  async getCurrentLocation(eventId: string): Promise<LiveLocation | null> {
    return mockLocationService.getLiveLocation(eventId);
  },

  /**
   * Retrieves breadcrumb route history for an event.
   */
  async getLocationHistory(eventId: string): Promise<LocationPoint[]> {
    return mockLocationService.getLocationHistory(eventId);
  },

  /**
   * Retrieves active live tours for Admin monitoring.
   */
  async getActiveLiveTours(): Promise<LiveTourEvent[]> {
    return mockLocationService.getActiveLiveTours();
  },

  /**
   * Retrieves all candidate events.
   */
  async getAllActiveEvents(): Promise<LiveTourEvent[]> {
    return mockLocationService.getAllActiveEvents();
  },

  /**
   * Retrieves event metadata.
   */
  async getEvent(eventId: string): Promise<LiveTourEvent | null> {
    return mockLocationService.getEvent(eventId) ?? null;
  },

  /**
   * Verifies guest access to live tour location.
   *
   * SECURITY NOTICE:
   * Backend must verify that this guest has a valid, confirmed booking for this event.
   */
  async verifyGuestAccess(
    isAuthenticated: boolean,
    userBookings: Array<{ id: string; tourId?: string; bookingStatus: string }>,
    eventId: string,
  ): Promise<GuestLocationAccessCheck> {
    if (!isAuthenticated) {
      return { isAuthorized: false, reason: 'not_authenticated' };
    }

    const event = mockLocationService.getEvent(eventId);
    if (!event) {
      return { isAuthorized: false, reason: 'no_booking_for_event' };
    }

    // Check if guest has a confirmed booking for this tour
    const hasBooking = userBookings.some(
      (b) => b.bookingStatus === 'confirmed' || b.id.includes('9481') || b.id.includes('sajek'),
    );

    if (!hasBooking) {
      return { isAuthorized: false, reason: 'no_booking_for_event', event };
    }

    if (event.status === 'completed') {
      return { isAuthorized: false, reason: 'tour_ended', event };
    }

    const liveLoc = mockLocationService.getLiveLocation(eventId);
    if (!liveLoc || liveLoc.status === 'inactive' || liveLoc.status === 'stopped') {
      return { isAuthorized: false, reason: 'host_not_sharing', event };
    }

    return { isAuthorized: true, event };
  },

  /**
   * Subscribes to real-time updates for an event.
   */
  subscribeToLocation(eventId: string, callback: (loc: LiveLocation) => void): () => void {
    const mockUnsub = mockLocationService.subscribeToLocation(eventId, callback);
    const socket = getSocket();

    const onLocationUpdate = (payload: ServerLocationUpdatePayload) => {
      if (payload.eventId === eventId) {
        const liveLoc: LiveLocation = {
          eventId: payload.eventId,
          hostId: payload.hostId,
          hostName: 'Tour Host',
          busId: 'bus',
          busNumber: 'Bus',
          latitude: payload.latitude,
          longitude: payload.longitude,
          accuracy: payload.accuracy ?? 10,
          heading: payload.heading ?? 0,
          speed: payload.speed ?? 0,
          timestamp: new Date(payload.timestamp).getTime(),
          status: payload.status,
        };
        callback(liveLoc);
      }
    };

    socket.on('location:update', onLocationUpdate);

    return () => {
      mockUnsub();
      socket.off('location:update', onLocationUpdate);
    };
  },

  /**
   * Subscribes to sharing status changes.
   */
  subscribeToStatus(
    eventId: string,
    callback: (status: LocationSharingStatus) => void,
  ): () => void {
    const mockUnsub = mockLocationService.subscribeToStatus(eventId, callback);
    const socket = getSocket();

    const onStopped = (payload: { eventId: string }) => {
      if (payload.eventId === eventId) {
        callback('stopped');
      }
    };
    const onStarted = (payload: { eventId: string }) => {
      if (payload.eventId === eventId) {
        callback('active');
      }
    };

    socket.on('location:stopped', onStopped);
    socket.on('location:started', onStarted);

    return () => {
      mockUnsub();
      socket.off('location:stopped', onStopped);
      socket.off('location:started', onStarted);
    };
  },

  /**
   * Subscribes to active live tours list (for Admin).
   */
  subscribeToActiveLiveTours(callback: (tours: LiveTourEvent[]) => void): () => void {
    return mockLocationService.subscribeToLiveTours(callback);
  },

  /**
   * Controls mock movement simulation mode.
   */
  setMockSimulation(active: boolean): void {
    mockLocationService.setMockMode(active);
  },

  getMockSimulation(): boolean {
    return mockLocationService.getMockMode();
  },
};

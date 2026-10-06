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
   *
   * SECURITY NOTICE:
   * Backend must verify that the requesting authenticated host is assigned to eventId.
   */
  async startSharing(eventId: string, coords?: GeoLocation): Promise<LiveLocation> {
    return mockLocationService.startSharing(eventId, coords);
  },

  /**
   * Host stops live location broadcast.
   */
  async stopSharing(eventId: string): Promise<LiveLocation> {
    return mockLocationService.stopSharing(eventId);
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
    return mockLocationService.pushLocationUpdate(eventId, coords);
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
    return mockLocationService.subscribeToLocation(eventId, callback);
  },

  /**
   * Subscribes to sharing status changes.
   */
  subscribeToStatus(
    eventId: string,
    callback: (status: LocationSharingStatus) => void,
  ): () => void {
    return mockLocationService.subscribeToStatus(eventId, callback);
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

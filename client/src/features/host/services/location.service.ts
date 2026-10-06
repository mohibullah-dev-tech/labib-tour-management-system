import type {
  HostLocationData,
  LocationSharingStatus,
  GuestFacingLocationResponse,
} from '@/features/host/types';

export const LOCATION_ENDPOINTS = {
  startSharing: (eventId: string) => `/api/v1/host/events/${eventId}/location/start`,
  stopSharing: (eventId: string) => `/api/v1/host/events/${eventId}/location/stop`,
  updateCoordinates: (eventId: string) => `/api/v1/host/events/${eventId}/location`,
  guestView: (eventId: string) => `/api/v1/events/${eventId}/location`,
} as const;

// In-memory simulated state
let sharingState: LocationSharingStatus = 'inactive';
let lastUpdatedTimestamp = new Date().toISOString();

const INITIAL_LOCATION: HostLocationData = {
  latitude: 23.4607,
  longitude: 91.1809,
  accuracyMeters: 14.5,
  speedKmh: 68.2,
  headingDegrees: 124,
  lastUpdated: lastUpdatedTimestamp,
  sharingStatus: 'inactive',
  addressPlaceholder: 'Dhaka-Chittagong Expressway, Noorjahan Highway Segment, Cumilla',
  batteryLevel: 88,
};

let currentLocation: HostLocationData = { ...INITIAL_LOCATION };

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const locationService = {
  /**
   * Retrieves the current location sharing state and telemetry
   */
  async getLocationData(eventId?: string): Promise<HostLocationData> {
    await delay(100);
    void eventId;
    return {
      ...currentLocation,
      sharingStatus: sharingState,
      lastUpdated: new Date().toISOString(),
    };
  },

  /**
   * POST /api/v1/host/events/:id/location/start
   * Explicitly activates live location transmission
   */
  async startSharing(eventId: string): Promise<HostLocationData> {
    await delay(300);
    void eventId;
    sharingState = 'active';
    lastUpdatedTimestamp = new Date().toISOString();
    currentLocation = {
      ...currentLocation,
      sharingStatus: 'active',
      lastUpdated: lastUpdatedTimestamp,
      speedKmh: 72.4,
    };
    return { ...currentLocation };
  },

  /**
   * POST /api/v1/host/events/:id/location/stop
   * Explicitly stops live location transmission
   */
  async stopSharing(eventId: string): Promise<HostLocationData> {
    await delay(250);
    void eventId;
    sharingState = 'inactive';
    lastUpdatedTimestamp = new Date().toISOString();
    currentLocation = {
      ...currentLocation,
      sharingStatus: 'inactive',
      lastUpdated: lastUpdatedTimestamp,
      speedKmh: 0,
    };
    return { ...currentLocation };
  },

  /**
   * Pauses / Resumes location transmission
   */
  async togglePauseSharing(eventId: string): Promise<HostLocationData> {
    await delay(200);
    void eventId;
    sharingState = sharingState === 'active' ? 'paused' : 'active';
    currentLocation = {
      ...currentLocation,
      sharingStatus: sharingState,
      lastUpdated: new Date().toISOString(),
    };
    return { ...currentLocation };
  },

  /**
   * Prepared for future guest-facing tracking endpoint:
   * GET /api/v1/events/:eventId/location
   */
  async getGuestFacingLocation(eventId: string): Promise<GuestFacingLocationResponse> {
    await delay(200);
    return {
      eventId,
      tourName: 'Sajek Valley Cloud Odyssey & Helipad Serenity',
      destination: 'Sajek Valley',
      hostName: 'Rahim Ahmed',
      busNumber: 'LABIB-01',
      sharingStatus: sharingState,
      currentLocation:
        sharingState === 'active'
          ? {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              address: currentLocation.addressPlaceholder,
              lastUpdated: currentLocation.lastUpdated,
            }
          : null,
      progressPercent: 35,
      currentMilestone: 'Cumilla Highway Break',
      nextMilestone: 'Khagrachari Breakfast Station',
      estimatedArrivalAtNext: '07:00 AM Tomorrow',
    };
  },
};

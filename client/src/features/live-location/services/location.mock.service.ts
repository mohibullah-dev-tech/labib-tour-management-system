/**
 * Mock Real-Time Location Service & In-Memory Event Bus
 * Labib Tour Management System (LTMS) — Phase 11
 *
 * Provides reactive pub/sub event distribution simulating the future Socket.io
 * event gateway so Host, Guest, and Admin clients stay synchronized in real time.
 */

import type {
  GeoLocation,
  LiveLocation,
  LocationPoint,
  LocationSharingStatus,
  LiveTourEvent,
} from '../types/location.types';
import { SAJEK_HIGHWAY_WAYPOINTS, MOCK_ACTIVE_TOUR_EVENTS } from '../data/mock-waypoints';

export interface LocationSubscriber {
  (location: LiveLocation): void;
}

export interface StatusSubscriber {
  (status: LocationSharingStatus): void;
}

export interface TourListSubscriber {
  (tours: LiveTourEvent[]): void;
}

class MockLocationService {
  private isMockModeActive = true;
  private currentWaypointIndex = 4; // Start near Cumilla Noorjahan
  private timer: ReturnType<typeof setInterval> | null = null;

  // Active locations keyed by eventId
  private liveLocations: Map<string, LiveLocation> = new Map();
  // Location breadcrumb history keyed by eventId
  private locationHistories: Map<string, LocationPoint[]> = new Map();

  // Subscribers
  private locationSubscribers: Map<string, Set<LocationSubscriber>> = new Map();
  private statusSubscribers: Map<string, Set<StatusSubscriber>> = new Map();
  private tourListSubscribers: Set<TourListSubscriber> = new Set();

  constructor() {
    this.initDefaultState();
  }

  private initDefaultState() {
    const initialWaypoint = SAJEK_HIGHWAY_WAYPOINTS[this.currentWaypointIndex];

    // Prepopulate initial history leading up to current spot
    const history: LocationPoint[] = SAJEK_HIGHWAY_WAYPOINTS.slice(
      0,
      this.currentWaypointIndex + 1,
    ).map((wp, idx) => ({
      latitude: wp.latitude,
      longitude: wp.longitude,
      timestamp: Date.now() - (this.currentWaypointIndex - idx) * 1000 * 60 * 20,
      speed: wp.speedKmh,
    }));

    this.locationHistories.set('evt-sajek-01', history);

    const initialLive: LiveLocation = {
      eventId: 'evt-sajek-01',
      hostId: 'u-host-1',
      hostName: 'Rahim Ahmed',
      busId: 'bus-01',
      busNumber: 'LABIB-01',
      latitude: initialWaypoint.latitude,
      longitude: initialWaypoint.longitude,
      accuracy: 8.5,
      heading: initialWaypoint.heading,
      speed: initialWaypoint.speedKmh,
      timestamp: Date.now(),
      status: 'inactive', // inactive until host explicitly clicks Start Live Location
      address: initialWaypoint.name,
      batteryLevel: 88,
    };

    this.liveLocations.set('evt-sajek-01', initialLive);
  }

  public getMockMode(): boolean {
    return this.isMockModeActive;
  }

  public setMockMode(active: boolean): void {
    this.isMockModeActive = active;
    if (!active && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public getEvent(eventId: string): LiveTourEvent | undefined {
    return MOCK_ACTIVE_TOUR_EVENTS.find((e) => e.id === eventId);
  }

  public getActiveLiveTours(): LiveTourEvent[] {
    return MOCK_ACTIVE_TOUR_EVENTS.filter((e) => {
      const loc = this.liveLocations.get(e.id);
      return loc && loc.status === 'active';
    });
  }

  public getAllActiveEvents(): LiveTourEvent[] {
    return [...MOCK_ACTIVE_TOUR_EVENTS];
  }

  public getLiveLocation(eventId: string): LiveLocation | null {
    return this.liveLocations.get(eventId) || null;
  }

  public getLocationHistory(eventId: string): LocationPoint[] {
    return this.locationHistories.get(eventId) || [];
  }

  /**
   * Host starts sharing location
   */
  public startSharing(eventId: string, initialCoords?: GeoLocation): LiveLocation {
    const existing = this.liveLocations.get(eventId);
    const event = this.getEvent(eventId);
    if (!event) throw new Error(`Event ${eventId} not found`);

    const latitude =
      initialCoords?.latitude ?? existing?.latitude ?? SAJEK_HIGHWAY_WAYPOINTS[0].latitude;
    const longitude =
      initialCoords?.longitude ?? existing?.longitude ?? SAJEK_HIGHWAY_WAYPOINTS[0].longitude;
    const accuracy = initialCoords?.accuracy ?? 7.5;
    const heading = initialCoords?.heading ?? existing?.heading ?? 135;
    const speed = initialCoords?.speed
      ? Math.round(initialCoords.speed * 3.6)
      : (existing?.speed ?? 60);

    const updated: LiveLocation = {
      eventId,
      hostId: event.hostId,
      hostName: event.hostName,
      busId: event.busId,
      busNumber: event.busNumber,
      latitude,
      longitude,
      accuracy,
      heading,
      speed,
      timestamp: Date.now(),
      status: 'active',
      address: existing?.address ?? 'Dhaka-Chittagong Expressway',
      batteryLevel: 92,
    };

    this.liveLocations.set(eventId, updated);

    // Record breadcrumb point
    const history = this.locationHistories.get(eventId) || [];
    history.push({ latitude, longitude, timestamp: Date.now(), speed });
    this.locationHistories.set(eventId, history);

    this.notifyLocationSubscribers(eventId, updated);
    this.notifyStatusSubscribers(eventId, 'active');
    this.notifyTourListSubscribers();

    // Start simulation ticker if mock mode is on
    if (this.isMockModeActive) {
      this.startMockMovementTicker(eventId);
    }

    return updated;
  }

  /**
   * Host stops sharing location
   */
  public stopSharing(eventId: string): LiveLocation {
    const existing = this.liveLocations.get(eventId);
    if (!existing) throw new Error(`Location for event ${eventId} not found`);

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    const updated: LiveLocation = {
      ...existing,
      status: 'stopped',
      speed: 0,
      timestamp: Date.now(),
    };

    this.liveLocations.set(eventId, updated);
    this.notifyLocationSubscribers(eventId, updated);
    this.notifyStatusSubscribers(eventId, 'stopped');
    this.notifyTourListSubscribers();

    return updated;
  }

  /**
   * Host pauses location sharing
   */
  public pauseSharing(eventId: string): LiveLocation {
    const existing = this.liveLocations.get(eventId);
    if (!existing) throw new Error(`Location for event ${eventId} not found`);

    const updated: LiveLocation = {
      ...existing,
      status: 'paused',
      speed: 0,
      timestamp: Date.now(),
    };

    this.liveLocations.set(eventId, updated);
    this.notifyLocationSubscribers(eventId, updated);
    this.notifyStatusSubscribers(eventId, 'paused');
    this.notifyTourListSubscribers();

    return updated;
  }

  /**
   * Host resumes location sharing
   */
  public resumeSharing(eventId: string): LiveLocation {
    return this.startSharing(eventId);
  }

  /**
   * Updates coordinates (from real browser GPS or manual input)
   */
  public pushLocationUpdate(eventId: string, coords: GeoLocation): LiveLocation {
    const existing = this.liveLocations.get(eventId);
    const event = this.getEvent(eventId);
    if (!event) throw new Error(`Event ${eventId} not found`);

    const speedKmh = coords.speed != null ? Math.round(coords.speed * 3.6) : (existing?.speed ?? 0);

    const updated: LiveLocation = {
      eventId,
      hostId: event.hostId,
      hostName: event.hostName,
      busId: event.busId,
      busNumber: event.busNumber,
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      heading: coords.heading ?? existing?.heading,
      speed: speedKmh,
      timestamp: coords.timestamp || Date.now(),
      status: existing?.status === 'active' ? 'active' : 'inactive',
      address: existing?.address,
      batteryLevel: existing?.batteryLevel,
    };

    this.liveLocations.set(eventId, updated);

    // Only record breadcrumbs if status is active
    if (updated.status === 'active') {
      const history = this.locationHistories.get(eventId) || [];
      // Prevent duplicate points within 5 meters / 2 seconds
      const lastPoint = history[history.length - 1];
      if (
        !lastPoint ||
        Math.abs(lastPoint.latitude - coords.latitude) > 0.0001 ||
        Math.abs(lastPoint.longitude - coords.longitude) > 0.0001
      ) {
        history.push({
          latitude: coords.latitude,
          longitude: coords.longitude,
          timestamp: coords.timestamp,
          speed: speedKmh,
        });
        this.locationHistories.set(eventId, history);
      }
    }

    this.notifyLocationSubscribers(eventId, updated);
    return updated;
  }

  /**
   * Periodic highway route stepper simulation
   */
  private startMockMovementTicker(eventId: string) {
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      const existing = this.liveLocations.get(eventId);
      if (!existing || existing.status !== 'active') return;

      // Advance waypoint or small jitter step along highway
      this.currentWaypointIndex = (this.currentWaypointIndex + 1) % SAJEK_HIGHWAY_WAYPOINTS.length;
      const targetWaypoint = SAJEK_HIGHWAY_WAYPOINTS[this.currentWaypointIndex];

      // Add slight jitter for realism
      const latJitter = (Math.random() - 0.5) * 0.002;
      const lngJitter = (Math.random() - 0.5) * 0.002;

      const newLat = targetWaypoint.latitude + latJitter;
      const newLng = targetWaypoint.longitude + lngJitter;
      const newSpeed =
        targetWaypoint.speedKmh > 0
          ? targetWaypoint.speedKmh + Math.floor(Math.random() * 8 - 4)
          : 0;

      const updated: LiveLocation = {
        ...existing,
        latitude: newLat,
        longitude: newLng,
        heading: targetWaypoint.heading,
        speed: Math.max(0, newSpeed),
        accuracy: 6 + Math.floor(Math.random() * 5),
        address: targetWaypoint.name,
        timestamp: Date.now(),
      };

      this.liveLocations.set(eventId, updated);

      const history = this.locationHistories.get(eventId) || [];
      history.push({
        latitude: newLat,
        longitude: newLng,
        timestamp: Date.now(),
        speed: updated.speed,
      });
      // Cap history to 150 points in memory
      if (history.length > 150) history.shift();
      this.locationHistories.set(eventId, history);

      this.notifyLocationSubscribers(eventId, updated);
    }, 6000); // Pulse every 6 seconds in mock mode
  }

  // ==========================================
  // Pub / Sub Subscriptions
  // ==========================================

  public subscribeToLocation(eventId: string, callback: LocationSubscriber): () => void {
    if (!this.locationSubscribers.has(eventId)) {
      this.locationSubscribers.set(eventId, new Set());
    }
    this.locationSubscribers.get(eventId)!.add(callback);

    // Immediately push current state if exists
    const current = this.liveLocations.get(eventId);
    if (current) callback(current);

    return () => {
      this.locationSubscribers.get(eventId)?.delete(callback);
    };
  }

  public subscribeToStatus(eventId: string, callback: StatusSubscriber): () => void {
    if (!this.statusSubscribers.has(eventId)) {
      this.statusSubscribers.set(eventId, new Set());
    }
    this.statusSubscribers.get(eventId)!.add(callback);

    const current = this.liveLocations.get(eventId);
    if (current) callback(current.status);

    return () => {
      this.statusSubscribers.get(eventId)?.delete(callback);
    };
  }

  public subscribeToLiveTours(callback: TourListSubscriber): () => void {
    this.tourListSubscribers.add(callback);
    callback(this.getActiveLiveTours());

    return () => {
      this.tourListSubscribers.delete(callback);
    };
  }

  private notifyLocationSubscribers(eventId: string, location: LiveLocation) {
    this.locationSubscribers.get(eventId)?.forEach((cb) => {
      try {
        cb(location);
      } catch (err) {
        console.error('Subscriber callback error:', err);
      }
    });
  }

  private notifyStatusSubscribers(eventId: string, status: LocationSharingStatus) {
    this.statusSubscribers.get(eventId)?.forEach((cb) => {
      try {
        cb(status);
      } catch (err) {
        console.error('Subscriber callback error:', err);
      }
    });
  }

  private notifyTourListSubscribers() {
    const tours = this.getActiveLiveTours();
    this.tourListSubscribers.forEach((cb) => {
      try {
        cb(tours);
      } catch (err) {
        console.error('Subscriber callback error:', err);
      }
    });
  }
}

export const mockLocationService = new MockLocationService();

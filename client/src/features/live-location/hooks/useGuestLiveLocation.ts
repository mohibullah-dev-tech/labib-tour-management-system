/**
 * Guest Live Location Subscription Hook
 * Labib Tour Management System (LTMS) — Phase 11
 *
 * Enforces event-scoped access verification:
 * Guests can ONLY view live telemetry if they are authenticated, have an active
 * booking for this tour event, the tour has not ended, and the Host is actively sharing.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useGuestBookings } from '@/features/guest/hooks/useGuestData';
import type {
  LiveLocation,
  LocationPoint,
  LiveTourEvent,
  GuestLocationAccessCheck,
  NetworkStatus,
} from '../types/location.types';
import { locationService } from '../services/location.service';
import { useEventRoom } from '@/lib/socket';

export function useGuestLiveLocation(eventId: string = 'evt-sajek-01') {
  const { isAuthenticated } = useAuth();
  const { data: bookings = [] } = useGuestBookings();

  // Join backend Socket.io event room to receive live location updates
  useEventRoom(eventId);

  const [isLoading, setIsLoading] = useState(true);
  const [access, setAccess] = useState<GuestLocationAccessCheck>({ isAuthorized: false });
  const [location, setLocation] = useState<LiveLocation | null>(null);
  const [history, setHistory] = useState<LocationPoint[]>([]);
  const [event, setEvent] = useState<LiveTourEvent | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(
    typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'online',
  );

  // Monitor network
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Verify access and fetch initial telemetry
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const checkAccessAndLoad = async () => {
      const check = await locationService.verifyGuestAccess(
        isAuthenticated,
        bookings.map((b) => ({ id: b.id, bookingStatus: b.bookingStatus })),
        eventId,
      );

      if (!isMounted) return;
      setAccess(check);

      const evtData = await locationService.getEvent(eventId);
      if (!isMounted) return;
      setEvent(evtData);

      const locData = await locationService.getCurrentLocation(eventId);
      if (!isMounted) return;
      setLocation(locData);

      const histData = await locationService.getLocationHistory(eventId);
      if (!isMounted) return;
      setHistory(histData);

      setIsLoading(false);
    };

    checkAccessAndLoad();

    // Subscribe to live location stream
    const unsubscribeLocation = locationService.subscribeToLocation(eventId, (newLoc) => {
      if (!isMounted) return;
      setLocation(newLoc);
      // Re-evaluate access state when host status flips
      locationService
        .verifyGuestAccess(
          isAuthenticated,
          bookings.map((b) => ({ id: b.id, bookingStatus: b.bookingStatus })),
          eventId,
        )
        .then((updatedCheck) => {
          if (isMounted) setAccess(updatedCheck);
        });

      locationService.getLocationHistory(eventId).then((h) => {
        if (isMounted) setHistory(h);
      });
    });

    const unsubscribeStatus = locationService.subscribeToStatus(eventId, () => {
      if (!isMounted) return;
      locationService
        .verifyGuestAccess(
          isAuthenticated,
          bookings.map((b) => ({ id: b.id, bookingStatus: b.bookingStatus })),
          eventId,
        )
        .then((updatedCheck) => {
          if (isMounted) setAccess(updatedCheck);
        });
    });

    return () => {
      isMounted = false;
      unsubscribeLocation();
      unsubscribeStatus();
    };
  }, [eventId, isAuthenticated, bookings]);

  return {
    isLoading,
    access,
    event,
    location,
    history,
    networkStatus,
  };
}

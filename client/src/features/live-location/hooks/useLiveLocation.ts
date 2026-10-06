/**
 * Host Live Location Management Hook
 * Labib Tour Management System (LTMS) — Phase 11
 *
 * Coordinates Host geolocation tracking, privacy consent states,
 * breadcrumb history, mock simulation toggles, and network status.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type {
  LiveLocation,
  LocationPoint,
  LocationSharingStatus,
  NetworkStatus,
  LiveTourEvent,
} from '../types/location.types';
import { locationService } from '../services/location.service';
import { useGeolocation } from './useGeolocation';

interface UseLiveLocationProps {
  eventId: string;
  autoSubscribe?: boolean;
}

export function useLiveLocation({ eventId, autoSubscribe = true }: UseLiveLocationProps) {
  const [event, setEvent] = useState<LiveTourEvent | null>(null);
  const [location, setLocation] = useState<LiveLocation | null>(null);
  const [history, setHistory] = useState<LocationPoint[]>([]);
  const [status, setStatus] = useState<LocationSharingStatus>('inactive');
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(
    typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'online',
  );
  const [isMockMode, setIsMockMode] = useState<boolean>(locationService.getMockSimulation());

  // Throttling ref to avoid pushing duplicate GPS coords too fast
  const lastPushTimeRef = useRef<number>(0);

  // Browser Geolocation hook
  const {
    coords: gpsCoords,
    error: gpsError,
    startWatching,
    stopWatching,
    isSupported,
  } = useGeolocation({
    enableHighAccuracy: true,
    onLocationUpdate: (newCoords) => {
      // Throttle uploads to once every 4 seconds
      const now = Date.now();
      if (now - lastPushTimeRef.current > 4000) {
        lastPushTimeRef.current = now;
        locationService.pushCoordinates(eventId, newCoords).then((updated) => {
          setLocation(updated);
        });
      }
    },
    onError: (err) => {
      if (status === 'active') {
        toast.error('GPS Alert', { description: err.userFriendlyMessage });
      }
    },
  });

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('online');
      toast.success('Internet Reconnected', {
        description: 'Live location synchronization resumed.',
      });
    };

    const handleOffline = () => {
      setNetworkStatus('offline');
      toast.warning('Connection Interrupted', {
        description:
          'You are currently offline. Local coordinates will queue until connection restores.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch initial event and location data
  useEffect(() => {
    locationService.getEvent(eventId).then(setEvent);
    locationService.getCurrentLocation(eventId).then((loc) => {
      if (loc) {
        setLocation(loc);
        setStatus(loc.status);
      }
    });
    locationService.getLocationHistory(eventId).then(setHistory);
  }, [eventId]);

  // Real-time subscription to state updates
  useEffect(() => {
    if (!autoSubscribe) return;

    const unsubscribeLocation = locationService.subscribeToLocation(eventId, (newLoc) => {
      setLocation(newLoc);
      setStatus(newLoc.status);
      locationService.getLocationHistory(eventId).then(setHistory);
    });

    const unsubscribeStatus = locationService.subscribeToStatus(eventId, (newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubscribeLocation();
      unsubscribeStatus();
    };
  }, [eventId, autoSubscribe]);

  /**
   * Explicitly start location sharing
   */
  const startSharing = useCallback(async () => {
    try {
      setStatus('starting');
      // If browser supports geolocation, initiate watching
      if (isSupported && !isMockMode) {
        startWatching();
      }

      const activeLoc = await locationService.startSharing(eventId, gpsCoords ?? undefined);
      setLocation(activeLoc);
      setStatus('active');

      toast.success('Live Location Active', {
        description: `Now sharing real-time vehicle coordinates with all passengers and ops administrators.`,
      });
      return activeLoc;
    } catch {
      setStatus('error');
      toast.error('Failed to start live location sharing.');
      return null;
    }
  }, [eventId, isSupported, isMockMode, gpsCoords, startWatching]);

  /**
   * Explicitly stop location sharing
   */
  const stopSharing = useCallback(async () => {
    try {
      stopWatching();
      const stoppedLoc = await locationService.stopSharing(eventId);
      setLocation(stoppedLoc);
      setStatus('stopped');

      toast.info('Location Sharing Ended', {
        description: 'Passenger GPS broadcasting has been stopped. Geolocation watcher released.',
      });
      return stoppedLoc;
    } catch {
      toast.error('Failed to stop location sharing.');
      return null;
    }
  }, [eventId, stopWatching]);

  /**
   * Pause location sharing
   */
  const pauseSharing = useCallback(async () => {
    try {
      const pausedLoc = await locationService.pauseSharing(eventId);
      setLocation(pausedLoc);
      setStatus('paused');
      toast.info('Broadcast Paused', {
        description: 'Vehicle coordinates are temporarily masked from passenger view.',
      });
      return pausedLoc;
    } catch {
      toast.error('Failed to pause location sharing.');
      return null;
    }
  }, [eventId]);

  /**
   * Resume location sharing
   */
  const resumeSharing = useCallback(async () => {
    return startSharing();
  }, [startSharing]);

  /**
   * Toggle mock route simulation mode
   */
  const toggleMockMode = useCallback(() => {
    const nextState = !isMockMode;
    setIsMockMode(nextState);
    locationService.setMockSimulation(nextState);
    if (!nextState && status === 'active') {
      startWatching();
    }
    toast.info(`Mock Highway Simulation: ${nextState ? 'ENABLED' : 'DISABLED'}`);
  }, [isMockMode, status, startWatching]);

  return {
    event,
    location,
    history,
    status,
    networkStatus,
    isMockMode,
    gpsError,
    startSharing,
    stopSharing,
    pauseSharing,
    resumeSharing,
    toggleMockMode,
  };
}

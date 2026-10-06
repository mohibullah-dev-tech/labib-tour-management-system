/**
 * Admin Live Location Fleet Monitoring Hook
 * Labib Tour Management System (LTMS) — Phase 11
 *
 * Allows Administrators and Dispatchers to monitor all active tours,
 * inspect individual tour bus telemetry, and track highway progress.
 */

import { useState, useEffect } from 'react';
import type { LiveTourEvent, LiveLocation, LocationPoint } from '../types/location.types';
import { locationService } from '../services/location.service';

export function useAdminLiveLocation(selectedEventId?: string) {
  const [activeTours, setActiveTours] = useState<LiveTourEvent[]>([]);
  const [allEvents, setAllEvents] = useState<LiveTourEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<LiveTourEvent | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LiveLocation | null>(null);
  const [history, setHistory] = useState<LocationPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to active tours list
  useEffect(() => {
    let isMounted = true;
    locationService.getAllActiveEvents().then((evts) => {
      if (isMounted) setAllEvents(evts);
    });

    const unsubscribe = locationService.subscribeToActiveLiveTours((tours) => {
      if (isMounted) {
        setActiveTours(tours);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Track the selected event
  useEffect(() => {
    if (!selectedEventId) {
      setSelectedEvent(null);
      setCurrentLocation(null);
      setHistory([]);
      return;
    }

    let isMounted = true;
    locationService.getEvent(selectedEventId).then((evt) => {
      if (isMounted) setSelectedEvent(evt);
    });

    locationService.getCurrentLocation(selectedEventId).then((loc) => {
      if (isMounted) setCurrentLocation(loc);
    });

    locationService.getLocationHistory(selectedEventId).then((hist) => {
      if (isMounted) setHistory(hist);
    });

    const unsubscribe = locationService.subscribeToLocation(selectedEventId, (newLoc) => {
      if (!isMounted) return;
      setCurrentLocation(newLoc);
      locationService.getLocationHistory(selectedEventId).then((h) => {
        if (isMounted) setHistory(h);
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [selectedEventId]);

  return {
    activeTours,
    allEvents,
    selectedEvent,
    currentLocation,
    history,
    isLoading,
  };
}

/**
 * Browser Geolocation API Hook
 * Labib Tour Management System (LTMS) — Phase 11
 *
 * Implements high-accuracy browser geolocation tracking with robust
 * error sanitization, watcher cleanup, and memory leak prevention.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  GeoLocation,
  LocationErrorState,
  GeolocationErrorCode,
} from '../types/location.types';

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  onError?: (error: LocationErrorState) => void;
  onLocationUpdate?: (location: GeoLocation) => void;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 5000,
    onError,
    onLocationUpdate,
  } = options;

  const [coords, setCoords] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<LocationErrorState | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState | 'unsupported'>('prompt');

  const watchIdRef = useRef<number | null>(null);
  const isSupported = typeof window !== 'undefined' && 'geolocation' in navigator;

  // Check initial permission state if Permissions API is available
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          setPermissionState(status.state);
          status.onchange = () => {
            setPermissionState(status.state);
          };
        })
        .catch(() => {
          // Permissions API might not support 'geolocation' in some browsers
        });
    } else if (!isSupported) {
      setPermissionState('unsupported');
    }
  }, [isSupported]);

  const mapBrowserError = useCallback((geoError: GeolocationPositionError): LocationErrorState => {
    let code: GeolocationErrorCode = 'UNKNOWN';
    let userFriendlyMessage = 'An unexpected error occurred while retrieving your location.';

    switch (geoError.code) {
      case geoError.PERMISSION_DENIED:
        code = 'PERMISSION_DENIED';
        userFriendlyMessage =
          'Location permission denied. Please enable location permission in your browser settings and try again.';
        break;
      case geoError.POSITION_UNAVAILABLE:
        code = 'POSITION_UNAVAILABLE';
        userFriendlyMessage =
          'Unable to determine your current location. Please check GPS/location services and try again.';
        break;
      case geoError.TIMEOUT:
        code = 'TIMEOUT';
        userFriendlyMessage =
          'Location request timed out. Please verify your GPS signal or internet connectivity.';
        break;
      default:
        code = 'UNKNOWN';
        userFriendlyMessage = 'Unable to access GPS hardware at this moment.';
    }

    return {
      code,
      message: geoError.message,
      userFriendlyMessage,
    };
  }, []);

  const handleSuccess = useCallback(
    (position: GeolocationPosition) => {
      const newCoords: GeoLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      };

      setCoords(newCoords);
      setError(null);
      onLocationUpdate?.(newCoords);
    },
    [onLocationUpdate],
  );

  const handleError = useCallback(
    (geoError: GeolocationPositionError) => {
      const formatted = mapBrowserError(geoError);
      setError(formatted);
      onError?.(formatted);
    },
    [mapBrowserError, onError],
  );

  const startWatching = useCallback(() => {
    if (!isSupported) {
      const err: LocationErrorState = {
        code: 'UNSUPPORTED',
        message: 'Geolocation is not supported by this browser.',
        userFriendlyMessage: 'Geolocation is not supported by your current browser.',
      };
      setError(err);
      onError?.(err);
      return;
    }

    // Clear any existing watcher to prevent duplicates
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setError(null);
    setIsWatching(true);

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy,
        timeout,
        maximumAge,
      });
    } catch (e) {
      const err: LocationErrorState = {
        code: 'UNKNOWN',
        message: e instanceof Error ? e.message : 'Failed to invoke watchPosition',
        userFriendlyMessage: 'Could not activate GPS watcher.',
      };
      setError(err);
      setIsWatching(false);
    }
  }, [isSupported, enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError, onError]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null && isSupported) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatching(false);
  }, [isSupported]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && isSupported) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isSupported]);

  return {
    coords,
    error,
    isWatching,
    isSupported,
    permissionState,
    startWatching,
    stopWatching,
  };
}

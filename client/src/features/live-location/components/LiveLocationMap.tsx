/**
 * Interactive Live Location Map (Leaflet + OpenStreetMap)
 * Labib Tour Management System (LTMS) — Phase 11
 *
 * Renders:
 * - Real-time vehicle pin with directional heading rotation
 * - GPS accuracy circle
 * - Breadcrumb path polyline
 * - Origin & Destination milestone pins
 * - Interactive controls (Center on bus, Zoom, Tile layer)
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Maximize2, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LiveLocation, LocationPoint } from '../types/location.types';

interface LiveLocationMapProps {
  location: LiveLocation | null;
  history?: LocationPoint[];
  originCoords?: [number, number];
  destinationCoords?: [number, number];
  originLabel?: string;
  destinationLabel?: string;
  className?: string;
  height?: string;
  interactive?: boolean;
}

export function LiveLocationMap({
  location,
  history = [],
  originCoords,
  destinationCoords,
  originLabel = 'Origin: Sayedabad Terminal',
  destinationLabel = 'Destination: Sajek Valley',
  className = '',
  height = '480px',
  interactive = true,
}: LiveLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const originMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);

  const [followVehicle, setFollowVehicle] = useState(true);

  // Default coordinates centered on Bangladesh if location not available yet
  const defaultLat = location?.latitude ?? 23.4607;
  const defaultLng = location?.longitude ?? 91.1809;

  // Create custom vehicle bus marker with directional heading rotation
  const createVehicleIcon = useCallback((heading?: number | null, busNumber: string = 'BUS') => {
    const hasHeading = heading != null && !isNaN(heading);
    const rotationDeg = hasHeading ? heading : 0;

    const html = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 select-none" style="width: 52px; height: 52px;">
        <!-- Pulsing radar wave -->
        <span class="absolute inset-0 rounded-full bg-emerald-500 opacity-40 animate-ping"></span>
        <span class="absolute inset-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/60"></span>

        <!-- Directional Vehicle Icon -->
        <div class="relative flex items-center justify-center size-10 rounded-full bg-emerald-600 text-white shadow-lg border-2 border-white ring-2 ring-emerald-500/50 transition-transform duration-300"
             style="transform: rotate(${rotationDeg}deg);">
          ${
            hasHeading
              ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                   <polygon points="12 2 19 21 12 17 5 21 12 2" fill="white" />
                 </svg>`
              : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" /><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 7.3 19.6 7 19 7H5c-.6 0-1.1.3-1.4.8L2.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
                 </svg>`
          }
        </div>

        <!-- Bus Number Badge Below -->
        <span class="absolute -bottom-2 bg-neutral-900/90 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm border border-neutral-700 whitespace-nowrap">
          ${busNumber}
        </span>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'ltms-live-vehicle-marker',
      iconSize: [52, 52],
      iconAnchor: [26, 26],
    });
  }, []);

  // Create custom milestone marker (Origin / Destination)
  const createMilestoneIcon = useCallback((type: 'origin' | 'destination', label: string) => {
    const isOrigin = type === 'origin';
    const bgColor = isOrigin ? 'bg-indigo-600' : 'bg-rose-600';
    const ringColor = isOrigin ? 'ring-indigo-400/40' : 'ring-rose-400/40';

    const html = `
      <div class="relative flex flex-col items-center select-none" style="transform: translate(-50%, -100%);">
        <div class="size-7 rounded-full ${bgColor} text-white flex items-center justify-center shadow-md border-2 border-white ring-2 ${ringColor}">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <span class="mt-0.5 px-1.5 py-0.5 rounded bg-neutral-900/90 text-white font-sans text-[9px] font-semibold shadow-xs border border-neutral-700 whitespace-nowrap">
          ${label}
        </span>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'ltms-milestone-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });
  }, []);

  // Initialize Leaflet Map instance
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // Already initialized

    const map = L.map(containerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 12,
      zoomControl: false,
      attributionControl: true,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
    });

    // Add standard OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Zoom control at bottom right to avoid top clutter
    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map);

    // Initial vehicle marker
    const vehicleIcon = createVehicleIcon(location?.heading, location?.busNumber ?? 'LABIB-01');
    const vehicleMarker = L.marker([defaultLat, defaultLng], {
      icon: vehicleIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    // Initial accuracy circle
    const accuracyCircle = L.circle([defaultLat, defaultLng], {
      radius: location?.accuracy ?? 15,
      color: '#0ea5e9',
      fillColor: '#38bdf8',
      fillOpacity: 0.12,
      weight: 1.5,
    }).addTo(map);

    // Initial breadcrumb polyline
    const pathCoords = history.map((p) => [p.latitude, p.longitude] as [number, number]);
    const polyline = L.polyline(pathCoords, {
      color: '#059669',
      weight: 4.5,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: '8, 8',
    }).addTo(map);

    // Add Origin Marker if coordinates provided
    if (originCoords) {
      const originIcon = createMilestoneIcon('origin', originLabel);
      originMarkerRef.current = L.marker(originCoords, { icon: originIcon }).addTo(map);
    }

    // Add Destination Marker if coordinates provided
    if (destinationCoords) {
      const destIcon = createMilestoneIcon('destination', destinationLabel);
      destinationMarkerRef.current = L.marker(destinationCoords, { icon: destIcon }).addTo(map);
    }

    mapRef.current = map;
    vehicleMarkerRef.current = vehicleMarker;
    accuracyCircleRef.current = accuracyCircle;
    polylineRef.current = polyline;

    // Listen for manual user pan/drag to disable auto-follow
    map.on('dragstart', () => {
      setFollowVehicle(false);
    });

    // Invalidate size after layout stabilization
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, [
    interactive,
    createMilestoneIcon,
    createVehicleIcon,
    defaultLat,
    defaultLng,
    destinationCoords,
    destinationLabel,
    history,
    location?.accuracy,
    location?.busNumber,
    location?.heading,
    originCoords,
    originLabel,
  ]);

  // Update vehicle position, icon rotation, accuracy circle, and breadcrumb path
  useEffect(() => {
    if (!mapRef.current || !vehicleMarkerRef.current || !location) return;

    const latLng: [number, number] = [location.latitude, location.longitude];

    // Update vehicle marker
    vehicleMarkerRef.current.setLatLng(latLng);
    vehicleMarkerRef.current.setIcon(
      createVehicleIcon(location.heading, location.busNumber ?? 'LABIB-01'),
    );

    // Update accuracy circle
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setLatLng(latLng);
      accuracyCircleRef.current.setRadius(Math.max(5, location.accuracy));
    }

    // Update polyline path
    if (polylineRef.current && history.length > 0) {
      const pathCoords = history.map((p) => [p.latitude, p.longitude] as [number, number]);
      polylineRef.current.setLatLngs(pathCoords);
    }

    // Auto-pan if followVehicle is enabled
    if (followVehicle) {
      mapRef.current.panTo(latLng, { animate: true, duration: 0.6 });
    }
  }, [location, history, followVehicle, createVehicleIcon]);

  // Center on Vehicle action button
  const handleRecenter = () => {
    if (!mapRef.current || !location) return;
    setFollowVehicle(true);
    mapRef.current.flyTo([location.latitude, location.longitude], 14, {
      duration: 1,
    });
  };

  // Fit bounds to entire tour path
  const handleFitRouteBounds = () => {
    if (!mapRef.current) return;
    const points: [number, number][] = [];

    if (location) points.push([location.latitude, location.longitude]);
    if (originCoords) points.push(originCoords);
    if (destinationCoords) points.push(destinationCoords);
    history.forEach((p) => points.push([p.latitude, p.longitude]));

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      setFollowVehicle(false);
    }
  };

  return (
    <div
      className={`border-border bg-muted/20 relative w-full overflow-hidden rounded-2xl border shadow-xs ${className}`}
    >
      {/* Leaflet DOM container */}
      <div
        ref={containerRef}
        style={{ height, width: '100%' }}
        className="z-0"
        aria-label="Interactive Live Tour Map"
      />

      {/* Floating Map HUD Controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        <Button
          size="sm"
          variant="secondary"
          className={`border-border/80 size-9 rounded-xl border p-0 shadow-md backdrop-blur-md ${
            followVehicle
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-card/90 text-foreground hover:bg-card'
          }`}
          onClick={handleRecenter}
          title={followVehicle ? 'Locking to bus location' : 'Re-center on vehicle'}
          aria-label="Re-center map on vehicle"
        >
          <Crosshair
            className={`size-4.5 ${followVehicle ? 'animate-spin' : ''}`}
            style={{ animationDuration: '8s' }}
          />
        </Button>

        <Button
          size="sm"
          variant="secondary"
          className="border-border/80 bg-card/90 text-foreground hover:bg-card size-9 rounded-xl border p-0 shadow-md backdrop-blur-md"
          onClick={handleFitRouteBounds}
          title="View entire highway itinerary"
          aria-label="Fit map to entire route"
        >
          <Maximize2 className="size-4" />
        </Button>
      </div>

      {/* Floating Highway Speed & Compass HUD (Top Left) */}
      {location && location.status === 'active' && (
        <div className="absolute top-3 left-3 z-[400] flex items-center gap-3 rounded-xl border border-neutral-700/80 bg-neutral-900/85 px-3 py-1.5 text-xs text-white shadow-md backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="font-mono text-sm font-black text-emerald-400">
              {location.speed ?? 0}
            </span>
            <span className="text-[10px] text-neutral-400 uppercase">km/h</span>
          </div>

          <div className="h-3.5 w-px bg-neutral-700" />

          <div className="flex items-center gap-1 text-[11px] text-neutral-300">
            <Compass className="text-primary-300 size-3" />
            <span>{location.heading ? `${Math.round(location.heading)}°` : 'N/A'}</span>
          </div>
        </div>
      )}

      {/* Offline / Inactive Warning Overlay */}
      {(!location || location.status === 'inactive' || location.status === 'stopped') && (
        <div className="bg-card/90 text-foreground border-border absolute bottom-3 left-3 z-[400] flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur-md">
          <span className="size-2 rounded-full bg-neutral-400" />
          <span>Vehicle GPS is currently inactive.</span>
        </div>
      )}
    </div>
  );
}

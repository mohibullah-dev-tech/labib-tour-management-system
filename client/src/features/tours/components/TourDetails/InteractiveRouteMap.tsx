import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, RotateCcw, Milestone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { RouteStop } from '@/features/tours/types';
import {
  resolveStopCoordinates,
  calculateEstimatedDistanceKm,
} from '@/features/tours/utils/geoCoordinates';

export interface InteractiveRouteMapProps {
  route?: RouteStop[];
  tourName?: string;
}

export function InteractiveRouteMap({ route = [], tourName }: InteractiveRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [activeStopId, setActiveStopId] = useState<string | null>(null);

  const stopsWithCoords = useMemo(() => {
    return route.map((stop) => ({
      ...stop,
      coords: resolveStopCoordinates(stop),
    }));
  }, [route]);

  const totalDistanceKm = useMemo(() => {
    return calculateEstimatedDistanceKm(route);
  }, [route]);

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || stopsWithCoords.length === 0) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;

    // Clear old markers and polyline
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const latLngs: L.LatLngExpression[] = [];

    stopsWithCoords.forEach((stop, index) => {
      const isFirst = index === 0;
      const isLast = index === stopsWithCoords.length - 1;
      const isSelected = activeStopId === stop.id;

      latLngs.push(stop.coords);

      const markerColorClass = isFirst
        ? 'bg-blue-600 border-white text-white'
        : isLast
          ? 'bg-emerald-600 border-white text-white'
          : 'bg-amber-600 border-white text-white';

      const customIcon = L.divIcon({
        className: 'custom-route-marker',
        html: `
          <div class="relative flex items-center justify-center">
            ${
              isSelected
                ? '<div class="absolute -inset-1 rounded-full bg-primary/40 animate-ping"></div>'
                : ''
            }
            <div class="flex size-7 items-center justify-center rounded-full border-2 shadow-md ${markerColorClass} text-xs font-bold transition-transform hover:scale-110">
              ${stop.order}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(stop.coords, { icon: customIcon }).addTo(map);

      const popupContent = `
        <div class="p-1 font-sans text-neutral-900">
          <div class="flex items-center gap-1.5 font-bold text-xs">
            <span class="inline-block px-1.5 py-0.5 rounded bg-neutral-200 text-[10px]">Stop ${stop.order}</span>
            <span>${stop.location}</span>
          </div>
          ${
            stop.description
              ? `<p class="mt-1 text-xs text-neutral-600 leading-snug">${stop.description}</p>`
              : ''
          }
          <div class="mt-1.5 text-[10px] text-neutral-400 font-mono">
            ${stop.coords[0].toFixed(4)}° N, ${stop.coords[1].toFixed(4)}° E
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setActiveStopId(stop.id);
      });

      markersRef.current.push(marker);
    });

    // Draw route polyline
    if (latLngs.length > 1) {
      polylineRef.current = L.polyline(latLngs, {
        color: '#059669',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);
    }

    // Fit map bounds to show all route stops
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });

    return () => {
      // Keep map instance alive or clean up
    };
  }, [stopsWithCoords, activeStopId]);

  // Handle focus on a specific stop
  const handleSelectStop = (stopId: string) => {
    setActiveStopId(stopId);
    const stopIndex = stopsWithCoords.findIndex((s) => s.id === stopId);
    if (stopIndex !== -1 && mapRef.current) {
      const stop = stopsWithCoords[stopIndex];
      mapRef.current.flyTo(stop.coords, 12, { duration: 1.2 });
      markersRef.current[stopIndex]?.openPopup();
    }
  };

  const handleResetView = () => {
    setActiveStopId(null);
    if (mapRef.current && stopsWithCoords.length > 0) {
      const bounds = L.latLngBounds(stopsWithCoords.map((s) => s.coords));
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  };

  if (!route.length) return null;

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border shadow-xs">
      {/* Route Header Info */}
      <div className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Navigation className="text-primary size-4" />
          <h3 className="text-foreground text-sm font-semibold">
            {tourName ? `${tourName} Route` : 'Travel Route & Transit Plan'}
          </h3>
          <Badge variant="secondary" className="text-[11px]">
            {route.length} Stops
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {totalDistanceKm > 0 && (
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Milestone className="size-3.5" />
              <span>Est. {totalDistanceKm} km highway</span>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetView}
            className="h-8 gap-1 px-2 text-xs"
          >
            <RotateCcw className="size-3.5" />
            Full Route
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div ref={mapContainerRef} className="bg-muted z-10 h-80 w-full" />

        {/* Legend Overlay */}
        <div className="border-border/80 bg-background/90 text-foreground absolute top-3 right-3 z-20 flex flex-col gap-1.5 rounded-lg border p-2.5 text-[11px] shadow-sm backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-blue-600" />
            <span>Departure (Stop 1)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-amber-600" />
            <span>Transit & Refreshment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-600" />
            <span>Final Destination</span>
          </div>
        </div>
      </div>

      {/* Interactive Stop Pills */}
      <div className="border-border bg-card border-t p-4">
        <p className="text-muted-foreground mb-2.5 text-xs font-medium tracking-wider uppercase">
          Click any stop to focus on map:
        </p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {stopsWithCoords.map((stop) => {
            const isSelected = activeStopId === stop.id;
            return (
              <button
                key={stop.id}
                type="button"
                onClick={() => handleSelectStop(stop.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary shadow-xs'
                    : 'border-border bg-background hover:bg-muted/60 text-foreground'
                }`}
              >
                <div
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {stop.order}
                </div>
                <div>
                  <p className="text-xs leading-none font-semibold">{stop.location}</p>
                  {stop.description && (
                    <p className="text-muted-foreground mt-0.5 line-clamp-1 max-w-[130px] text-[10px]">
                      {stop.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

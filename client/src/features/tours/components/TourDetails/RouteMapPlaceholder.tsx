import { Map as MapIcon } from 'lucide-react';
import type { RouteStop } from '@/features/tours/types';

export interface RouteMapPlaceholderProps {
  route?: RouteStop[];
}

/**
 * Placeholder only — per this phase's scope. `route` stops already carry
 * optional `lat`/`lng` fields (see types.ts) so once real coordinates
 * exist, this becomes a Leaflet <MapContainer> plotting the same route
 * array TravelTimeline already renders, with zero changes to the data
 * shape.
 */
function RouteMapPlaceholder({ route }: RouteMapPlaceholderProps) {
  if (!route?.length) return null;

  return (
    <div className="border-border bg-muted/40 flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
      <MapIcon className="text-muted-foreground size-8" aria-hidden="true" />
      <p className="text-foreground text-sm font-medium">Route Map</p>
      <p className="text-muted-foreground max-w-xs text-xs">
        Interactive map coming soon — will plot {route.length} stops from {route[0]?.location} to{' '}
        {route[route.length - 1]?.location}.
      </p>
    </div>
  );
}

export { RouteMapPlaceholder };

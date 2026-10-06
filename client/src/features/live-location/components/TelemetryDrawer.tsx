/**
 * Live Telemetry Strip & Developer Simulator Controls
 * Labib Tour Management System (LTMS) — Phase 11
 */

import { Gauge, Compass, MapPin, BatteryCharging, Radio, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { LiveLocation } from '../types/location.types';

interface TelemetryDrawerProps {
  location: LiveLocation | null;
  isMockMode: boolean;
  onToggleMockMode: () => void;
  className?: string;
}

function getCompassDirection(heading?: number | null): string {
  if (heading == null || isNaN(heading)) return 'N/A';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((heading %= 360) < 0 ? heading + 360 : heading) / 45) % 8;
  return `${directions[index]} (${Math.round(heading)}°)`;
}

export function TelemetryDrawer({
  location,
  isMockMode,
  onToggleMockMode,
  className = '',
}: TelemetryDrawerProps) {
  const speed = location?.speed ?? 0;
  const accuracy = location?.accuracy ? Math.round(location.accuracy) : 8;
  const headingText = getCompassDirection(location?.heading);

  return (
    <Card
      className={`border-border bg-card/80 rounded-2xl p-4 shadow-xs backdrop-blur-sm ${className}`}
    >
      <div className="flex flex-col gap-3">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="bg-muted/40 border-border/70 flex flex-col rounded-xl border p-3">
            <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
              <Gauge className="text-primary size-3" />
              <span>Highway Speed</span>
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-foreground font-mono text-xl font-black sm:text-2xl">
                {speed}
              </span>
              <span className="text-muted-foreground text-[11px] font-semibold">km/h</span>
            </div>
          </div>

          <div className="bg-muted/40 border-border/70 flex flex-col rounded-xl border p-3">
            <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
              <Compass className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>Bearing / Heading</span>
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-foreground font-mono text-base font-bold sm:text-lg">
                {headingText}
              </span>
            </div>
          </div>

          <div className="bg-muted/40 border-border/70 flex flex-col rounded-xl border p-3">
            <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
              <Radio className="size-3 text-amber-600 dark:text-amber-400" />
              <span>GPS Precision</span>
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-foreground font-mono text-base font-bold sm:text-lg">
                ±{accuracy}m
              </span>
              <span className="text-muted-foreground text-[11px]">radius</span>
            </div>
          </div>

          <div className="bg-muted/40 border-border/70 flex flex-col rounded-xl border p-3">
            <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
              <BatteryCharging className="size-3 text-sky-600 dark:text-sky-400" />
              <span>Host Device</span>
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-foreground font-mono text-base font-bold sm:text-lg">
                {location?.batteryLevel ? `${location.batteryLevel}%` : 'Normal'}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">• Active</span>
            </div>
          </div>
        </div>

        {/* Current Segment / Address */}
        <div className="bg-muted/30 border-border/60 flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2 text-xs">
          <div className="flex min-w-0 items-center gap-2">
            <MapPin className="text-primary size-3.5 shrink-0" />
            <span className="text-muted-foreground truncate">
              Segment:{' '}
              <strong className="text-foreground">
                {location?.address ?? 'Dhaka-Chittagong National Highway'}
              </strong>
            </span>
          </div>

          {/* Dev / Testing Mock Mode Switch */}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className={`h-7 gap-1 rounded-lg px-2.5 text-[11px] font-semibold ${
                isMockMode
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'text-muted-foreground'
              }`}
              onClick={onToggleMockMode}
              title="Toggle simulated GPS route vs device browser GPS"
            >
              <Sliders className="size-3" />
              <span>{isMockMode ? 'Simulating Highway GPS' : 'Real Browser GPS'}</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

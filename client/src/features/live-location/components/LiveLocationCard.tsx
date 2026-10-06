/**
 * Host Live Location Status Card
 * Labib Tour Management System (LTMS) — Phase 11
 *
 * Compact summary card displayed on the Host Dashboard overview
 * and operations widgets.
 */

import { useState } from 'react';
import { Radio, Navigation, Clock, ShieldCheck, Bus, Pause, Play, StopCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LocationStatusBadge, NetworkStatusIndicator } from './LocationStatus';
import { StartLocationDialog } from './StartLocationDialog';
import type { LiveLocation, LiveTourEvent, NetworkStatus } from '../types/location.types';

interface LiveLocationCardProps {
  event: LiveTourEvent | null;
  location: LiveLocation | null;
  networkStatus: NetworkStatus;
  onStartSharing: () => void;
  onStopSharing: () => void;
  onTogglePause?: () => void;
  onOpenFullMap?: () => void;
  className?: string;
}

export function LiveLocationCard({
  event,
  location,
  networkStatus,
  onStartSharing,
  onStopSharing,
  onTogglePause,
  onOpenFullMap,
  className = '',
}: LiveLocationCardProps) {
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);

  const isSharing = location?.status === 'active';
  const isPaused = location?.status === 'paused';
  const accuracy = location?.accuracy ?? 8;
  const lastUpdatedSecondsAgo = location
    ? Math.max(1, Math.floor((Date.now() - location.timestamp) / 1000))
    : 0;

  return (
    <>
      <Card
        className={`border-border bg-card overflow-hidden shadow-xs transition-all duration-300 ${
          isSharing ? 'ring-1 ring-emerald-500/30' : isPaused ? 'ring-1 ring-amber-500/30' : ''
        } ${className}`}
      >
        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
          {/* Header Row: Title & Status */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                  isSharing
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isPaused
                      ? 'bg-amber-600 text-white'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                <Radio className={`size-4.5 ${isSharing ? 'animate-pulse' : ''}`} />
              </div>

              <div>
                <h3 className="font-display text-foreground text-base font-bold">
                  Live Location Tracking
                </h3>
                <p className="text-muted-foreground text-xs">
                  {event?.destination ? `${event.destination} Tour` : 'Active Tour Event'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LocationStatusBadge status={location?.status ?? 'inactive'} />
            </div>
          </div>

          {/* Details Grid */}
          <div className="bg-muted/40 border-border/80 grid grid-cols-2 gap-3 rounded-xl border p-3.5 text-xs sm:grid-cols-4">
            <div>
              <span className="text-muted-foreground block text-[11px]">Assigned Bus</span>
              <span className="text-foreground mt-0.5 flex items-center gap-1 font-mono font-bold">
                <Bus className="text-primary size-3" />
                <span>{event?.busNumber ?? 'LABIB-01'}</span>
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px]">GPS Accuracy</span>
              <span className="text-foreground mt-0.5 block font-semibold">
                {isSharing || isPaused ? `±${Math.round(accuracy)} meters` : '—'}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px]">Last Ping</span>
              <span className="text-foreground mt-0.5 flex items-center gap-1 font-medium">
                <Clock className="text-muted-foreground size-3" />
                <span>
                  {isSharing || isPaused ? `${lastUpdatedSecondsAgo}s ago` : 'Not broadcasting'}
                </span>
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px]">Telemetry Link</span>
              <div className="mt-0.5">
                <NetworkStatusIndicator networkStatus={networkStatus} />
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {isSharing
                  ? `Live location visible to ${event?.guestCount ?? 32} passengers`
                  : 'Coordinates are private until you start sharing'}
              </span>
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              {isSharing || isPaused ? (
                <>
                  {onTogglePause && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 gap-1.5 px-3 text-xs font-semibold"
                      onClick={onTogglePause}
                    >
                      {isPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                      <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-9 gap-1.5 px-4 text-xs font-bold shadow-sm"
                    onClick={onStopSharing}
                  >
                    <StopCircle className="size-4" />
                    <span>Stop Sharing</span>
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="h-9 w-full gap-2 bg-emerald-600 px-5 font-bold text-white shadow-sm hover:bg-emerald-700 sm:w-auto"
                  onClick={() => setPermissionDialogOpen(true)}
                >
                  <Navigation className="size-4" />
                  <span>Start Live Location</span>
                </Button>
              )}

              {onOpenFullMap && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-3 text-xs"
                  onClick={onOpenFullMap}
                >
                  View Full Map
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Dialog */}
      <StartLocationDialog
        open={permissionDialogOpen}
        onOpenChange={setPermissionDialogOpen}
        onConfirmStartSharing={onStartSharing}
        tourName={event?.tourName ?? 'Current Tour'}
        destination={event?.destination ?? 'Sajek Valley'}
        busNumber={event?.busNumber ?? 'LABIB-01'}
        guestCount={event?.guestCount ?? 32}
      />
    </>
  );
}

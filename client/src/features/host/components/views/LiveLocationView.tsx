import { Link } from 'react-router';
import {
  Navigation,
  ShieldCheck,
  Radio,
  Clock,
  BatteryCharging,
  Gauge,
  Play,
  Pause,
  StopCircle,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { HostLocationData, AssignedEvent } from '@/features/host/types';
import { LiveLocationMap } from '@/features/live-location/components/LiveLocationMap';
import type { LiveLocation } from '@/features/live-location/types/location.types';

interface LiveLocationViewProps {
  locationData: HostLocationData;
  event: AssignedEvent | null;
  onRequestPermission: () => void;
  onStopSharing: () => void;
  onTogglePause: () => void;
}

export function LiveLocationView({
  locationData,
  event,
  onRequestPermission,
  onStopSharing,
  onTogglePause,
}: LiveLocationViewProps) {
  const isSharing = locationData.sharingStatus === 'active';
  const isPaused = locationData.sharingStatus === 'paused';
  const isInactive = locationData.sharingStatus === 'inactive';

  const liveLocationObj: LiveLocation = {
    eventId: event?.id ?? 'evt-sajek-01',
    hostId: event?.hostId ?? 'u-host-1',
    hostName: event?.hostName ?? 'Rahim Ahmed',
    busId: event?.bus.busNumber ?? 'bus-01',
    busNumber: event?.bus.busNumber ?? 'LABIB-01',
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    accuracy: locationData.accuracyMeters,
    heading: locationData.headingDegrees,
    speed: locationData.speedKmh,
    timestamp: Date.now(),
    status: locationData.sharingStatus,
    address: locationData.addressPlaceholder,
    batteryLevel: locationData.batteryLevel,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Status Pill */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-display text-foreground text-lg font-bold sm:text-xl">
            Live Location &amp; Vehicle Telemetry
          </h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Real-time GPS broadcast for {event?.tourName ?? 'Current Tour'}. Passenger privacy &amp;
            explicit host consent.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSharing && (
            <Badge className="animate-pulse gap-1.5 bg-rose-600 px-3 py-1 text-xs font-bold text-white">
              <Radio className="size-3.5" />
              <span>LIVE SHARING ACTIVE</span>
            </Badge>
          )}
          {isPaused && (
            <Badge
              variant="outline"
              className="gap-1.5 border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700"
            >
              <Pause className="size-3.5" />
              <span>BROADCAST PAUSED</span>
            </Badge>
          )}
          {isInactive && (
            <Badge
              variant="outline"
              className="border-border text-muted-foreground gap-1.5 px-3 py-1 text-xs"
            >
              <Radio className="size-3.5" />
              <span>SHARING INACTIVE</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Explicit Privacy Banner */}
      <div
        className={`flex flex-col justify-between gap-3 rounded-2xl border p-4 transition-colors sm:flex-row sm:items-center ${
          isSharing
            ? 'border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200'
            : isPaused
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200'
              : 'bg-muted/40 border-border text-foreground'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
              isSharing
                ? 'bg-rose-600 text-white'
                : isPaused
                  ? 'bg-amber-600 text-white'
                  : 'bg-primary/10 text-primary'
            }`}
          >
            <ShieldCheck className="size-5" />
          </div>

          <div>
            <h4 className="text-xs font-bold sm:text-sm">
              {isSharing
                ? `Your live location is currently visible to ${event?.guestCount ?? 32} passengers of this tour.`
                : isPaused
                  ? 'Live location broadcast is temporarily paused.'
                  : 'Location sharing is turned OFF.'}
            </h4>
            <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
              {isSharing
                ? 'Guests can track your vehicle speed, waypoint progression, and estimated highway arrival time.'
                : 'LTMS respects guide privacy. Tracking only transmits when you explicitly activate the broadcast.'}
            </p>
          </div>
        </div>

        {/* Primary Toggle Action */}
        <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
          {isInactive ? (
            <Button
              size="sm"
              onClick={onRequestPermission}
              className="bg-primary hover:bg-primary-600 gap-1.5 text-xs font-bold text-white shadow-sm"
            >
              <Navigation className="size-3.5" />
              <span>Start Sharing Location</span>
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={onTogglePause}
              >
                {isPaused ? (
                  <Play className="size-3 text-emerald-600" />
                ) : (
                  <Pause className="size-3 text-amber-600" />
                )}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </Button>

              <Button
                variant="destructive"
                size="sm"
                className="h-8 gap-1 text-xs font-bold"
                onClick={onStopSharing}
              >
                <StopCircle className="size-3.5" />
                <span>Stop Sharing</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Interactive Leaflet Map Container */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="text-foreground flex items-center gap-1.5 font-bold">
            <Radio className="text-primary size-3.5" />
            <span>Interactive Highway GPS Map (OpenStreetMap)</span>
          </span>

          <Link to="/host/live-location">
            <Button size="sm" variant="ghost" className="text-primary h-7 gap-1 text-xs">
              <span>Open Dedicated Control Room</span>
              <ExternalLink className="size-3" />
            </Button>
          </Link>
        </div>

        <LiveLocationMap
          location={liveLocationObj}
          height="450px"
          originCoords={[23.7196, 90.4267]}
          destinationCoords={[23.382, 92.2938]}
          originLabel="Sayedabad Departure"
          destinationLabel="Sajek Valley Terminal"
        />
      </div>

      <Card className="border-border bg-card overflow-hidden shadow-xs">
        {/* Telemetry Metrics Strip */}
        <CardContent className="grid grid-cols-2 gap-3 p-4 text-xs sm:p-5 md:grid-cols-4">
          <div className="bg-muted/40 border-border rounded-xl border p-3">
            <span className="text-muted-foreground block text-[11px]">GPS Coordinates</span>
            <span className="text-foreground mt-0.5 block font-mono text-sm font-bold">
              {locationData.latitude.toFixed(4)}° N, {locationData.longitude.toFixed(4)}° E
            </span>
            <span className="text-muted-foreground mt-0.5 block text-[10px]">
              Accuracy: ±{locationData.accuracyMeters}m
            </span>
          </div>

          <div className="bg-muted/40 border-border rounded-xl border p-3">
            <span className="text-muted-foreground block text-[11px]">Coach Cruising Speed</span>
            <span className="text-foreground mt-0.5 flex items-center gap-1 font-mono text-sm font-bold">
              <Gauge className="text-primary size-3.5" />
              {locationData.speedKmh} km/h
            </span>
            <span className="text-muted-foreground mt-0.5 block text-[10px]">
              Heading: {locationData.headingDegrees}° SE
            </span>
          </div>

          <div className="bg-muted/40 border-border rounded-xl border p-3">
            <span className="text-muted-foreground block text-[11px]">Telemetry Heartbeat</span>
            <span className="text-foreground mt-0.5 flex items-center gap-1 font-mono text-sm font-bold">
              <Clock className="text-primary size-3.5" />
              Just Now
            </span>
            <span className="mt-0.5 block text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              5s Polling Active
            </span>
          </div>

          <div className="bg-muted/40 border-border rounded-xl border p-3">
            <span className="text-muted-foreground block text-[11px]">Device Battery</span>
            <span className="text-foreground mt-0.5 flex items-center gap-1 font-mono text-sm font-bold">
              <BatteryCharging className="size-3.5 text-emerald-600" />
              {locationData.batteryLevel ?? 88}%
            </span>
            <span className="text-muted-foreground mt-0.5 block text-[10px]">
              Charging on coach port
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

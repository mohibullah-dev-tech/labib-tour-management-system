import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation,
  MapPin,
  ShieldCheck,
  Radio,
  Clock,
  BatteryCharging,
  Gauge,
  Compass,
  AlertTriangle,
  Play,
  Pause,
  StopCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { HostLocationData, AssignedEvent } from '@/features/host/types';

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

      {/* Main Interactive Map Canvas Container */}
      <Card className="border-border bg-card overflow-hidden shadow-xs">
        <div className="border-border/80 relative flex h-80 w-full items-center justify-center overflow-hidden rounded-2xl border bg-slate-900 sm:h-96">
          {/* Stylized vector map background placeholder */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

          {/* Highway vector route path */}
          <svg className="absolute inset-0 size-full" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 60,320 Q 220,240 380,180 T 700,90"
              fill="none"
              stroke="#0284c7"
              strokeWidth="6"
              strokeDasharray="8 6"
              className="animate-pulse opacity-70"
            />
          </svg>

          {/* Departure Marker: Sayedabad */}
          <div className="absolute bottom-14 left-14 flex items-center gap-2 rounded-lg border border-white/20 bg-black/80 px-2.5 py-1 text-[10px] text-white backdrop-blur-md">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Dhaka (Sayedabad)</span>
          </div>

          {/* Destination Marker: Sajek */}
          <div className="absolute top-14 right-14 flex items-center gap-2 rounded-lg border border-white/20 bg-black/80 px-2.5 py-1 text-[10px] text-white backdrop-blur-md">
            <span className="bg-primary size-2 rounded-full" />
            <span>Sajek Valley (Helipad)</span>
          </div>

          {/* Live Vehicle Radar Marker Placeholder */}
          <div className="relative z-10 flex flex-col items-center">
            {isSharing && (
              <>
                <motion.div
                  className="absolute size-28 rounded-full border-2 border-rose-500 bg-rose-500/10"
                  animate={{ scale: [0.8, 1.6, 2.2], opacity: [0.8, 0.4, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute size-18 rounded-full border border-rose-400 bg-rose-500/20"
                  animate={{ scale: [0.8, 1.3, 1.7], opacity: [0.9, 0.5, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
                />
              </>
            )}

            {/* Vehicle Icon Badge */}
            <div
              className={`flex size-12 items-center justify-center rounded-2xl border-2 shadow-xl transition-transform duration-300 ${
                isSharing
                  ? 'scale-110 border-white bg-rose-600 text-white'
                  : 'border-slate-600 bg-slate-800 text-slate-300'
              }`}
            >
              <Navigation
                className="size-6 transition-transform"
                style={{ transform: `rotate(${locationData.headingDegrees}deg)` }}
              />
            </div>

            <div className="mt-3 rounded-full border border-white/20 bg-black/80 px-3 py-1 font-mono text-xs font-bold text-white shadow-lg backdrop-blur-md">
              LABIB-01 ({locationData.speedKmh} km/h)
            </div>
          </div>

          {/* Map Controls Overlay */}
          <div className="absolute top-4 left-4 space-y-1 rounded-xl border border-white/10 bg-black/75 p-2.5 text-xs text-white backdrop-blur-md">
            <div className="flex items-center gap-1.5 font-bold">
              <MapPin className="size-3.5 text-rose-500" />
              <span>Current Highway Segment:</span>
            </div>
            <p className="max-w-xs text-[11px] text-white/80">{locationData.addressPlaceholder}</p>
          </div>
        </div>

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

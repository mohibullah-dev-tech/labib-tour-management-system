/**
 * Dedicated Host Live Location Control Page
 * Route: /host/live-location
 * Labib Tour Management System (LTMS) — Phase 11
 */

import { useState } from 'react';
import { Link } from 'react-router';
import {
  Navigation,
  ArrowLeft,
  StopCircle,
  Pause,
  Play,
  Bus,
  MapPin,
  Clock,
  Radio,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  useLiveLocation,
  LiveLocationMap,
  LocationStatusBadge,
  NetworkStatusIndicator,
  StartLocationDialog,
  LocationPermissionNotice,
  TelemetryDrawer,
} from '@/features/live-location';

export function HostLiveLocationPage() {
  const eventId = 'evt-sajek-01'; // Primary assigned tour event
  const {
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
  } = useLiveLocation({ eventId });

  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);

  const isSharing = status === 'active';
  const isPaused = status === 'paused';
  const accuracy = location?.accuracy ?? 7.5;
  const lastUpdatedSec = location
    ? Math.max(1, Math.floor((Date.now() - location.timestamp) / 1000))
    : 0;

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col pb-16">
      {/* Sticky Mobile/Desktop Header */}
      <header className="bg-background/95 border-border sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/host">
            <Button variant="ghost" size="sm" className="size-9 rounded-xl p-0">
              <ArrowLeft className="size-4.5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-foreground flex items-center gap-2 text-lg font-black sm:text-xl">
              <span>Live Location</span>
              <LocationStatusBadge status={status} size="sm" />
            </h1>
            <p className="text-muted-foreground hidden text-xs sm:block">
              Share your live location with guests during the active tour.
            </p>
          </div>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2">
          {isSharing || isPaused ? (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-1.5 text-xs font-semibold"
                onClick={isPaused ? resumeSharing : pauseSharing}
              >
                {isPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
              </Button>

              <Button
                size="sm"
                variant="destructive"
                className="h-9 gap-1.5 text-xs font-bold shadow-sm"
                onClick={stopSharing}
              >
                <StopCircle className="size-4" />
                <span>Stop Sharing</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="h-9 gap-2 bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              onClick={() => setPermissionDialogOpen(true)}
            >
              <Navigation className="size-4" />
              <span>Start Live Location</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Page Content */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 p-4 sm:p-6">
        {/* Permission / Error Notice if GPS issue */}
        <LocationPermissionNotice error={gpsError} onRetry={startSharing} />

        {/* Status & Operational Card */}
        <Card className="border-border bg-card overflow-hidden shadow-xs">
          <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
            <div className="border-border/70 flex flex-col justify-between gap-3 border-b pb-3 md:flex-row md:items-center">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 border-primary/20 text-primary flex size-11 shrink-0 items-center justify-center rounded-2xl border">
                  <Bus className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary bg-primary/10 border-primary/20 rounded border px-2 py-0.5 font-mono text-[10px] font-bold">
                      {event?.id ?? 'evt-sajek-01'}
                    </span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-foreground text-xs font-bold">
                      Bus: {event?.busNumber ?? 'LABIB-01'} ({event?.busType ?? 'Scania AC'})
                    </span>
                  </div>
                  <h2 className="font-display text-foreground mt-0.5 text-lg font-black sm:text-xl">
                    {event?.destination}: {event?.tourName}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 self-start text-xs md:self-center">
                <div className="bg-muted/50 border-border flex items-center gap-1.5 rounded-xl border px-3 py-1.5">
                  <Radio
                    className={`size-3.5 ${isSharing ? 'animate-pulse text-emerald-500' : 'text-muted-foreground'}`}
                  />
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-foreground font-bold capitalize">{status}</span>
                </div>
                <div className="bg-muted/50 border-border rounded-xl border px-3 py-1.5">
                  <NetworkStatusIndicator networkStatus={networkStatus} />
                </div>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              <div className="bg-muted/30 rounded-xl p-2.5">
                <span className="text-muted-foreground block text-[11px]">GPS Precision</span>
                <span className="text-foreground mt-0.5 block text-sm font-bold">
                  {isSharing || isPaused ? `±${Math.round(accuracy)} meters` : '—'}
                </span>
              </div>

              <div className="bg-muted/30 rounded-xl p-2.5">
                <span className="text-muted-foreground block text-[11px]">Last Ping</span>
                <span className="text-foreground mt-0.5 flex items-center gap-1 text-sm font-bold">
                  <Clock className="text-muted-foreground size-3.5" />
                  <span>{isSharing || isPaused ? `${lastUpdatedSec}s ago` : 'Inactive'}</span>
                </span>
              </div>

              <div className="bg-muted/30 rounded-xl p-2.5">
                <span className="text-muted-foreground block text-[11px]">Audience</span>
                <span className="text-foreground mt-0.5 block text-sm font-bold">
                  {event?.guestCount ?? 32} Passengers
                </span>
              </div>

              <div className="bg-muted/30 rounded-xl p-2.5">
                <span className="text-muted-foreground block text-[11px]">Simulation</span>
                <span className="text-primary mt-0.5 flex items-center gap-1 text-sm font-bold">
                  <Sliders className="size-3.5" />
                  <span>{isMockMode ? 'Highway Demo' : 'Browser Hardware'}</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Interactive Leaflet Map */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-foreground flex items-center gap-1.5 font-bold">
              <MapPin className="text-primary size-3.5" />
              <span>Real-Time Highway Route Map</span>
            </span>
            <span className="text-muted-foreground">OpenStreetMap Live Telemetry</span>
          </div>

          <LiveLocationMap
            location={location}
            history={history}
            originCoords={event?.originCoordinates}
            destinationCoords={event?.destinationCoordinates}
            originLabel="Sayedabad Departure"
            destinationLabel={`${event?.destination ?? 'Sajek'} Terminal`}
            height="520px"
          />
        </div>

        {/* Telemetry Strip & Developer Controls */}
        <TelemetryDrawer
          location={location}
          isMockMode={isMockMode}
          onToggleMockMode={toggleMockMode}
        />

        {/* Mobile Action Dock (Sticky Bottom on small screens) */}
        <div className="bg-card/95 border-border fixed right-0 bottom-0 left-0 z-40 flex items-center gap-2 border-t p-3.5 shadow-lg backdrop-blur-md sm:hidden">
          {isSharing || isPaused ? (
            <>
              <Button
                variant="outline"
                className="h-11 flex-1 text-xs font-semibold"
                onClick={isPaused ? resumeSharing : pauseSharing}
              >
                {isPaused ? (
                  <Play className="mr-1.5 size-4" />
                ) : (
                  <Pause className="mr-1.5 size-4" />
                )}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </Button>
              <Button
                variant="destructive"
                className="h-11 flex-1 text-xs font-bold shadow-sm"
                onClick={stopSharing}
              >
                <StopCircle className="mr-1.5 size-4" />
                <span>Stop Sharing</span>
              </Button>
            </>
          ) : (
            <Button
              className="h-11 w-full gap-2 bg-emerald-600 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
              onClick={() => setPermissionDialogOpen(true)}
            >
              <Navigation className="size-5" />
              <span>Start Live Location</span>
            </Button>
          )}
        </div>
      </main>

      {/* Explicit Consent Dialog */}
      <StartLocationDialog
        open={permissionDialogOpen}
        onOpenChange={setPermissionDialogOpen}
        onConfirmStartSharing={startSharing}
        tourName={event?.tourName ?? 'Current Tour'}
        destination={event?.destination ?? 'Sajek Valley'}
        busNumber={event?.busNumber ?? 'LABIB-01'}
        guestCount={event?.guestCount ?? 32}
      />
    </div>
  );
}

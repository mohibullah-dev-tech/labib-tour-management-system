/**
 * Dedicated Admin Live Location Fleet Monitoring Page
 * Route: /admin/live-location/:eventId
 * Labib Tour Management System (LTMS) — Phase 11
 *
 * Allows Administrators, Dispatchers, and Super Admins to monitor active
 * tour bus telemetry in real-time, view breadcrumbs, and inspect highway safety.
 */

import { useParams, Link } from 'react-router';
import { ArrowLeft, Bus, Radio, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  useAdminLiveLocation,
  LiveLocationMap,
  LocationStatusBadge,
  TelemetryDrawer,
} from '@/features/live-location';

export function AdminLiveLocationPage() {
  const { eventId = 'evt-sajek-01' } = useParams<{ eventId: string }>();
  const { activeTours, allEvents, selectedEvent, currentLocation, history } =
    useAdminLiveLocation(eventId);

  const isLive = currentLocation && currentLocation.status === 'active';
  const lastUpdatedSec = currentLocation
    ? Math.max(1, Math.floor((Date.now() - currentLocation.timestamp) / 1000))
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button variant="outline" size="sm" className="size-9 rounded-xl p-0">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-foreground text-xl font-black">
                Fleet Live Tracking
              </h2>
              {isLive ? (
                <LocationStatusBadge status="active" size="sm" />
              ) : (
                <LocationStatusBadge status={currentLocation?.status ?? 'inactive'} size="sm" />
              )}
            </div>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Live highway telemetry and GPS monitoring for central operations dispatch.
            </p>
          </div>
        </div>

        {/* Other Active Tours Quick Switcher Dropdown / Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs font-semibold">Track Tour:</span>
          {allEvents.map((evt) => (
            <Link key={evt.id} to={`/admin/live-location/${evt.id}`}>
              <Button
                size="sm"
                variant={evt.id === eventId ? 'default' : 'outline'}
                className="h-8 text-xs font-semibold"
              >
                <span>{evt.destination}</span>
                <span className="ml-1 font-mono text-[10px] opacity-70">({evt.busNumber})</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Map + Right Fleet Telemetry Dossier */}
      <div className="laptop:grid-cols-3 grid grid-cols-1 gap-6">
        {/* Left Column: Big Map (2 cols) */}
        <div className="laptop:col-span-2 flex flex-col gap-4">
          <Card className="border-border bg-card overflow-hidden shadow-xs">
            <CardHeader className="border-border/70 flex flex-row items-center justify-between border-b p-4 pb-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <span>
                    {selectedEvent?.destination}: {selectedEvent?.tourName}
                  </span>
                </CardTitle>
                <CardDescription className="mt-0.5 flex items-center gap-2 text-xs">
                  <span>
                    Bus: <strong>{selectedEvent?.busNumber}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Host: <strong>{selectedEvent?.hostName}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Last update: <strong>{lastUpdatedSec}s ago</strong>
                  </span>
                </CardDescription>
              </div>

              <span className="text-primary bg-primary/10 border-primary/20 rounded-lg border px-2.5 py-1 font-mono text-xs font-bold">
                {selectedEvent?.id}
              </span>
            </CardHeader>

            <CardContent className="p-3">
              <LiveLocationMap
                location={currentLocation}
                history={history}
                originCoords={selectedEvent?.originCoordinates}
                destinationCoords={selectedEvent?.destinationCoordinates}
                originLabel={`Boarding: ${selectedEvent?.meetingPoint ?? 'Sayedabad'}`}
                destinationLabel={`Destination: ${selectedEvent?.destination ?? 'Sajek'}`}
                height="560px"
              />
            </CardContent>
          </Card>

          {/* Telemetry Strip */}
          <TelemetryDrawer
            location={currentLocation}
            isMockMode={false}
            onToggleMockMode={() => {}}
          />
        </div>

        {/* Right Column: Fleet Command Dossier & Quick Operations */}
        <div className="flex flex-col gap-4">
          {/* Active Vehicle Card */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <Bus className="text-primary size-4" />
                <span>Vehicle &amp; Crew Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs">
              <div className="bg-muted/40 border-border flex flex-col gap-1.5 rounded-xl border p-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Coach:</span>
                  <span className="text-foreground font-mono font-bold">
                    {selectedEvent?.busNumber ?? 'LABIB-01'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coach Model:</span>
                  <span className="text-foreground font-semibold">
                    {selectedEvent?.busType ?? 'Hyundai Universe AC'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passenger Roster:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedEvent?.guestCount ?? 32} Manifest Guests
                  </span>
                </div>
              </div>

              <div className="bg-muted/40 border-border flex flex-col gap-2 rounded-xl border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">Assigned Guide:</span>
                  <span className="text-foreground font-bold">{selectedEvent?.hostName}</span>
                </div>
                <div className="border-border/60 flex items-center justify-between border-t pt-1">
                  <a
                    href={`tel:${selectedEvent?.hostPhone ?? '+8801712345678'}`}
                    className="w-full"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-full gap-1.5 text-xs font-semibold"
                    >
                      <Phone className="text-primary size-3.5" />
                      <span>Call Host ({selectedEvent?.hostPhone})</span>
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Tracking Fleet Summary */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <Radio className="size-4 animate-pulse text-emerald-600" />
                <span>All Live Tours Broadcast</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Tours currently transmitting GPS packets.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-border divide-y">
                {activeTours.length === 0 ? (
                  <div className="text-muted-foreground p-4 text-center text-xs">
                    No active GPS broadcasts detected at this moment.
                  </div>
                ) : (
                  activeTours.map((t) => (
                    <Link
                      key={t.id}
                      to={`/admin/live-location/${t.id}`}
                      className={`hover:bg-muted/40 block flex items-center justify-between gap-3 p-3.5 transition-colors ${
                        t.id === eventId ? 'bg-primary/5 font-semibold' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground text-xs font-bold">{t.destination}</span>
                          <span className="text-muted-foreground font-mono text-[10px]">
                            {t.busNumber}
                          </span>
                        </div>
                        <span className="text-muted-foreground mt-0.5 block text-[11px]">
                          Host: {t.hostName} • {t.guestCount} guests
                        </span>
                      </div>
                      <ChevronRight className="text-muted-foreground size-4 shrink-0" />
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

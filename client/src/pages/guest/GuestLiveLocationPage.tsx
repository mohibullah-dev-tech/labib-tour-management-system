/**
 * Dedicated Guest Live Location Tracking Page
 * Route: /dashboard/live-location
 * Labib Tour Management System (LTMS) — Phase 11
 *
 * Enforces event-scoped security:
 * Only displays live tracking when the authenticated guest holds a valid ticket,
 * the tour is active, and the Host has explicitly enabled GPS broadcast.
 */

import { Link } from 'react-router';
import {
  Compass,
  ArrowLeft,
  Bus,
  Clock,
  AlertCircle,
  ShieldCheck,
  Phone,
  MessageSquare,
  Sparkles,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useGuestLiveLocation,
  LiveLocationMap,
  LocationStatusBadge,
  NetworkStatusIndicator,
} from '@/features/live-location';

export function GuestLiveLocationPage() {
  const { isLoading, access, event, location, history, networkStatus } =
    useGuestLiveLocation('evt-sajek-01');

  const isLive = access.isAuthorized && location && location.status === 'active';
  const isPaused = access.isAuthorized && location && location.status === 'paused';
  const lastUpdatedSec = location
    ? Math.max(1, Math.floor((Date.now() - location.timestamp) / 1000))
    : 0;

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col pb-16">
      {/* Header */}
      <header className="bg-background/95 border-border sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="size-9 rounded-xl p-0">
              <ArrowLeft className="size-4.5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-foreground text-lg font-black sm:text-xl">
                Live Tour Location
              </h1>
              {isLive ? (
                <LocationStatusBadge status="active" size="sm" />
              ) : isPaused ? (
                <LocationStatusBadge status="paused" size="sm" />
              ) : (
                <Badge variant="outline" className="text-muted-foreground text-[10px]">
                  Tracking Off
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground hidden text-xs sm:block">
              Real-time highway progress for your booked adventure.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NetworkStatusIndicator networkStatus={networkStatus} />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6">
        {/* Loading Skeleton */}
        {isLoading ? (
          <Card className="border-dashed p-12 text-center">
            <Compass className="text-primary mx-auto mb-3 size-10 animate-spin" />
            <h3 className="font-display text-base font-bold">Connecting to Bus GPS...</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Verifying your booking credentials and acquiring vehicle coordinates.
            </p>
          </Card>
        ) : !access.isAuthorized ? (
          /* Security & No-Live-Location Fallback States */
          <Card className="border-border bg-card mx-auto flex max-w-xl flex-col items-center p-8 text-center shadow-xs sm:p-12">
            <div className="bg-primary/10 text-primary mb-4 flex size-16 items-center justify-center rounded-3xl">
              <AlertCircle className="size-8" />
            </div>

            {access.reason === 'host_not_sharing' && (
              <>
                <h2 className="font-display text-foreground text-xl font-black">
                  Live Location Unavailable
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  The host has not started live location sharing yet. Vehicle coordinates will
                  automatically appear here once your tour guide initiates broadcasting at
                  departure.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link to="/dashboard">
                    <Button variant="outline" size="sm">
                      Return to Dashboard
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => window.location.reload()}
                  >
                    Check Again
                  </Button>
                </div>
              </>
            )}

            {access.reason === 'tour_ended' && (
              <>
                <h2 className="font-display text-foreground text-xl font-black">Tour Completed</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Live tracking is no longer available because this tour has ended. We hope you had
                  a memorable journey with Labib Tour &amp; Travel Group!
                </p>
                <Link to="/dashboard?tab=reviews" className="mt-6">
                  <Button size="sm" className="gap-2">
                    <Sparkles className="size-4" />
                    <span>Leave Tour Review</span>
                  </Button>
                </Link>
              </>
            )}

            {access.reason === 'no_booking_for_event' && (
              <>
                <h2 className="font-display text-foreground text-xl font-black">
                  No Confirmed Booking Found
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  You do not have an active confirmed reservation for this tour departure. Live
                  location is strictly reserved for ticketed passengers.
                </p>
                <Link to="/tours" className="mt-6">
                  <Button size="sm">Explore Available Tours</Button>
                </Link>
              </>
            )}

            {access.reason === 'not_authenticated' && (
              <>
                <h2 className="font-display text-foreground text-xl font-black">
                  Authentication Required
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Please log into your Labib Tour guest account to track your assigned tour bus.
                </p>
                <Link to="/login" className="mt-6">
                  <Button size="sm">Log In Now</Button>
                </Link>
              </>
            )}
          </Card>
        ) : (
          /* Active Live Tracking View for Authorized Guests */
          <>
            {/* Tour & Host Dossier Bar */}
            <Card className="border-border bg-card overflow-hidden shadow-xs">
              <CardContent className="flex flex-col justify-between gap-4 p-4 sm:p-5 md:flex-row md:items-center">
                <div className="flex items-start gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Bus className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary bg-primary/10 border-primary/20 rounded-md border px-2 py-0.5 font-mono text-xs font-bold">
                        {event?.busNumber ?? 'LABIB-01'}
                      </span>
                      <span className="text-muted-foreground text-xs">•</span>
                      <span className="text-muted-foreground text-xs font-medium">
                        {event?.busType ?? 'Scania Multiaxle AC'}
                      </span>
                    </div>
                    <h2 className="font-display text-foreground mt-0.5 text-lg font-black sm:text-xl">
                      {event?.destination}: {event?.tourName}
                    </h2>
                  </div>
                </div>

                {/* Host Quick Contacts for Passenger Convenience */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                  <div className="mr-2 hidden text-right sm:block">
                    <span className="text-muted-foreground block text-[11px]">
                      Assigned Tour Host
                    </span>
                    <span className="text-foreground text-xs font-bold">
                      {event?.hostName ?? 'Rahim Ahmed'}
                    </span>
                  </div>

                  <a href={`tel:${event?.hostPhone ?? '+8801712345678'}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs font-semibold"
                    >
                      <Phone className="size-3.5" />
                      <span>Call Host</span>
                    </Button>
                  </a>

                  <Link to="/dashboard?tab=support">
                    <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs">
                      <MessageSquare className="size-3.5" />
                      <span>Support Desk</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Map Container */}
            <div className="flex flex-col gap-2">
              <div className="text-muted-foreground flex flex-col justify-between gap-1 px-1 text-xs sm:flex-row sm:items-center">
                <span className="text-foreground flex items-center gap-1.5 font-medium">
                  <span className="size-2 animate-ping rounded-full bg-emerald-500" />
                  <span>Real-Time Vehicle Position</span>
                  <span>•</span>
                  <span>
                    Last updated: <strong>{lastUpdatedSec}s ago</strong>
                  </span>
                </span>
                <span className="flex items-center gap-1 italic">
                  <Info className="text-primary size-3" />
                  <span>
                    Location may have a few seconds of delay depending on cellular highway coverage.
                  </span>
                </span>
              </div>

              <LiveLocationMap
                location={location}
                history={history}
                originCoords={event?.originCoordinates}
                destinationCoords={event?.destinationCoordinates}
                originLabel="Sayedabad Boarding Station"
                destinationLabel={`${event?.destination ?? 'Sajek'} Helipad`}
                height="540px"
              />
            </div>

            {/* Guest Live Notice & Highway Milestone Banner */}
            <div className="bg-muted/40 border-border flex flex-col justify-between gap-3 rounded-2xl border p-4 text-xs sm:flex-row sm:items-center">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <span className="text-foreground block font-bold">
                    Verified Vehicle Telemetry Stream
                  </span>
                  <span className="text-muted-foreground">
                    Current Highway Segment:{' '}
                    <strong>{location?.address ?? 'Dhaka-Chittagong Expressway'}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="text-muted-foreground size-3.5" />
                  <span className="text-muted-foreground">Speed:</span>
                  <span className="text-foreground font-mono font-bold">
                    {location?.speed ?? 0} km/h
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

import { Calendar, Clock, MapPin, Bus, Users, Phone, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EventLifecycleBadge } from '@/features/host/components/EventLifecycleBadge';
import type { AssignedEvent, HostDashboardTab } from '@/features/host/types';

interface EventDetailsViewProps {
  event: AssignedEvent;
  onBack: () => void;
  onNavigateTab: (tab: HostDashboardTab) => void;
}

export function EventDetailsView({ event, onBack, onNavigateTab }: EventDetailsViewProps) {
  const departureFormatted = new Date(event.departureDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const returnFormatted = new Date(event.returnDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to All Events</span>
        </Button>

        <div className="flex items-center gap-2">
          <EventLifecycleBadge status={event.status} />
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-card border-border relative overflow-hidden rounded-3xl border shadow-xs">
        <div className="bg-muted relative h-64 w-full overflow-hidden sm:h-80">
          <img src={event.coverImage} alt={event.destination} className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <div className="absolute right-6 bottom-6 left-6 flex flex-col justify-between gap-4 text-white sm:flex-row sm:items-end">
            <div>
              <span className="text-primary-300 mb-1 block font-mono text-xs font-bold tracking-wider uppercase">
                Event Reference: {event.id}
              </span>
              <h2 className="font-display text-2xl leading-tight font-black sm:text-3xl">
                {event.destination}
              </h2>
              <p className="mt-1 max-w-xl text-xs text-white/90 sm:text-sm">
                {event.tourName} • {event.duration}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-end">
              <Button
                size="sm"
                onClick={() => onNavigateTab('guests')}
                className="text-primary-950 gap-1.5 bg-white text-xs font-bold hover:bg-white/90"
              >
                <Users className="size-3.5" />
                <span>Passenger Manifest ({event.guestCount})</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="laptop:grid-cols-3 grid grid-cols-1 gap-6">
        {/* Left 2 Cols: Tour info & Bus Crew */}
        <div className="laptop:col-span-2 flex flex-col gap-6">
          {/* Section 1: Tour Schedule Details */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="text-primary size-4" />
                <span>Tour Schedule &amp; Routing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-muted-foreground block text-[11px]">Departure Date</span>
                <span className="text-foreground text-sm font-semibold">{departureFormatted}</span>
                <span className="text-muted-foreground block text-[11px]">
                  Reporting: {event.reportingTime} • Wheel Departure: {event.departureTime}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground block text-[11px]">Return Date</span>
                <span className="text-foreground text-sm font-semibold">{returnFormatted}</span>
                <span className="text-muted-foreground block text-[11px]">
                  {event.duration} Total
                </span>
              </div>

              <div className="border-border space-y-1 border-t pt-2 sm:col-span-2">
                <span className="text-muted-foreground block text-[11px]">
                  Departure Meeting Point
                </span>
                <span className="text-foreground flex items-center gap-1.5 font-semibold">
                  <MapPin className="text-primary size-3.5 shrink-0" />
                  {event.meetingPoint}
                </span>
                <span className="text-muted-foreground block pl-5 text-[11px]">
                  Terminal: {event.departureLocation}
                </span>
              </div>

              {event.notes && (
                <div className="text-foreground rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs sm:col-span-2">
                  <span className="mb-0.5 block font-bold text-amber-700 dark:text-amber-400">
                    Lead Guide Operational Notes:
                  </span>
                  <p className="text-[11px] leading-relaxed">{event.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Bus Information & Crew Allocation */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bus className="text-primary size-4" />
                <span>Coach Specifications &amp; Crew Contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="bg-muted/40 border-border grid grid-cols-2 gap-3 rounded-xl border p-3 sm:grid-cols-4">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Bus Number</span>
                  <span className="text-foreground font-mono text-sm font-bold">
                    {event.bus.busNumber}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Coach Class</span>
                  <span className="text-foreground font-medium">{event.bus.acType} Luxury</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Seat Capacity</span>
                  <span className="text-foreground font-bold">{event.bus.totalSeats} Total</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Booked / Free</span>
                  <span className="text-primary font-bold">
                    {event.guestCount} Booked ({event.bus.availableSeats} Free)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                <div className="border-border bg-card flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Primary Coach Driver
                    </span>
                    <span className="text-foreground text-sm font-bold">
                      {event.bus.driverName}
                    </span>
                    <span className="text-muted-foreground block font-mono text-xs">
                      {event.bus.driverPhone}
                    </span>
                  </div>
                  <Button asChild variant="outline" size="sm" className="h-8 gap-1 text-xs">
                    <a href={`tel:${event.bus.driverPhone}`}>
                      <Phone className="text-primary size-3" />
                      <span>Call Driver</span>
                    </a>
                  </Button>
                </div>

                <div className="border-border bg-card flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Coach Assistant / Helper
                    </span>
                    <span className="text-foreground text-sm font-bold">
                      {event.bus.helperName}
                    </span>
                    <span className="text-muted-foreground block font-mono text-xs">
                      {event.bus.helperPhone}
                    </span>
                  </div>
                  <Button asChild variant="outline" size="sm" className="h-8 gap-1 text-xs">
                    <a href={`tel:${event.bus.helperPhone}`}>
                      <Phone className="text-primary size-3" />
                      <span>Call Helper</span>
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Host details, Quick Actions, Emergency SOS */}
        <div className="flex flex-col gap-6">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Host Responsibility</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">
                  Assigned Tour Leader
                </span>
                <span className="text-foreground text-sm font-bold">{event.hostName}</span>
                <span className="text-muted-foreground block text-[11px]">{event.hostPhone}</span>
              </div>

              <div className="border-border border-t pt-2">
                <span className="text-muted-foreground block text-[11px]">
                  24/7 Operations Hotline
                </span>
                <span className="text-foreground mt-0.5 flex items-center gap-1.5 font-semibold">
                  <ShieldAlert className="size-3.5 text-rose-600" />
                  {event.emergencyContact}
                </span>
              </div>

              <div className="border-border flex flex-col gap-2 border-t pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start gap-1.5 text-xs"
                  onClick={() => onNavigateTab('seats')}
                >
                  <Bus className="size-3.5" />
                  <span>Inspect Seating Plan</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start gap-1.5 text-xs"
                  onClick={() => onNavigateTab('timeline')}
                >
                  <Clock className="size-3.5" />
                  <span>View Tour Timeline</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start gap-1.5 text-xs"
                  onClick={() => onNavigateTab('location')}
                >
                  <MapPin className="size-3.5" />
                  <span>Configure Live GPS Broadcast</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

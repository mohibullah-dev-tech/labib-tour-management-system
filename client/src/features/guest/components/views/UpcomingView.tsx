import { Link } from 'react-router';
import { MapPin, Calendar, Clock, Bus, CloudSun, ShieldAlert, Ticket, Radio } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TourCountdown } from '@/features/guest/components/TourCountdown';
import { HostContactCard } from '@/features/guest/components/HostContactCard';
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from '@/features/guest/components/BookingStatusBadge';
import type { GuestBooking } from '@/features/guest/types';

interface UpcomingViewProps {
  upcomingTour: GuestBooking | null;
  onViewTicket: (booking: GuestBooking) => void;
  onViewDetails: (booking: GuestBooking) => void;
}

export function UpcomingView({ upcomingTour, onViewTicket, onViewDetails }: UpcomingViewProps) {
  if (!upcomingTour) {
    return (
      <Card className="border-border bg-card border-dashed p-12 text-center">
        <Calendar className="text-muted-foreground/30 mx-auto mb-3 size-12" />
        <h3 className="font-display text-lg font-bold">No Upcoming Tour Confirmed</h3>
        <p className="text-muted-foreground mx-auto mt-1 mb-5 max-w-md text-xs">
          You don&apos;t have any active tour departure scheduled at this moment. Explore our latest
          tour packages and secure your bus seat today.
        </p>
        <Button asChild size="sm">
          <a href="/tours">Explore All Tours</a>
        </Button>
      </Card>
    );
  }

  const formattedDeparture = new Date(upcomingTour.departureDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Header with Countdown */}
      <Card className="border-border bg-card overflow-hidden shadow-lg">
        <div className="bg-muted relative h-64 w-full overflow-hidden sm:h-80">
          <img
            src={upcomingTour.coverImage}
            alt={upcomingTour.destination}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <BookingStatusBadge status={upcomingTour.bookingStatus} />
            <PaymentStatusBadge status={upcomingTour.paymentStatus} />
          </div>

          <div className="absolute right-5 bottom-5 left-5 flex flex-col justify-between gap-4 text-white sm:flex-row sm:items-end">
            <div>
              <span className="text-primary-200 mb-1 block font-mono text-xs tracking-widest uppercase">
                Ref: {upcomingTour.id} &bull; {upcomingTour.duration}
              </span>
              <h2 className="font-display text-2xl leading-tight font-bold tracking-tight text-white sm:text-4xl">
                {upcomingTour.destination}
              </h2>
              <p className="mt-1 max-w-xl text-xs text-white/80 sm:text-sm">
                {upcomingTour.tourName} &bull; Package: {upcomingTour.packageName}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-auto">
              <Link to="/dashboard/live-location">
                <Button className="gap-2 bg-emerald-600 font-bold text-white shadow-md hover:bg-emerald-700">
                  <Radio className="size-4 animate-pulse" />
                  <span>Track Bus Live</span>
                </Button>
              </Link>

              <Button
                onClick={() => onViewTicket(upcomingTour)}
                variant="secondary"
                className="gap-2 shadow-md"
              >
                <Ticket className="size-4" />
                <span>Digital E-Ticket</span>
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="bg-card border-border border-t p-5 sm:p-6">
          <TourCountdown targetDate={upcomingTour.departureDate} />
        </CardContent>
      </Card>

      {/* Grid: Logistics, Weather, Meeting Point */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Departure & Seat Details */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
              <Bus className="size-4" />
              <span>Bus &amp; Departure</span>
            </div>
            <CardTitle className="text-base">Departure Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5">
              <Calendar className="text-primary mt-0.5 size-4 shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[11px]">Date</span>
                <span className="text-foreground font-semibold">{formattedDeparture}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="text-primary mt-0.5 size-4 shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[11px]">Departure Time</span>
                <span className="text-foreground font-semibold">{upcomingTour.departureTime}</span>
                <span className="block text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  Report by {upcomingTour.reportingTime}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Bus className="text-primary mt-0.5 size-4 shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[11px]">Assigned Transport</span>
                <span className="text-foreground font-semibold">
                  {upcomingTour.busInfo.name} ({upcomingTour.busInfo.acType})
                </span>
                <span className="text-muted-foreground block font-mono text-xs">
                  Seat(s):{' '}
                  <strong className="text-primary font-bold">
                    {upcomingTour.seatNumbers.join(', ')}
                  </strong>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meeting Point & Directions */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
              <MapPin className="size-4" />
              <span>Reporting Station</span>
            </div>
            <CardTitle className="text-base">Meeting Point &amp; Location</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-xs sm:text-sm">
            <div>
              <span className="text-muted-foreground block text-[11px]">Meeting Station</span>
              <span className="text-foreground font-semibold">{upcomingTour.meetingPoint}</span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px]">Selected Pickup Point</span>
              <span className="text-foreground font-semibold">
                {upcomingTour.guestInfo.pickupLocation}
              </span>
            </div>

            <div className="bg-muted/50 text-muted-foreground border-border/80 rounded-lg border p-2.5 text-xs leading-relaxed">
              <strong>Instructions:</strong> Please look for the Labib Tour banner and coordinator
              at the ticket counter. Keep your digital ticket or QR code ready.
            </div>
          </CardContent>
        </Card>

        {/* Weather Forecast Placeholder */}
        <Card className="border-border bg-card shadow-xs md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
              <CloudSun className="size-4" />
              <span>Weather Forecast</span>
            </div>
            <CardTitle className="text-base">Destination Weather</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-xl border border-sky-500/20 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 p-3">
              <div className="flex items-center gap-3">
                <CloudSun className="size-8 text-sky-500" />
                <div>
                  <span className="text-foreground text-xl font-bold">24°C</span>
                  <span className="text-muted-foreground block text-xs">
                    Partly Cloudy &amp; Mist
                  </span>
                </div>
              </div>
              <div className="text-muted-foreground text-right text-xs">
                <span>Humidity: 68%</span>
                <span className="block text-[11px]">Wind: 8 km/h</span>
              </div>
            </div>

            <div className="text-muted-foreground text-xs leading-relaxed">
              <strong>Packing Advice:</strong> Morning temperatures in hill tracks can drop to 18°C.
              A light jacket and waterproof footwear are strongly recommended.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Host Contact Card + Emergency Hotline + Tour Timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Host & SOS Contacts */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          <HostContactCard host={upcomingTour.hostInfo} tourName={upcomingTour.destination} />

          {/* Emergency Contact Banner */}
          <Card className="border-rose-500/20 bg-rose-500/5 shadow-xs">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="size-5" />
                </div>
                <div>
                  <h4 className="text-foreground text-xs font-bold tracking-wide uppercase">
                    24/7 Tour Emergency Hotline
                  </h4>
                  <p className="mt-0.5 font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
                    {upcomingTour.emergencyContact}
                  </p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                <a href={`tel:${upcomingTour.emergencyContact}`}>Call SOS</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tour Timeline */}
        <div className="lg:col-span-7">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tour Schedule &amp; Itinerary</CardTitle>
              <CardDescription className="text-xs">
                Key milestones planned for your {upcomingTour.duration} trip
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {upcomingTour.timeline && upcomingTour.timeline.length > 0 ? (
                <div className="before:bg-border relative space-y-4 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5">
                  {upcomingTour.timeline.map((step) => (
                    <div key={step.day} className="relative">
                      <div className="bg-primary border-background absolute top-1 -left-6 size-4 rounded-full border-4" />
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-foreground text-xs font-semibold sm:text-sm">
                          Day {step.day}: {step.title}
                        </h4>
                        {step.time && (
                          <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
                            {step.time}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">
                  The detailed hour-by-hour schedule will be shared by your tour host via WhatsApp
                  group.
                </p>
              )}

              <div className="border-border flex items-center justify-end gap-2 border-t pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => onViewDetails(upcomingTour)}
                >
                  View Full Booking Breakdown
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

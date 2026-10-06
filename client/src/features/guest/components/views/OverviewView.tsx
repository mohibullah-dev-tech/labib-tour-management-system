import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  CalendarCheck2,
  CalendarDays,
  Compass,
  Award,
  ArrowRight,
  Eye,
  Ticket,
  Bus,
  MapPin,
  Clock,
  Sparkles,
  Radio,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TourCountdown } from '@/features/guest/components/TourCountdown';
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from '@/features/guest/components/BookingStatusBadge';
import { HostContactCard } from '@/features/guest/components/HostContactCard';
import { BookingCard } from '@/features/guest/components/BookingCard';
import { formatCurrency } from '@/lib/format';
import type { GuestBooking, GuestProfile, GuestDashboardTab } from '@/features/guest/types';

interface OverviewViewProps {
  upcomingTour: GuestBooking | null;
  bookings: GuestBooking[];
  profile: GuestProfile;
  onTabChange: (tab: GuestDashboardTab) => void;
  onViewBookingDetails: (booking: GuestBooking) => void;
  onViewTicket: (booking: GuestBooking) => void;
}

export function OverviewView({
  upcomingTour,
  bookings,
  profile,
  onTabChange,
  onViewBookingDetails,
  onViewTicket,
}: OverviewViewProps) {
  const confirmedCount = bookings.filter((b) => b.bookingStatus === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.bookingStatus === 'completed').length;
  const totalPaid = bookings
    .filter((b) => b.bookingStatus !== 'cancelled')
    .reduce((sum, b) => sum + b.receivedAmount, 0);

  const formattedUpcomingDeparture = upcomingTour
    ? new Date(upcomingTour.departureDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="from-primary to-primary-700 text-primary-foreground flex flex-col justify-between gap-3 rounded-2xl bg-gradient-to-r p-6 shadow-md sm:flex-row sm:items-center"
      >
        <div>
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
            <Sparkles className="size-3.5" />
            <span>Welcome, {profile.fullName.split(' ')[0]}!</span>
          </span>
          <h2 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
            Ready for your next holiday adventure?
          </h2>
          <p className="text-primary-100 mt-1 max-w-xl text-xs opacity-90 sm:text-sm">
            Track your confirmed bus seats, download digital e-tickets, and stay in direct touch
            with your tour host.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="shrink-0 gap-2 self-start shadow-xs sm:self-auto"
          onClick={() => onTabChange('upcoming')}
        >
          <span>Upcoming Tour</span>
          <ArrowRight className="size-4" />
        </Button>
      </motion.div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="flex items-center justify-between p-4 sm:p-5">
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium tracking-wider uppercase">
                Total Bookings
              </span>
              <span className="font-display text-foreground mt-1 block text-2xl font-bold tracking-tight">
                {bookings.length}
              </span>
              <span className="text-muted-foreground mt-0.5 block text-[10px]">Tour packages</span>
            </div>
            <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
              <CalendarCheck2 className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="flex items-center justify-between p-4 sm:p-5">
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium tracking-wider uppercase">
                Active Tours
              </span>
              <span className="font-display mt-1 block text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {confirmedCount}
              </span>
              <span className="text-muted-foreground mt-0.5 block text-[10px]">
                Ready to depart
              </span>
            </div>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CalendarDays className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="flex items-center justify-between p-4 sm:p-5">
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium tracking-wider uppercase">
                Completed
              </span>
              <span className="font-display text-foreground mt-1 block text-2xl font-bold tracking-tight">
                {completedCount}
              </span>
              <span className="text-muted-foreground mt-0.5 block text-[10px]">Tours finished</span>
            </div>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Compass className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="flex items-center justify-between p-4 sm:p-5">
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium tracking-wider uppercase">
                Reward Points
              </span>
              <span className="font-display text-primary mt-1 block text-2xl font-bold tracking-tight">
                {profile.rewardPoints}
              </span>
              <span className="text-muted-foreground mt-0.5 block text-[10px]">
                Spent {formatCurrency(totalPaid)}
              </span>
            </div>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Award className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hero Section: Featured Upcoming Tour */}
      {upcomingTour ? (
        <Card className="border-border bg-card overflow-hidden shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Tour Cover Image & Destination */}
            <div className="bg-muted relative min-h-[220px] overflow-hidden lg:col-span-5">
              <img
                src={upcomingTour.coverImage}
                alt={upcomingTour.destination}
                className="size-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <BookingStatusBadge status={upcomingTour.bookingStatus} />
                <PaymentStatusBadge status={upcomingTour.paymentStatus} />
              </div>
              <div className="absolute right-4 bottom-4 left-4 text-white">
                <span className="text-primary-200 block text-xs font-semibold tracking-wider uppercase">
                  Next Journey
                </span>
                <h3 className="font-display text-2xl leading-tight font-bold tracking-tight text-white">
                  {upcomingTour.destination}
                </h3>
                <p className="mt-0.5 text-xs text-white/80">{upcomingTour.tourName}</p>
              </div>
            </div>

            {/* Tour Key Details & Countdown */}
            <div className="flex flex-col justify-between gap-5 p-5 sm:p-6 lg:col-span-7">
              <div className="flex flex-col gap-4">
                <div className="border-border flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <span className="text-muted-foreground block text-[11px] font-medium tracking-wider uppercase">
                      Booking Reference
                    </span>
                    <span className="text-foreground font-mono text-sm font-bold">
                      {upcomingTour.id}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => onViewBookingDetails(upcomingTour)}
                  >
                    <Eye className="size-3.5" />
                    <span>Quick View Details</span>
                  </Button>
                </div>

                {/* Logistics Badges */}
                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                      <Clock className="text-primary size-3" />
                      <span>Departure</span>
                    </span>
                    <span className="text-foreground font-semibold">
                      {formattedUpcomingDeparture}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {upcomingTour.departureTime}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                      <Bus className="text-primary size-3" />
                      <span>Bus &amp; Seat</span>
                    </span>
                    <span className="text-primary font-mono text-sm font-bold sm:text-base">
                      {upcomingTour.seatNumbers.join(', ')}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {upcomingTour.busInfo.acType} Coach
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                      <MapPin className="text-primary size-3" />
                      <span>Package</span>
                    </span>
                    <span className="text-foreground truncate font-semibold capitalize">
                      {upcomingTour.packageName}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {upcomingTour.duration}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[11px]">Tour Host</span>
                    <span className="text-foreground truncate font-semibold">
                      {upcomingTour.hostInfo.name}
                    </span>
                    <a
                      href={upcomingTour.hostInfo.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-[11px] font-medium hover:underline"
                    >
                      WhatsApp Host &rarr;
                    </a>
                  </div>
                </div>

                {/* Live Countdown */}
                <TourCountdown targetDate={upcomingTour.departureDate} className="mt-1" />
              </div>

              {/* Action Buttons */}
              <div className="border-border flex flex-wrap items-center justify-end gap-2 border-t pt-2">
                <Link to="/dashboard/live-location">
                  <Button
                    size="sm"
                    className="gap-1.5 bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                  >
                    <Radio className="size-3.5 animate-pulse" />
                    <span>Track Bus Live</span>
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => onTabChange('upcoming')}
                >
                  <span>Full Schedule</span>
                  <ArrowRight className="size-3.5" />
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-1.5 text-xs"
                  onClick={() => onViewTicket(upcomingTour)}
                >
                  <Ticket className="size-3.5" />
                  <span>Digital Ticket</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-border bg-card border-dashed p-8 text-center">
          <Compass className="text-muted-foreground/40 mx-auto mb-3 size-10" />
          <h3 className="font-display text-lg font-bold">No Upcoming Tour Scheduled</h3>
          <p className="text-muted-foreground mx-auto mt-1 mb-4 max-w-md text-xs">
            You don&apos;t have any active bookings departing in the near future. Check out our
            latest tours to Sajek, Cox&apos;s Bazar, and Sylhet.
          </p>
          <Button asChild size="sm">
            <a href="/tours">Browse Available Tours</a>
          </Button>
        </Card>
      )}

      {/* Grid: Host Contact Card + Recent Bookings Glance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Host Contact Card */}
        {upcomingTour && (
          <div className="lg:col-span-5">
            <HostContactCard host={upcomingTour.hostInfo} tourName={upcomingTour.destination} />
          </div>
        )}

        {/* Recent Bookings Glance */}
        <div className={upcomingTour ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Recent Bookings</CardTitle>
                <p className="text-muted-foreground text-xs">
                  Your travel history and upcoming trips
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary h-8 gap-1 text-xs"
                onClick={() => onTabChange('bookings')}
              >
                <span>View All ({bookings.length})</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {bookings.slice(0, 2).map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onViewDetails={onViewBookingDetails}
                    onViewTicket={onViewTicket}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

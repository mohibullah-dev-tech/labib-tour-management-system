import {
  Compass,
  CalendarCheck2,
  Users,
  Bus,
  AlertTriangle,
  MessageSquare,
  Navigation,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  UserX,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventLifecycleBadge } from '@/features/host/components/EventLifecycleBadge';
import type {
  AssignedEvent,
  HostGuest,
  HostDashboardTab,
  HostProfile,
} from '@/features/host/types';

interface HostOverviewViewProps {
  todayEvent: AssignedEvent | null;
  events: AssignedEvent[];
  guests: HostGuest[];
  profile: HostProfile;
  unreadMessagesCount: number;
  isLocationSharingActive: boolean;
  onNavigateTab: (tab: HostDashboardTab) => void;
  onSelectEvent: (event: AssignedEvent) => void;
  onTriggerLifecycle: (action: 'boarding' | 'start' | 'complete') => void;
  onRequestLocationPermission: () => void;
}

export function HostOverviewView({
  todayEvent,
  events,
  guests,
  profile,
  unreadMessagesCount,
  isLocationSharingActive,
  onNavigateTab,
  onSelectEvent,
  onTriggerLifecycle,
  onRequestLocationPermission,
}: HostOverviewViewProps) {
  // Compute Guest Check-in statistics
  const checkedInCount = guests.filter((g) => g.checkInStatus === 'checked-in').length;
  const notCheckedInCount = guests.filter((g) => g.checkInStatus === 'not-checked-in').length;
  const absentCount = guests.filter((g) => g.checkInStatus === 'absent').length;
  const totalGuests = guests.length;
  const checkInPercent = totalGuests > 0 ? Math.round((checkedInCount / totalGuests) * 100) : 0;

  // Pending Guest issues (e.g. Due balance or special assistance)
  const pendingPaymentGuests = guests.filter(
    (g) => g.paymentStatus === 'due' || g.paymentStatus === 'partial',
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="from-primary-950 via-primary-900 to-primary-800 flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r p-5 text-white shadow-md sm:flex-row sm:items-center sm:p-6">
        <div>
          <span className="text-primary-200 block text-xs font-semibold tracking-wider uppercase">
            Tour Leader Mission Control
          </span>
          <h2 className="font-display mt-1 text-xl font-bold sm:text-2xl">
            Welcome back, {profile.fullName}!
          </h2>
          <p className="text-primary-100/90 mt-1 max-w-xl text-xs sm:text-sm">
            You are currently assigned as lead host for{' '}
            <strong className="text-white">{todayEvent?.tourName ?? 'Sajek Valley'}</strong>{' '}
            departing from Sayedabad with {totalGuests} registered passengers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            size="sm"
            onClick={() => onNavigateTab('today')}
            className="text-primary-950 hover:bg-primary-50 gap-1.5 bg-white font-bold shadow-xs"
          >
            <Compass className="size-4" />
            <span>Manage Today&apos;s Tour</span>
          </Button>
        </div>
      </div>

      {/* 6 Key Operational KPI Cards */}
      <div className="laptop:grid-cols-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {/* Card 1: Today's Events */}
        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="flex h-full flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-semibold uppercase">
                Today
              </span>
              <div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-lg">
                <Compass className="size-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-foreground text-2xl font-black">{todayEvent ? 1 : 0}</span>
              <span className="text-muted-foreground block text-[10px]">Active Event</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Upcoming Events */}
        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="flex h-full flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-semibold uppercase">
                Upcoming
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <CalendarCheck2 className="size-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-foreground text-2xl font-black">{events.length}</span>
              <span className="text-muted-foreground block text-[10px]">Assigned Tours</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Guests */}
        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="flex h-full flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-semibold uppercase">
                Passengers
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <Users className="size-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-foreground text-2xl font-black">{totalGuests}</span>
              <span className="block text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                {checkedInCount} Checked In
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Assigned Buses */}
        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="flex h-full flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-semibold uppercase">
                Coach
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                <Bus className="size-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-foreground font-mono text-sm font-bold">
                {todayEvent?.bus.busNumber ?? 'LABIB-01'}
              </span>
              <span className="text-muted-foreground block text-[10px]">
                {todayEvent?.bus.availableSeats ?? 13} Seats Free
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Pending Guest Issues */}
        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="flex h-full flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-semibold uppercase">
                Payment Dues
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <AlertTriangle className="size-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {pendingPaymentGuests.length}
              </span>
              <span className="text-muted-foreground block text-[10px]">Guests with Due</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Unread Messages */}
        <Card
          className="border-border bg-card hover:border-primary/50 cursor-pointer shadow-2xs transition-colors"
          onClick={() => onNavigateTab('messages')}
        >
          <CardContent className="flex h-full flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px] font-semibold uppercase">
                Messages
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                <MessageSquare className="size-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-foreground text-2xl font-black">{unreadMessagesCount}</span>
              <span className="text-muted-foreground block text-[10px]">Unread Chats</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Today's Tour Card */}
      {todayEvent && (
        <Card className="border-border bg-card overflow-hidden shadow-xs">
          <div className="laptop:flex-row flex flex-col items-stretch">
            {/* Tour Image banner */}
            <div className="laptop:w-72 laptop:h-auto bg-muted relative h-48 shrink-0 overflow-hidden">
              <img
                src={todayEvent.coverImage}
                alt={todayEvent.destination}
                className="size-full object-cover"
              />
              <div className="laptop:bg-gradient-to-r absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute right-3 bottom-3 left-3 text-white">
                <Badge className="bg-primary text-primary-foreground mb-1 text-[10px] font-bold">
                  TODAY&apos;S MISSION
                </Badge>
                <h3 className="font-display text-lg leading-tight font-bold">
                  {todayEvent.destination}
                </h3>
                <span className="mt-0.5 block text-xs text-white/80">{todayEvent.duration}</span>
              </div>
            </div>

            {/* Tour details & Live controls */}
            <div className="flex flex-1 flex-col justify-between gap-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-display text-foreground text-lg font-bold sm:text-xl">
                    {todayEvent.tourName}
                  </h4>
                  <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
                    <MapPin className="text-primary size-3.5" />
                    <span>Meeting: {todayEvent.meetingPoint}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <EventLifecycleBadge status={todayEvent.status} />
                </div>
              </div>

              {/* Schedule, Bus, Guest metrics strip */}
              <div className="bg-muted/30 border-border grid grid-cols-2 gap-3 rounded-xl border p-3.5 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Departure Time</span>
                  <span className="text-foreground flex items-center gap-1 font-bold">
                    <Clock className="text-primary size-3.5" />
                    {todayEvent.departureTime} (Reporting {todayEvent.reportingTime})
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Assigned Bus</span>
                  <span className="text-foreground font-mono font-bold">
                    {todayEvent.bus.busNumber} ({todayEvent.bus.name})
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Driver / Helper</span>
                  <span className="text-foreground font-medium">
                    {todayEvent.bus.driverName} ({todayEvent.bus.driverPhone})
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">Booked Passengers</span>
                  <span className="text-primary font-bold">
                    {totalGuests} / {todayEvent.bus.totalSeats} Seats (
                    {todayEvent.bus.availableSeats} Free)
                  </span>
                </div>
              </div>

              {/* Roll-call check-in live bar */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    <span>
                      Roll-Call Check-In: {checkedInCount} of {totalGuests} Boarded
                    </span>
                  </span>
                  <span className="text-primary font-mono font-bold">{checkInPercent}%</span>
                </div>

                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${checkInPercent}%` }}
                  />
                </div>

                <div className="text-muted-foreground flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" /> {checkedInCount} Checked In
                  </span>
                  <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                    <Clock className="size-3" /> {notCheckedInCount} Pending Boarding
                  </span>
                  <span className="flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400">
                    <UserX className="size-3" /> {absentCount} Absent
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => onNavigateTab('guests')}
                  >
                    <Users className="size-3.5" />
                    <span>Open Guest List</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => onNavigateTab('seats')}
                  >
                    <Bus className="size-3.5" />
                    <span>View Seating Chart</span>
                  </Button>

                  <Button
                    size="sm"
                    variant={isLocationSharingActive ? 'default' : 'outline'}
                    className={`gap-1.5 text-xs ${
                      isLocationSharingActive ? 'bg-rose-600 text-white hover:bg-rose-700' : ''
                    }`}
                    onClick={onRequestLocationPermission}
                  >
                    <Navigation className="size-3.5" />
                    <span>
                      {isLocationSharingActive ? 'GPS Sharing: LIVE' : 'Start GPS Sharing'}
                    </span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {todayEvent.status === 'preparing' && (
                    <Button
                      size="sm"
                      className="gap-1.5 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
                      onClick={() => onTriggerLifecycle('boarding')}
                    >
                      <Users className="size-3.5" />
                      <span>Start Boarding</span>
                    </Button>
                  )}

                  {todayEvent.status === 'boarding' && (
                    <Button
                      size="sm"
                      className="gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                      onClick={() => onTriggerLifecycle('start')}
                    >
                      <Navigation className="size-3.5" />
                      <span>Start Tour &amp; Depart</span>
                    </Button>
                  )}

                  {(todayEvent.status === 'started' || todayEvent.status === 'in-progress') && (
                    <Button
                      size="sm"
                      className="gap-1.5 bg-purple-600 text-xs text-white hover:bg-purple-700"
                      onClick={() => onTriggerLifecycle('complete')}
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>Complete Tour</span>
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-primary gap-1 text-xs"
                    onClick={() => onSelectEvent(todayEvent)}
                  >
                    <span>Full Event Details</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Navigation Cards Grid */}
      <div className="laptop:grid-cols-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Card 1: Today's Tour cockpit */}
        <button
          type="button"
          onClick={() => onNavigateTab('today')}
          className="group border-border bg-card hover:border-primary/50 flex w-full cursor-pointer flex-col justify-between gap-3 rounded-xl border p-4 text-left shadow-2xs transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
              <Compass className="size-4" />
            </div>
            <ArrowRight className="text-muted-foreground group-hover:text-primary size-4 transition-transform group-hover:translate-x-1" />
          </div>
          <div>
            <h4 className="text-foreground text-sm font-bold">Today&apos;s Departure Cockpit</h4>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Live checklist, boarding passes, and departure lifecycle status.
            </p>
          </div>
        </button>

        {/* Card 2: Passenger Manifest */}
        <button
          type="button"
          onClick={() => onNavigateTab('guests')}
          className="group border-border bg-card hover:border-primary/50 flex w-full cursor-pointer flex-col justify-between gap-3 rounded-xl border p-4 text-left shadow-2xs transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Users className="size-4" />
            </div>
            <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
          </div>
          <div>
            <h4 className="text-foreground text-sm font-bold">Guest Manifest &amp; Check-In</h4>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Inspect guest phone numbers, special notes, and roll-call.
            </p>
          </div>
        </button>

        {/* Card 3: Live GPS Sharing */}
        <button
          type="button"
          onClick={() => onNavigateTab('location')}
          className="group border-border bg-card hover:border-primary/50 flex w-full cursor-pointer flex-col justify-between gap-3 rounded-xl border p-4 text-left shadow-2xs transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
              <Navigation className="size-4" />
            </div>
            <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-1 group-hover:text-rose-600" />
          </div>
          <div>
            <h4 className="text-foreground text-sm font-bold">Live GPS Broadcast</h4>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Broadcast vehicle telemetry so guests can see highway arrival time.
            </p>
          </div>
        </button>

        {/* Card 4: Tour Itinerary Timeline */}
        <button
          type="button"
          onClick={() => onNavigateTab('timeline')}
          className="group border-border bg-card hover:border-primary/50 flex w-full cursor-pointer flex-col justify-between gap-3 rounded-xl border p-4 text-left shadow-2xs transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
              <Clock className="size-4" />
            </div>
            <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600" />
          </div>
          <div>
            <h4 className="text-foreground text-sm font-bold">Tour Journey Milestones</h4>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Highway stops, convoy checkpoint, and Sajek resort schedule.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

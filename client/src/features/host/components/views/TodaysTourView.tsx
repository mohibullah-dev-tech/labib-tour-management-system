import { useState } from 'react';
import {
  Compass,
  Users,
  Navigation,
  CheckCircle2,
  UserX,
  Phone,
  MapPin,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EventLifecycleBadge } from '@/features/host/components/EventLifecycleBadge';
import { CheckInBadge } from '@/features/host/components/CheckInBadge';
import type {
  AssignedEvent,
  HostGuest,
  CheckInStatus,
  HostDashboardTab,
} from '@/features/host/types';

interface TodaysTourViewProps {
  event: AssignedEvent | null;
  guests: HostGuest[];
  isLocationSharingActive: boolean;
  onUpdateCheckIn: (guestId: string, status: CheckInStatus) => void;
  onSelectGuest: (guest: HostGuest) => void;
  onTriggerLifecycle: (action: 'boarding' | 'start' | 'complete') => void;
  onRequestLocationPermission: () => void;
  onNavigateTab: (tab: HostDashboardTab) => void;
}

export function TodaysTourView({
  event,
  guests,
  isLocationSharingActive,
  onUpdateCheckIn,
  onSelectGuest,
  onTriggerLifecycle,
  onRequestLocationPermission,
  onNavigateTab,
}: TodaysTourViewProps) {
  const [search, setSearch] = useState('');
  const [filterCheckIn, setFilterCheckIn] = useState<'all' | CheckInStatus>('all');

  if (!event) {
    return (
      <Card className="border-dashed p-12 text-center">
        <Compass className="text-muted-foreground/30 mx-auto mb-3 size-12" />
        <h3 className="font-display text-lg font-bold">No Tour Assigned for Today</h3>
        <p className="text-muted-foreground mx-auto mt-1 max-w-md text-xs">
          You don&apos;t have any departures scheduled for today. Check upcoming tours in the
          &ldquo;My Events&rdquo; tab.
        </p>
      </Card>
    );
  }

  const checkedInCount = guests.filter((g) => g.checkInStatus === 'checked-in').length;
  const notCheckedInCount = guests.filter((g) => g.checkInStatus === 'not-checked-in').length;
  const absentCount = guests.filter((g) => g.checkInStatus === 'absent').length;
  const totalGuests = guests.length;
  const percentCheckedIn = totalGuests > 0 ? Math.round((checkedInCount / totalGuests) * 100) : 0;

  const filteredGuests = guests.filter((g) => {
    const matchesFilter = filterCheckIn === 'all' || g.checkInStatus === filterCheckIn;
    const matchesSearch =
      g.fullName.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.includes(search) ||
      g.seatNumbers.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      g.pickupPoint.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner: Departure Lifecycle Header */}
      <Card className="border-border bg-card overflow-hidden shadow-xs">
        <div className="from-primary-900 to-primary-950 flex flex-col justify-between gap-4 bg-gradient-to-r p-5 text-white sm:p-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-mono text-[10px]">
                {event.id}
              </Badge>
              <EventLifecycleBadge status={event.status} />
            </div>
            <h2 className="font-display mt-1 text-xl font-black text-white sm:text-2xl">
              {event.destination}: {event.tourName}
            </h2>
            <p className="text-primary-100/90 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span>
                Departure: <strong>{event.departureTime}</strong>
              </span>
              <span>•</span>
              <span>
                Reporting: <strong>{event.reportingTime}</strong>
              </span>
              <span>•</span>
              <span>
                Bus: <strong>{event.bus.busNumber}</strong>
              </span>
            </p>
          </div>

          {/* Quick Lifecycle Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 bg-white/10 text-xs font-semibold text-white hover:bg-white/20"
              onClick={() => onNavigateTab('seats')}
            >
              Seating Map
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/20 bg-white/10 text-xs font-semibold text-white hover:bg-white/20"
              onClick={() => onNavigateTab('timeline')}
            >
              Timeline
            </Button>
            {event.status === 'preparing' && (
              <Button
                size="sm"
                className="gap-1.5 bg-indigo-600 font-bold text-white shadow-sm hover:bg-indigo-700"
                onClick={() => onTriggerLifecycle('boarding')}
              >
                <Users className="size-4" />
                <span>Call Passenger Boarding</span>
              </Button>
            )}

            {event.status === 'boarding' && (
              <Button
                size="sm"
                className="animate-pulse gap-1.5 bg-emerald-600 font-bold text-white shadow-sm hover:bg-emerald-700"
                onClick={() => onTriggerLifecycle('start')}
              >
                <Navigation className="size-4" />
                <span>Start Tour &amp; Depart</span>
              </Button>
            )}

            {(event.status === 'started' || event.status === 'in-progress') && (
              <Button
                size="sm"
                className="gap-1.5 bg-purple-600 font-bold text-white shadow-sm hover:bg-purple-700"
                onClick={() => onTriggerLifecycle('complete')}
              >
                <CheckCircle2 className="size-4" />
                <span>Complete Tour</span>
              </Button>
            )}
          </div>
        </div>

        {/* Live GPS Broadcast Status Banner */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-xs ${
            isLocationSharingActive
              ? 'border-rose-500/20 bg-rose-500/10 text-rose-800 dark:text-rose-300'
              : 'bg-muted/40 border-border text-muted-foreground'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex size-2.5">
              {isLocationSharingActive && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex size-2.5 rounded-full ${
                  isLocationSharingActive ? 'bg-rose-600' : 'bg-muted-foreground/60'
                }`}
              />
            </span>
            <span>
              {isLocationSharingActive
                ? `Live GPS Broadcasting is ACTIVE: All ${totalGuests} guests can see your real-time highway position.`
                : 'Live GPS Broadcasting is OFF. Passengers cannot track vehicle coordinates.'}
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs font-semibold"
            onClick={onRequestLocationPermission}
          >
            {isLocationSharingActive ? 'Turn Off Sharing' : 'Turn On Live Location'}
          </Button>
        </div>
      </Card>

      {/* Roll-Call Progress Bar Strip */}
      <Card className="border-border bg-card p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <span className="text-foreground text-sm font-bold">
                Roll-Call Boarding Status: {checkedInCount} / {totalGuests} Passengers
              </span>
            </div>
            <span className="text-primary font-mono text-base font-black">{percentCheckedIn}%</span>
          </div>

          <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${percentCheckedIn}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
            <button
              type="button"
              onClick={() => setFilterCheckIn('checked-in')}
              className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 transition-colors hover:bg-emerald-500/20"
            >
              <span className="text-muted-foreground block text-[11px]">Boarded</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {checkedInCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterCheckIn('not-checked-in')}
              className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 transition-colors hover:bg-amber-500/20"
            >
              <span className="text-muted-foreground block text-[11px]">Pending Boarding</span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                {notCheckedInCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterCheckIn('absent')}
              className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 transition-colors hover:bg-rose-500/20"
            >
              <span className="text-muted-foreground block text-[11px]">Absent / No-Show</span>
              <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                {absentCount}
              </span>
            </button>
          </div>
        </div>
      </Card>

      {/* Fast Check-In Roster for Host on the bus */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="flex flex-col justify-between gap-3 pb-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="text-base">Rapid Passenger Check-In Roster</CardTitle>
            <CardDescription className="text-xs">
              Tap &ldquo;Check-In&rdquo; as guests board at Sayedabad counter or en-route pickup
              stations.
            </CardDescription>
          </div>

          {/* Search bar & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-60">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <Input
                placeholder="Search name, seat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>

            {filterCheckIn !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary h-8 text-xs"
                onClick={() => setFilterCheckIn('all')}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-border divide-y">
            {filteredGuests.length === 0 ? (
              <div className="text-muted-foreground p-8 text-center text-xs">
                No travelers matched your search filter.
              </div>
            ) : (
              filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="hover:bg-muted/40 flex flex-col justify-between gap-3 p-3.5 transition-colors sm:flex-row sm:items-center sm:p-4"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    {/* Seat Pill */}
                    <div className="bg-primary/10 border-primary/20 flex size-10 shrink-0 flex-col items-center justify-center rounded-xl border">
                      <span className="text-primary text-[9px] leading-tight font-bold uppercase">
                        Seat
                      </span>
                      <span className="text-foreground font-mono text-xs font-black">
                        {guest.seatNumbers.join(',')}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectGuest(guest)}
                          className="text-foreground hover:text-primary truncate text-left text-sm font-bold transition-colors"
                        >
                          {guest.fullName}
                        </button>
                        <CheckInBadge status={guest.checkInStatus} size="sm" />
                      </div>

                      <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <a
                          href={`tel:${guest.phone}`}
                          className="hover:text-primary flex items-center gap-1"
                        >
                          <Phone className="size-3" />
                          <span>{guest.phone}</span>
                        </a>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          <span>Pickup: {guest.pickupPoint}</span>
                        </span>
                        {guest.dueAmount > 0 && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-rose-600 dark:text-rose-400">
                              Due: ৳{guest.dueAmount}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 1-Tap Check-In Controls */}
                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant={guest.checkInStatus === 'checked-in' ? 'default' : 'outline'}
                      className={`h-8 gap-1.5 text-xs ${
                        guest.checkInStatus === 'checked-in'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : ''
                      }`}
                      onClick={() =>
                        onUpdateCheckIn(
                          guest.id,
                          guest.checkInStatus === 'checked-in' ? 'not-checked-in' : 'checked-in',
                        )
                      }
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>
                        {guest.checkInStatus === 'checked-in' ? 'Checked In' : 'Check In'}
                      </span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground h-8 text-xs hover:text-rose-600"
                      onClick={() => onUpdateCheckIn(guest.id, 'absent')}
                    >
                      <UserX className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

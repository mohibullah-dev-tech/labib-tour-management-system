import { Bus, Users, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { HostSeatMap } from '@/features/host/components/HostSeatMap';
import type { AssignedEvent, HostGuest, CheckInStatus } from '@/features/host/types';

interface BusSeatsViewProps {
  event: AssignedEvent | null;
  guests: HostGuest[];
  onSelectGuest: (guest: HostGuest) => void;
  onUpdateCheckIn: (guestId: string, status: CheckInStatus) => void;
}

export function BusSeatsView({ event, guests, onSelectGuest, onUpdateCheckIn }: BusSeatsViewProps) {
  const bus = event?.bus ?? {
    busNumber: 'LABIB-01',
    name: 'Labib Royal Star Liner',
    acType: 'AC',
    totalSeats: 45,
    bookedSeats: 32,
    availableSeats: 13,
  };

  const checkedInSeatsCount = guests
    .filter((g) => g.checkInStatus === 'checked-in')
    .reduce((sum, g) => sum + g.seatNumbers.length, 0);

  const pendingSeatsCount = guests
    .filter((g) => g.checkInStatus === 'not-checked-in')
    .reduce((sum, g) => sum + g.seatNumbers.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-display text-foreground text-lg font-bold sm:text-xl">
            Bus Seating Chart &amp; Cabin Roll-Call
          </h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Coach {bus.busNumber} • Rows A to J (2x2) and Back Row K (5-seater bench). Tap any seat
            to inspect passenger.
          </p>
        </div>
      </div>

      {/* 4 Summary Stat Mini-Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-border bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px] font-bold uppercase">
              Total Capacity
            </span>
            <Bus className="text-primary size-3.5" />
          </div>
          <span className="text-foreground mt-2 block font-mono text-xl font-black">
            {bus.totalSeats} Seats
          </span>
        </Card>

        <Card className="border-border bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase dark:text-emerald-400">
              Checked In
            </span>
            <CheckCircle2 className="size-3.5 text-emerald-600" />
          </div>
          <span className="mt-2 block font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">
            {checkedInSeatsCount} Seats
          </span>
        </Card>

        <Card className="border-border bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase dark:text-amber-400">
              Pending Boarding
            </span>
            <Users className="size-3.5 text-amber-600" />
          </div>
          <span className="mt-2 block font-mono text-xl font-black text-amber-600 dark:text-amber-400">
            {pendingSeatsCount} Seats
          </span>
        </Card>

        <Card className="border-border bg-card p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-[11px] font-bold uppercase">
              Unbooked Free
            </span>
            <span className="border-border size-3.5 rounded-full border" />
          </div>
          <span className="text-foreground mt-2 block font-mono text-xl font-black">
            {bus.availableSeats} Free
          </span>
        </Card>
      </div>

      {/* Seating Map Interactive Component */}
      <HostSeatMap
        busNumber={bus.busNumber}
        busName={bus.name}
        guests={guests}
        onSelectGuest={onSelectGuest}
        onUpdateCheckIn={onUpdateCheckIn}
      />
    </div>
  );
}

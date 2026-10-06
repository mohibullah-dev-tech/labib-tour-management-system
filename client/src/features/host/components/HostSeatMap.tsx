import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  DoorOpen,
  CheckCircle2,
  Clock,
  UserX,
  ZoomIn,
  ZoomOut,
  Phone,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { HostGuest, CheckInStatus } from '@/features/host/types';

interface HostSeatMapProps {
  busNumber: string;
  busName: string;
  guests: HostGuest[];
  onSelectGuest?: (guest: HostGuest) => void;
  onUpdateCheckIn?: (guestId: string, status: CheckInStatus) => void;
}

const ROW_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

interface HostSeatItem {
  id: string; // e.g. "A1"
  status: 'available' | 'booked' | 'checked-in' | 'absent';
  guest?: HostGuest;
}

export function HostSeatMap({
  busNumber,
  busName,
  guests,
  onSelectGuest,
  onUpdateCheckIn,
}: HostSeatMapProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedSeat, setSelectedSeat] = useState<HostSeatItem | null>(null);

  // Build a lookup map from seatNumber -> HostGuest
  const seatToGuestMap = new Map<string, HostGuest>();
  guests.forEach((g) => {
    g.seatNumbers.forEach((seat) => {
      seatToGuestMap.set(seat, g);
    });
  });

  const getSeatItem = (seatId: string): HostSeatItem => {
    const guest = seatToGuestMap.get(seatId);
    if (!guest) {
      return { id: seatId, status: 'available' };
    }
    if (guest.checkInStatus === 'checked-in') {
      return { id: seatId, status: 'checked-in', guest };
    }
    if (guest.checkInStatus === 'absent') {
      return { id: seatId, status: 'absent', guest };
    }
    return { id: seatId, status: 'booked', guest };
  };

  const rows = ROW_LETTERS.map((row) => ({
    row,
    seats: [1, 2, 3, 4].map((pos) => getSeatItem(`${row}${pos}`)),
  }));

  const backRow = {
    row: 'K',
    seats: [1, 2, 3, 4, 5].map((pos) => getSeatItem(`K${pos}`)),
  };

  const handleSeatClick = (seat: HostSeatItem) => {
    setSelectedSeat(seat);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Bus Header & Mobile Zoom Controls */}
      <div className="bg-muted/40 border-border flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-primary font-mono text-xs font-bold">{busNumber}</span>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-foreground text-xs font-semibold">{busName}</span>
          </div>
          <p className="text-muted-foreground mt-0.5 text-[11px]">
            Click on any seat to inspect traveler booking details and trigger instant check-in.
          </p>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground mr-1 hidden text-xs sm:inline">Scale:</span>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            disabled={zoomLevel <= 0.85}
            onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
            aria-label="Zoom out seat map"
          >
            <ZoomOut className="size-3.5" />
          </Button>
          <span className="w-10 text-center font-mono text-xs">{Math.round(zoomLevel * 100)}%</span>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            disabled={zoomLevel >= 1.3}
            onClick={() => setZoomLevel((z) => Math.min(1.3, z + 0.15))}
            aria-label="Zoom in seat map"
          >
            <ZoomIn className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Bus Cockpit & Grid Container */}
      <div className="laptop:grid-cols-3 grid grid-cols-1 items-start gap-6">
        {/* Seat Map Viewport */}
        <div className="laptop:col-span-2 border-border bg-card overflow-x-auto rounded-2xl border p-4 shadow-xs sm:p-6">
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            className="mx-auto flex w-fit flex-col gap-2.5 transition-transform"
          >
            {/* Front of bus: Driver, Helper, Door */}
            <div className="bg-muted text-muted-foreground border-border/60 mb-3 flex items-center justify-between rounded-lg border px-4 py-2.5 text-xs font-medium">
              <span className="text-foreground flex items-center gap-1.5">
                <User className="text-primary size-4" aria-hidden="true" />
                <span>Driver (Md. Mostofa)</span>
              </span>
              <span className="text-foreground flex items-center gap-2">
                <span>Helper &amp; Door</span>
                <DoorOpen className="size-4 text-emerald-600" aria-hidden="true" />
              </span>
            </div>

            {/* Rows A-J */}
            {rows.map(({ row, seats }) => (
              <div key={row} className="flex items-center gap-3">
                <span className="text-muted-foreground w-4 shrink-0 text-center font-mono text-xs font-bold">
                  {row}
                </span>

                <div className="flex flex-1 items-center justify-center gap-2">
                  {/* Left pair (1, 2) */}
                  <div className="flex gap-2">
                    {seats.slice(0, 2).map((seat) => (
                      <HostSeatButton
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedSeat?.id === seat.id}
                        onClick={() => handleSeatClick(seat)}
                      />
                    ))}
                  </div>

                  {/* Center Aisle */}
                  <div className="flex w-8 shrink-0 items-center justify-center" aria-hidden="true">
                    <span className="bg-border/60 h-4 w-px" />
                  </div>

                  {/* Right pair (3, 4) */}
                  <div className="flex gap-2">
                    {seats.slice(2, 4).map((seat) => (
                      <HostSeatButton
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedSeat?.id === seat.id}
                        onClick={() => handleSeatClick(seat)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Back Row K: 5 Seats */}
            <div className="border-border/80 mt-1 flex items-center gap-3 border-t border-dashed pt-2">
              <span className="text-muted-foreground w-4 shrink-0 text-center font-mono text-xs font-bold">
                K
              </span>
              <div className="flex flex-1 justify-center gap-2">
                {backRow.seats.map((seat) => (
                  <HostSeatButton
                    key={seat.id}
                    seat={seat}
                    isSelected={selectedSeat?.id === seat.id}
                    onClick={() => handleSeatClick(seat)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Seat Inspector & Details Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="border-border bg-card rounded-2xl border p-5 shadow-xs">
            <h4 className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
              Seat Inspector
            </h4>

            {selectedSeat ? (
              <div className="flex flex-col gap-4">
                <div className="border-border flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-muted-foreground block text-xs">Selected Seat</span>
                    <span className="text-foreground font-mono text-2xl font-black">
                      {selectedSeat.id}
                    </span>
                  </div>
                  <div>
                    {selectedSeat.status === 'checked-in' && (
                      <Badge className="gap-1 bg-emerald-600 text-xs">
                        <CheckCircle2 className="size-3.5" /> Checked In
                      </Badge>
                    )}
                    {selectedSeat.status === 'booked' && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-amber-500/40 bg-amber-500/10 text-xs text-amber-700"
                      >
                        <Clock className="size-3.5" /> Not Checked In
                      </Badge>
                    )}
                    {selectedSeat.status === 'absent' && (
                      <Badge variant="destructive" className="gap-1 text-xs">
                        <UserX className="size-3.5" /> Absent
                      </Badge>
                    )}
                    {selectedSeat.status === 'available' && (
                      <Badge variant="secondary" className="text-xs">
                        Empty / Available
                      </Badge>
                    )}
                  </div>
                </div>

                {selectedSeat.guest ? (
                  <div className="flex flex-col gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Traveler Name</span>
                      <span className="text-foreground text-base font-bold">
                        {selectedSeat.guest.fullName}
                      </span>
                      <span className="text-muted-foreground block font-mono text-[11px]">
                        Ref: {selectedSeat.guest.bookingId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="text-primary size-3.5 shrink-0" />
                      <a
                        href={`tel:${selectedSeat.guest.phone}`}
                        className="text-primary font-medium hover:underline"
                      >
                        {selectedSeat.guest.phone}
                      </a>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="text-primary mt-0.5 size-3.5 shrink-0" />
                      <span className="text-foreground">{selectedSeat.guest.pickupPoint}</span>
                    </div>

                    {selectedSeat.guest.specialNotes && (
                      <div className="bg-muted/60 text-muted-foreground border-border/60 rounded-lg border p-2 text-[11px]">
                        <span className="text-foreground block font-medium">Note:</span>
                        {selectedSeat.guest.specialNotes}
                      </div>
                    )}

                    {/* Quick check-in toggle */}
                    <div className="border-border flex items-center gap-2 border-t pt-2">
                      {onUpdateCheckIn && (
                        <>
                          <Button
                            size="sm"
                            className={`flex-1 gap-1.5 text-xs ${
                              selectedSeat.guest.checkInStatus === 'checked-in'
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : ''
                            }`}
                            onClick={() =>
                              onUpdateCheckIn(
                                selectedSeat.guest!.id,
                                selectedSeat.guest!.checkInStatus === 'checked-in'
                                  ? 'not-checked-in'
                                  : 'checked-in',
                              )
                            }
                          >
                            <CheckCircle2 className="size-3.5" />
                            <span>
                              {selectedSeat.guest.checkInStatus === 'checked-in'
                                ? 'Checked In'
                                : 'Check In'}
                            </span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-rose-600 hover:text-rose-700"
                            onClick={() => onUpdateCheckIn(selectedSeat.guest!.id, 'absent')}
                          >
                            Mark Absent
                          </Button>
                        </>
                      )}
                    </div>

                    {onSelectGuest && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary mt-1 w-full text-xs"
                        onClick={() => onSelectGuest(selectedSeat.guest!)}
                      >
                        View Full Guest Details &rarr;
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground py-8 text-center text-xs">
                    <p>Seat {selectedSeat.id} is unreserved.</p>
                    <p className="mt-1 text-[11px]">Available for counter walk-ins or booking.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground py-12 text-center text-xs">
                <p>
                  Click any seat on the bus to view assigned guest details and roll-call check-in.
                </p>
              </div>
            )}
          </div>

          {/* Seat Status Legend */}
          <div className="border-border bg-card rounded-2xl border p-4 shadow-xs">
            <h4 className="text-muted-foreground mb-2.5 text-xs font-semibold tracking-wider uppercase">
              Seat Legend
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex size-4 items-center justify-center rounded-md bg-emerald-600 text-[10px] text-white">
                  ✓
                </span>
                <span className="text-foreground text-[11px]">Checked In</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-4 rounded-md border border-neutral-400 bg-neutral-300 dark:bg-neutral-700" />
                <span className="text-foreground text-[11px]">Booked (Pending)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-4 rounded-md border border-rose-400 bg-rose-200 dark:bg-rose-900" />
                <span className="text-foreground text-[11px]">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-background border-border size-4 rounded-md border" />
                <span className="text-foreground text-[11px]">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const HostSeatButton = memo(function HostSeatButton({
  seat,
  isSelected,
  onClick,
}: {
  seat: HostSeatItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  let styleClasses =
    'border-border bg-background text-foreground hover:border-primary/60 hover:bg-primary/5';

  if (seat.status === 'checked-in') {
    styleClasses = 'border-emerald-600 bg-emerald-600 text-white shadow-xs font-bold';
  } else if (seat.status === 'booked') {
    styleClasses =
      'border-neutral-400 bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-600 font-semibold';
  } else if (seat.status === 'absent') {
    styleClasses =
      'border-rose-400 bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-semibold';
  }

  if (isSelected) {
    styleClasses += ' ring-2 ring-primary ring-offset-2 scale-105';
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Seat ${seat.id}, ${seat.status}${seat.guest ? ` - ${seat.guest.fullName}` : ''}`}
      className={cn(
        'relative flex size-9.5 cursor-pointer items-center justify-center rounded-lg border-2 text-[11px] transition-all select-none',
        styleClasses,
      )}
    >
      {seat.status === 'checked-in' ? (
        <span className="flex flex-col items-center">
          <span className="text-[10px] leading-tight font-bold">{seat.id}</span>
        </span>
      ) : (
        seat.id
      )}
    </motion.button>
  );
});

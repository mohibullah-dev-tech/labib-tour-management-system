import { useState } from 'react';
import { Ticket } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DigitalTicket } from '@/features/guest/components/DigitalTicket';
import type { GuestBooking } from '@/features/guest/types';

interface TicketsViewProps {
  bookings: GuestBooking[];
}

export function TicketsView({ bookings }: TicketsViewProps) {
  const eligibleBookings = bookings.filter((b) => b.bookingStatus !== 'cancelled');
  const [selectedBookingId, setSelectedBookingId] = useState<string>(() => {
    return eligibleBookings[0]?.id || '';
  });

  const selectedBooking =
    eligibleBookings.find((b) => b.id === selectedBookingId) || eligibleBookings[0];

  if (eligibleBookings.length === 0) {
    return (
      <Card className="border-border bg-card border-dashed p-12 text-center">
        <Ticket className="text-muted-foreground/30 mx-auto mb-3 size-12" />
        <h3 className="font-display text-lg font-bold">No E-Tickets Available</h3>
        <p className="text-muted-foreground mx-auto mt-1 mb-5 max-w-md text-xs">
          E-tickets and boarding passes are automatically generated when you book a tour.
        </p>
        <Button asChild size="sm">
          <a href="/tours">Browse Available Tours</a>
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Ticket Selector Strip if multiple bookings exist */}
      {eligibleBookings.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground mr-2 text-xs font-medium tracking-wider uppercase">
            Select Ticket:
          </span>
          {eligibleBookings.map((b) => {
            const isSelected = b.id === selectedBooking?.id;
            return (
              <Button
                key={b.id}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedBookingId(b.id)}
                className="h-9 gap-2 text-xs"
              >
                <Ticket className="size-3.5" />
                <span>{b.destination}</span>
                <span className="font-mono text-[10px] opacity-80">({b.id})</span>
              </Button>
            );
          })}
        </div>
      )}

      {/* Featured Full Digital Ticket */}
      {selectedBooking && <DigitalTicket booking={selectedBooking} />}
    </div>
  );
}

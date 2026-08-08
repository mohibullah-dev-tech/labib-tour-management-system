import { CalendarDays, Users } from 'lucide-react';
import { Link } from 'react-router';
import type { Tour } from '@/features/tours/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatBDT, formatDate } from '@/lib/format';

export interface StickyBookingSummaryProps {
  tour: Tour;
}

/**
 * Two renders of the same summary: a sticky sidebar card on laptop+ (id
 * "booking" lives here, since there's room), and a fixed bottom bar on
 * mobile/tablet (id lives here instead) — only one is ever in the DOM's
 * visible flow at a time via `hidden`/`laptop:*`, so the `#booking`
 * anchor from TourCard's "Book Now" link always resolves to whichever
 * one is visible at the current breakpoint.
 */
function StickyBookingSummary({ tour }: StickyBookingSummaryProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <Card id="booking" className="laptop:sticky laptop:top-24 laptop:block hidden">
        <CardHeader>
          <CardTitle>Book This Tour</CardTitle>
          <p className="font-display text-primary text-2xl font-semibold">
            {formatBDT(tour.startingPriceBDT)}
          </p>
          <p className="text-muted-foreground text-xs">Starting price, per person</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Separator />
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                Next Departure
              </dt>
              <dd className="text-foreground font-medium">{formatDate(tour.nextDepartureDate)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground flex items-center gap-1.5">
                <Users className="size-4" />
                Seats Left
              </dt>
              <dd className="text-foreground font-medium">
                {tour.availableSeats} / {tour.totalSeats}
              </dd>
            </div>
          </dl>
          <Button
            size="lg"
            className="w-full"
            disabled={tour.availableSeats === 0}
            asChild={tour.availableSeats !== 0}
          >
            {tour.availableSeats === 0 ? (
              'Sold Out'
            ) : (
              <Link to={`/booking?tourId=${tour.id}`}>Book Now</Link>
            )}
          </Button>
          <p className="text-muted-foreground text-center text-xs">
            No payment required to reserve — pay a deposit later.
          </p>
        </CardContent>
      </Card>

      {/* Mobile/tablet bottom bar */}
      <div
        id="booking-mobile"
        className="border-border bg-card/95 shadow-floating laptop:hidden fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t p-4 backdrop-blur"
      >
        <div>
          <p className="text-muted-foreground text-xs">From</p>
          <p className="font-display text-primary text-lg font-semibold">
            {formatBDT(tour.startingPriceBDT)}
          </p>
        </div>
        <Button disabled={tour.availableSeats === 0} asChild={tour.availableSeats !== 0}>
          {tour.availableSeats === 0 ? (
            'Sold Out'
          ) : (
            <Link to={`/booking?tourId=${tour.id}`}>Book Now</Link>
          )}
        </Button>
      </div>
    </>
  );
}

export { StickyBookingSummary };

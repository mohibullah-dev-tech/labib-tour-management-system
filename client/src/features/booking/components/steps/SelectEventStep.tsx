import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, CalendarX } from 'lucide-react';
import { BOOKING_EVENTS } from '@/features/booking/data/events';
import { EventCard } from '@/features/booking/components/EventCard';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { staggerContainer } from '@/lib/animations/variants';

export interface SelectEventStepProps {
  /** Pre-filters to a specific tour's events when arriving from a Tour Details "Book Now" link. */
  tourIdFilter?: string;
  onClearFilter?: () => void;
}

/** Step 1 — every upcoming event, each field the brief lists on its card. */
function SelectEventStep({ tourIdFilter, onClearFilter }: SelectEventStepProps) {
  const { selectEvent } = useBooking();

  const events = useMemo(
    () => (tourIdFilter ? BOOKING_EVENTS.filter((e) => e.tourId === tourIdFilter) : BOOKING_EVENTS),
    [tourIdFilter],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-foreground text-xl font-semibold">Select an Event</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Choose an upcoming departure to start your booking.
        </p>
      </div>

      {tourIdFilter && events.length > 0 && (
        <div className="border-border bg-muted/40 flex items-center justify-between rounded-md border px-4 py-2 text-sm">
          <span className="text-muted-foreground">
            Showing events for{' '}
            <span className="text-foreground font-medium">{events[0].tourName}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={onClearFilter} className="gap-1.5">
            <X className="size-3.5" />
            Show all
          </Button>
        </div>
      )}

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No upcoming events for this tour"
          description="Check back soon, or browse all upcoming events instead."
          action={
            onClearFilter && (
              <Button variant="outline" onClick={onClearFilter}>
                Show All Events
              </Button>
            )
          }
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="laptop:grid-cols-3 grid grid-cols-1 gap-6 sm:grid-cols-2"
        >
          {events.map((event) => (
            <EventCard key={event.id} event={event} onSelect={selectEvent} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export { SelectEventStep };

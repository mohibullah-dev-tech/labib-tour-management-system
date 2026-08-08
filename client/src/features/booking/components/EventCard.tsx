import { memo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Bus as BusIcon, Users } from 'lucide-react';
import type { BookingEvent } from '@/features/booking/types';
import { LazyImage } from '@/components/common/LazyImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatBDT, formatDate } from '@/lib/format';
import { fadeInUp } from '@/lib/animations/variants';
import { cn } from '@/lib/utils';

export interface EventCardProps {
  event: BookingEvent;
  onSelect: (event: BookingEvent) => void;
}

const STATUS_LABEL: Record<
  BookingEvent['status'],
  { label: string; variant: 'success' | 'warning' | 'destructive' | 'muted' }
> = {
  open: { label: 'Open', variant: 'success' },
  'filling-fast': { label: 'Filling Fast', variant: 'warning' },
  'sold-out': { label: 'Sold Out', variant: 'destructive' },
  closed: { label: 'Closed', variant: 'muted' },
};

/** Step 1's selectable event card — every field the brief lists (destination, date, duration, bus type, seats, price, status). */
const EventCard = memo(function EventCard({ event, onSelect }: EventCardProps) {
  const status = STATUS_LABEL[event.status];
  const isDisabled = event.status === 'sold-out' || event.status === 'closed';

  return (
    <motion.article
      variants={fadeInUp}
      className={cn(
        'border-border bg-card flex flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow',
        !isDisabled && 'hover:shadow-lg',
      )}
    >
      <div className="relative">
        <LazyImage
          src={event.coverImage}
          alt={event.destination}
          aspectClassName="aspect-[16/10]"
          className={cn(isDisabled && 'grayscale')}
        />
        <Badge variant={status.variant} className="absolute top-3 left-3 shadow-sm">
          {status.label}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-foreground text-lg leading-tight font-semibold">
          {event.tourName}
        </h3>

        <dl className="text-muted-foreground grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Departure</dt>
            <dd>{formatDate(event.departureDate)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Duration</dt>
            <dd>
              {event.durationDays}D/{event.durationNights}N
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <BusIcon className="size-3.5 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Bus</dt>
            <dd>{event.destination}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Available seats</dt>
            <dd>{event.availableSeats} seats left</dd>
          </div>
        </dl>

        <div className="border-border mt-auto flex items-center justify-between gap-3 border-t pt-3">
          <div>
            <p className="text-muted-foreground text-xs">Starting from</p>
            <p className="font-display text-primary text-lg font-semibold">
              {formatBDT(event.startingPriceBDT)}
            </p>
          </div>
          <Button disabled={isDisabled} onClick={() => onSelect(event)}>
            {isDisabled ? status.label : 'Select'}
          </Button>
        </div>
      </div>
    </motion.article>
  );
});

export { EventCard };

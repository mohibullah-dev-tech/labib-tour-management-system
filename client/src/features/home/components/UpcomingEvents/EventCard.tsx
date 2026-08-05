import { memo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, Bus } from 'lucide-react';
import type { UpcomingEvent } from '@/features/home/data/events';
import { LazyImage } from '@/components/common/LazyImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fadeInUp } from '@/lib/animations/variants';
import { cn } from '@/lib/utils';

export interface EventCardProps {
  event: UpcomingEvent;
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const EventCard = memo(function EventCard({ event }: EventCardProps) {
  const seatsLeftRatio = event.availableSeats / event.totalSeats;
  const isFillingFast = seatsLeftRatio > 0 && seatsLeftRatio <= 0.3;
  const isSoldOut = event.availableSeats === 0;

  return (
    <motion.article
      variants={fadeInUp}
      className="border-border bg-card grid grid-cols-1 overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-lg sm:grid-cols-[220px_1fr]"
    >
      <LazyImage
        src={event.image}
        alt={event.title}
        aspectClassName="aspect-[4/3] sm:aspect-auto sm:h-full"
      />

      <div className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-display text-foreground text-lg leading-tight font-semibold">
            {event.title}
          </h3>
          {isSoldOut ? (
            <Badge variant="destructive">Sold Out</Badge>
          ) : isFillingFast ? (
            <Badge variant="warning">Filling Fast</Badge>
          ) : (
            <Badge variant="success">Seats Open</Badge>
          )}
        </div>

        <dl className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="text-primary size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Date</dt>
            <dd>{dateFormatter.format(new Date(event.date))}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="text-primary size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Duration</dt>
            <dd>
              {event.durationDays} {event.durationDays === 1 ? 'Day' : 'Days'}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="text-primary size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Available seats</dt>
            <dd>{event.availableSeats} seats left</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Bus className="text-primary size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Bus type</dt>
            <dd>{event.busType}</dd>
          </div>
        </dl>

        <div className="border-border mt-auto flex items-center justify-between border-t pt-3">
          <div>
            <p className="text-muted-foreground text-xs">Per seat</p>
            <p className="font-display text-primary text-lg font-semibold">
              ৳{event.priceBDT.toLocaleString('en-BD')}
            </p>
          </div>
          <Button disabled={isSoldOut} className={cn(isSoldOut && 'cursor-not-allowed')}>
            {isSoldOut ? 'Sold Out' : 'Reserve Seat'}
          </Button>
        </div>
      </div>
    </motion.article>
  );
});

export { EventCard };

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Calendar, Users, Clock, Bus, MapPin, Layers } from 'lucide-react';
import type { UpcomingEvent } from '@/features/home/data/events';
import { LazyImage } from '@/components/common/LazyImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fadeInUp } from '@/lib/animations/variants';

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
  const detailsUrl = event.slug ? `/tours/${event.slug}` : '/tours';
  const bookingUrl = `/booking?eventId=${encodeURIComponent(event.id)}`;

  return (
    <motion.article
      variants={fadeInUp}
      className="border-border bg-card grid grid-cols-1 overflow-hidden rounded-xl border shadow-xs transition-all hover:shadow-lg sm:grid-cols-[240px_1fr]"
    >
      <div className="relative">
        <LazyImage
          src={event.image}
          alt={event.title}
          aspectClassName="aspect-[16/10] sm:aspect-auto sm:h-full"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge
            variant="secondary"
            className="bg-background/90 gap-1 text-xs font-semibold shadow-xs backdrop-blur-xs"
          >
            <MapPin className="text-primary size-3" />
            {event.destination}
          </Badge>
          {event.isDemo && (
            <Badge
              variant="outline"
              className="bg-background/80 font-mono text-[10px] tracking-wider uppercase"
            >
              Preview
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3.5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-display text-foreground hover:text-primary text-lg leading-snug font-semibold transition-colors">
            <Link to={detailsUrl}>{event.title}</Link>
          </h3>
          {isSoldOut ? (
            <Badge variant="destructive">Sold Out</Badge>
          ) : isFillingFast ? (
            <Badge variant="warning">Filling Fast</Badge>
          ) : (
            <Badge variant="success">Seats Open</Badge>
          )}
        </div>

        <dl className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="text-primary size-3.5 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Date</dt>
            <dd className="text-foreground font-medium">
              {dateFormatter.format(new Date(event.date))}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="text-primary size-3.5 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Duration</dt>
            <dd>
              {event.durationDays} {event.durationDays === 1 ? 'Day' : 'Days'}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="text-primary size-3.5 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Available seats</dt>
            <dd className={isFillingFast ? 'font-semibold text-amber-600' : ''}>
              {event.availableSeats} of {event.totalSeats} seats left
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Bus className="text-primary size-3.5 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Bus type</dt>
            <dd className="truncate">{event.busType}</dd>
          </div>
        </dl>

        {event.packages && event.packages.length > 0 && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Layers className="text-primary size-3.5 shrink-0" />
            <span className="text-[11px] font-medium">Tiers:</span>
            <div className="flex flex-wrap gap-1">
              {event.packages.map((pkg) => (
                <span
                  key={pkg}
                  className="bg-muted text-foreground rounded px-2 py-0.5 text-[10px] font-medium"
                >
                  {pkg}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="border-border mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <div>
            <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
              Starts From
            </p>
            <p className="font-display text-primary text-lg font-bold">
              ৳{event.priceBDT.toLocaleString('en-BD')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={detailsUrl}>View Details</Link>
            </Button>
            <Button size="sm" disabled={isSoldOut} asChild={!isSoldOut}>
              {isSoldOut ? <span>Sold Out</span> : <Link to={bookingUrl}>Book Now</Link>}
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
});

export { EventCard };

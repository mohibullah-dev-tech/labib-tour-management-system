import { memo } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Clock, Users, CalendarDays } from 'lucide-react';
import type { Tour } from '@/features/tours/types';
import { CategoryBadge } from '@/features/tours/components/CategoryBadge';
import { LazyImage } from '@/components/common/LazyImage';
import { Rating } from '@/components/common/Rating';
import { Button } from '@/components/ui/button';
import { formatBDT, formatDate } from '@/lib/format';
import { fadeInUp } from '@/lib/animations/variants';
import { cn } from '@/lib/utils';

export interface TourCardProps {
  tour: Tour;
}

/**
 * The primary listing card — richer than the Home page's DestinationCard
 * (adds category, next departure, seats, review count, and a dual
 * Book Now / View Details CTA pair) because this is a shopping surface,
 * not a teaser. Hover feedback stays plain CSS; only the scroll-reveal
 * uses Framer Motion, consistent with every other card in the app.
 */
const TourCard = memo(function TourCard({ tour }: TourCardProps) {
  const seatsLeftRatio = tour.availableSeats / tour.totalSeats;
  const isFillingFast = seatsLeftRatio > 0 && seatsLeftRatio <= 0.3;

  return (
    <motion.article
      variants={fadeInUp}
      className="group border-border bg-card flex flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative">
        <Link to={`/tours/${tour.slug}`} aria-label={`View details for ${tour.name}`}>
          <LazyImage
            src={tour.coverImage}
            alt={tour.name}
            aspectClassName="aspect-[4/3]"
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <CategoryBadge category={tour.category} className="absolute top-3 left-3 shadow-sm" />
        {isFillingFast && (
          <span className="bg-danger-600 absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-medium text-white shadow-sm">
            Filling Fast
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-foreground line-clamp-2 text-lg leading-tight font-semibold">
            <Link to={`/tours/${tour.slug}`} className="hover:text-primary">
              {tour.name}
            </Link>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Rating value={tour.rating} showValue />
          <span className="text-muted-foreground text-xs">({tour.reviewCount} reviews)</span>
        </div>

        <p className="text-muted-foreground line-clamp-2 flex-1 text-sm leading-relaxed">
          {tour.shortDescription}
        </p>

        <dl className="text-muted-foreground grid grid-cols-3 gap-2 text-xs">
          <div className="flex min-w-0 items-center gap-1">
            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Duration</dt>
            <dd className="truncate">
              {tour.durationDays}D{tour.durationNights > 0 ? `/${tour.durationNights}N` : ''}
            </dd>
          </div>
          <div className="flex min-w-0 items-center gap-1">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Next departure</dt>
            <dd className="truncate">{formatDate(tour.nextDepartureDate)}</dd>
          </div>
          <div className="flex min-w-0 items-center gap-1">
            <Users className="size-3.5 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Available seats</dt>
            <dd className={cn('truncate', isFillingFast && 'text-danger-600 font-medium')}>
              {tour.availableSeats} left
            </dd>
          </div>
        </dl>

        <div className="border-border mt-1 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <div>
            <p className="text-muted-foreground text-xs">Starting from</p>
            <p className="font-display text-primary text-lg font-semibold">
              {formatBDT(tour.startingPriceBDT)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/tours/${tour.slug}`}>Details</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to={`/booking?tourId=${tour.id}`}>Book Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
});

export { TourCard };

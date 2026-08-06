import { Clock, MapPin } from 'lucide-react';
import type { Tour } from '@/features/tours/types';
import { CategoryBadge } from '@/features/tours/components/CategoryBadge';
import { Rating } from '@/components/common/Rating';
import { Container } from '@/components/common/Container';

export interface TourHeroBannerProps {
  tour: Tour;
}

/**
 * Shorter, non-full-viewport banner (unlike the Home page's Hero) — this
 * page has a lot of content below, so the banner establishes context
 * (image, title, category, rating) without consuming the whole first
 * viewport the way a marketing hero does.
 */
function TourHeroBanner({ tour }: TourHeroBannerProps) {
  return (
    <div className="relative h-[45vh] min-h-80 w-full overflow-hidden">
      <img
        src={tour.coverImage}
        alt={tour.name}
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/30 to-transparent" />

      <Container className="relative z-10 flex h-full flex-col justify-end gap-3 pb-8">
        <CategoryBadge category={tour.category} className="w-fit" />
        <h1 className="font-display laptop:text-4xl max-w-2xl text-3xl leading-tight font-semibold text-white">
          {tour.name}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-white/85">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" aria-hidden="true" />
            {tour.destination}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden="true" />
            {tour.durationDays}D{tour.durationNights > 0 ? `/${tour.durationNights}N` : ''}
          </span>
          <Rating value={tour.rating} />
          <span>
            {tour.rating.toFixed(1)} ({tour.reviewCount} reviews)
          </span>
        </div>
      </Container>
    </div>
  );
}

export { TourHeroBanner };

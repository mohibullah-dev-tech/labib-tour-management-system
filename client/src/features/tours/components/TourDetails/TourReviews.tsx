import { Quote } from 'lucide-react';
import type { TourReview } from '@/features/tours/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Rating } from '@/components/common/Rating';
import { formatDate } from '@/lib/format';

export interface TourReviewsProps {
  reviews?: TourReview[];
}

function TourReviews({ reviews }: TourReviewsProps) {
  if (!reviews?.length) return null;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {reviews.map((review) => {
        const initials = review.name
          .split(' ')
          .map((p) => p[0])
          .slice(0, 2)
          .join('');
        return (
          <figure
            key={review.id}
            className="border-border bg-card flex flex-col gap-3 rounded-lg border p-5"
          >
            <Quote className="text-primary-300 size-5" aria-hidden="true" />
            <blockquote className="text-foreground flex-1 text-sm leading-relaxed">
              {review.comment}
            </blockquote>
            <Rating value={review.rating} showValue />
            <figcaption className="border-border flex items-center gap-3 border-t pt-3">
              <Avatar className="size-9">
                <AvatarImage src={`https://picsum.photos/seed/${review.avatarSeed}/80/80`} alt="" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-foreground text-sm font-medium">{review.name}</p>
                <p className="text-muted-foreground text-xs">
                  Traveled {formatDate(review.travelDate)}
                </p>
              </div>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

export { TourReviews };

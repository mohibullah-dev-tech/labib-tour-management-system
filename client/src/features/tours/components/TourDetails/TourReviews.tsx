import { Link } from 'react-router';
import { Quote, MessageSquarePlus, CheckCircle2 } from 'lucide-react';
import type { TourReview } from '@/features/tours/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Rating } from '@/components/common/Rating';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';

export interface TourReviewsProps {
  reviews?: TourReview[];
}

function TourReviews({ reviews }: TourReviewsProps) {
  return (
    <div className="space-y-6">
      {/* Rate Tour Prompt for Authenticated Guests */}
      <div className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 sm:p-5">
        <div>
          <p className="text-foreground text-sm font-semibold">
            Traveled with Labib Tour recently?
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Every review is written by travelers who completed their booking with us.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
          <Link to="/dashboard?tab=reviews">
            <MessageSquarePlus className="size-3.5" />
            <span>Write Guest Review</span>
          </Link>
        </Button>
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {reviews.map((review) => {
            const initials = review.name
              ? review.name
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')
              : 'TR';

            return (
              <figure
                key={review.id}
                className="border-border bg-card flex flex-col justify-between rounded-xl border p-5 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Quote className="text-primary/40 size-5" aria-hidden="true" />
                    <Badge
                      variant="outline"
                      className="gap-1 border-emerald-500/30 text-[10px] text-emerald-600 dark:text-emerald-400"
                    >
                      <CheckCircle2 className="size-3" />
                      Verified
                    </Badge>
                  </div>
                  <blockquote className="text-foreground text-sm leading-relaxed">
                    &ldquo;{review.comment}&rdquo;
                  </blockquote>
                </div>

                <div className="border-border mt-4 border-t pt-3">
                  <div className="mb-2">
                    <Rating value={review.rating} showValue />
                  </div>
                  <figcaption className="flex items-center gap-3">
                    <Avatar className="size-9 border">
                      <AvatarImage
                        src={`https://picsum.photos/seed/${review.avatarSeed}/80/80`}
                        alt=""
                      />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-foreground text-sm font-medium">{review.name}</p>
                      <p className="text-muted-foreground text-xs">
                        Traveled {formatDate(review.travelDate)}
                      </p>
                    </div>
                  </figcaption>
                </div>
              </figure>
            );
          })}
        </div>
      ) : (
        <div className="border-border bg-card text-muted-foreground rounded-xl border p-8 text-center">
          <p className="text-sm font-medium">No reviews published for this tour yet.</p>
          <p className="mt-1 text-xs">
            Completed travelers can post their verified review from their Guest Dashboard.
          </p>
        </div>
      )}
    </div>
  );
}

export { TourReviews };

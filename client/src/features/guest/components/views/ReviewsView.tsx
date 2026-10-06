import { Star, MessageSquarePlus, CheckCircle2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { GuestBooking, GuestReview } from '@/features/guest/types';

interface ReviewsViewProps {
  bookings: GuestBooking[];
  reviews: GuestReview[];
  onOpenReviewForm: (booking: GuestBooking) => void;
}

export function ReviewsView({ bookings, reviews, onOpenReviewForm }: ReviewsViewProps) {
  const pendingReviewBookings = bookings.filter(
    (b) => b.bookingStatus === 'completed' && !b.hasReview,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Tours Awaiting Review Banner */}
      {pendingReviewBookings.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              <Star className="size-4 fill-amber-400" />
              <span>Pending Reviews</span>
            </div>
            <CardTitle className="text-lg">Share Your Feedback on Completed Tours</CardTitle>
            <CardDescription className="text-xs">
              You completed {pendingReviewBookings.length} tour(s) with us recently. Tell us how
              your experience was!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pendingReviewBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-card border-border flex items-center justify-between gap-3 rounded-xl border p-3 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={b.coverImage}
                      alt={b.destination}
                      className="size-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="text-foreground text-xs font-semibold sm:text-sm">
                        {b.destination}
                      </h4>
                      <p className="text-muted-foreground text-[11px]">
                        Traveled with Host {b.hostInfo.name}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="shrink-0 gap-1.5 text-xs"
                    onClick={() => onOpenReviewForm(b)}
                  >
                    <MessageSquarePlus className="size-3.5" />
                    <span>Rate Tour</span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Published / Submitted Reviews */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader>
          <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <MessageSquare className="size-4" />
            <span>My Feedback History</span>
          </div>
          <CardTitle className="text-xl">Your Published Reviews</CardTitle>
          <CardDescription className="text-xs">
            Reviews you submitted for completed journeys.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {reviews.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              <Star className="text-muted-foreground/30 mx-auto mb-2 size-8" />
              <p className="text-sm font-medium">No reviews published yet</p>
              <p className="text-muted-foreground/70 mx-auto mt-0.5 max-w-sm text-xs">
                Complete a tour with us and your ratings and reviews will appear here.
              </p>
            </div>
          ) : (
            reviews.map((rev) => {
              const formattedDate = new Date(rev.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={rev.id}
                  className="border-border bg-muted/20 flex flex-col gap-3 rounded-xl border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-foreground text-sm font-semibold">{rev.destination}</h4>
                      <p className="text-muted-foreground text-[11px]">{rev.tourDate}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`size-3.5 ${
                              star <= rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>

                      <span className="text-foreground text-[11px] font-semibold">
                        {rev.rating}.0
                      </span>

                      <Badge
                        variant="outline"
                        className="ml-1 gap-1 border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600"
                      >
                        <CheckCircle2 className="size-3" />
                        <span>Verified Guest</span>
                      </Badge>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {/* Photos attached to review */}
                  {rev.photos && rev.photos.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {rev.photos.map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          alt="Review attachment"
                          className="border-border size-14 rounded-lg border object-cover"
                        />
                      ))}
                    </div>
                  )}

                  <div className="text-muted-foreground border-border/60 border-t pt-1 text-[10px]">
                    Reviewed on {formattedDate}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

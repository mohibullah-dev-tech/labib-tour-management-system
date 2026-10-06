import { Calendar, MapPin, Star, MessageSquarePlus, Eye, Compass, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { GuestBooking } from '@/features/guest/types';

interface PastToursViewProps {
  bookings: GuestBooking[];
  onViewDetails: (booking: GuestBooking) => void;
  onWriteReview: (booking: GuestBooking) => void;
}

export function PastToursView({ bookings, onViewDetails, onWriteReview }: PastToursViewProps) {
  const completedTours = bookings.filter((b) => b.bookingStatus === 'completed');

  if (completedTours.length === 0) {
    return (
      <Card className="border-border bg-card border-dashed p-12 text-center">
        <Compass className="text-muted-foreground/30 mx-auto mb-3 size-12" />
        <h3 className="font-display text-lg font-bold">No Completed Tours Yet</h3>
        <p className="text-muted-foreground mx-auto mt-1 mb-5 max-w-md text-xs">
          Once you complete a tour with Labib Tour &amp; Travel Group, your trip memories and
          reviews will be archived here.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {completedTours.map((tour) => {
          const formattedDate = new Date(tour.departureDate).toLocaleDateString('en-GB', {
            month: 'short',
            year: 'numeric',
          });

          return (
            <Card
              key={tour.id}
              className="border-border bg-card flex flex-col justify-between overflow-hidden shadow-xs transition-all hover:shadow-md"
            >
              <div>
                {/* Tour Card Image & Header */}
                <div className="bg-muted relative h-44 w-full overflow-hidden">
                  <img
                    src={tour.coverImage}
                    alt={tour.destination}
                    className="size-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  <div className="absolute top-3 left-3">
                    <Badge className="border-blue-500/30 bg-blue-500/20 text-blue-300 backdrop-blur-xs">
                      ✓ Completed Tour
                    </Badge>
                  </div>

                  <div className="absolute top-3 right-3">
                    {tour.hasReview ? (
                      <Badge className="gap-1 border-emerald-500/30 bg-emerald-500/20 text-emerald-300 backdrop-blur-xs">
                        <CheckCircle className="size-3" />
                        <span>Reviewed ({tour.userRating || 5}★)</span>
                      </Badge>
                    ) : (
                      <Badge className="animate-pulse gap-1 border-amber-500/30 bg-amber-500/20 text-amber-300 backdrop-blur-xs">
                        <Star className="size-3 fill-amber-300" />
                        <span>Review Pending</span>
                      </Badge>
                    )}
                  </div>

                  <div className="absolute right-3 bottom-3 left-3 text-white">
                    <span className="block font-mono text-[10px] text-white/70 uppercase">
                      Ref: {tour.id}
                    </span>
                    <h3 className="font-display text-lg leading-tight font-bold tracking-tight text-white">
                      {tour.destination}
                    </h3>
                  </div>
                </div>

                {/* Details Body */}
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="text-primary size-3.5 shrink-0" />
                      <span>Traveled in {formattedDate}</span>
                    </div>

                    <div className="text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="text-primary size-3.5 shrink-0" />
                      <span className="capitalize">{tour.packageName}</span>
                    </div>
                  </div>

                  {/* Rating & Review Status Summary */}
                  <div className="bg-muted/40 border-border flex items-center justify-between rounded-xl border p-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px] font-medium">
                        Rating &amp; Experience
                      </span>
                      <div className="mt-0.5 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`size-3.5 ${
                              tour.hasReview && star <= (tour.userRating || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-muted-foreground block text-right text-[11px] font-medium">
                        Lead Host
                      </span>
                      <span className="text-foreground block text-right text-xs font-semibold">
                        {tour.hostInfo.name}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Action Buttons */}
              <div className="border-border mt-2 flex items-center gap-2 border-t p-4 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => onViewDetails(tour)}
                >
                  <Eye className="size-3.5" />
                  <span>View Details</span>
                </Button>

                {!tour.hasReview ? (
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground flex-1 gap-1.5 text-xs"
                    onClick={() => onWriteReview(tour)}
                  >
                    <MessageSquarePlus className="size-3.5" />
                    <span>Write Review</span>
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" className="flex-1 gap-1.5 text-xs" disabled>
                    <CheckCircle className="size-3.5 text-emerald-500" />
                    <span>Reviewed</span>
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

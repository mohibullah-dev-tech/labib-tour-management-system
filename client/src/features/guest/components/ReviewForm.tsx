import { useState } from 'react';
import { Star, ImagePlus, X, MessageSquare, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { GuestBooking } from '@/features/guest/types';

interface ReviewFormProps {
  booking: GuestBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    bookingId: string;
    destination: string;
    tourDate: string;
    rating: number;
    comment: string;
    photos?: string[];
  }) => Promise<void>;
}

const RATING_LABELS = [
  'Select Rating',
  '1 Star - Poor Experience',
  '2 Stars - Fair',
  '3 Stars - Good & Satisfactory',
  '4 Stars - Great Experience',
  '5 Stars - Exceptional & Highly Recommended!',
];

export function ReviewForm({ booking, open, onOpenChange, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!booking) return null;

  // Enforce rule: Only allow review UI for completed tours!
  if (booking.bookingStatus !== 'completed') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-6 text-center">
          <DialogTitle>Review Not Eligible</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2 text-sm">
            You can only write a review once this tour has been completed.
          </DialogDescription>
          <Button onClick={() => onOpenChange(false)} className="mt-4">
            Understood
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const handlePhotoUploadPlaceholder = () => {
    // Add realistic dummy photo placeholder
    const samplePhotos = [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80',
    ];
    if (photos.length < 3) {
      setPhotos([...photos, samplePhotos[photos.length % samplePhotos.length]]);
      toast.info('Photo uploaded (preview placeholder)');
    } else {
      toast.warning('Maximum 3 tour photos allowed per review.');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a star rating from 1 to 5.');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Please provide at least 10 characters describing your experience.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        bookingId: booking.id,
        destination: booking.destination,
        tourDate: new Date(booking.departureDate).toLocaleDateString('en-GB', {
          month: 'long',
          year: 'numeric',
        }),
        rating,
        comment: comment.trim(),
        photos: photos.length > 0 ? photos : undefined,
      });

      toast.success('Thank you for your review!', {
        description: 'Your feedback helps other travelers explore with confidence.',
      });
      onOpenChange(false);
      setComment('');
      setPhotos([]);
    } catch {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader>
          <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <MessageSquare className="size-4" />
            <span>Tour Review</span>
          </div>
          <DialogTitle className="font-display mt-1 text-xl sm:text-2xl">
            Review Your Tour to {booking.destination}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
            Share your experience with the transport, eco-resort, tour itinerary, and lead host{' '}
            <strong className="text-foreground">{booking.hostInfo.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-5">
          {/* Star Rating Section */}
          <div className="bg-muted/40 border-border flex flex-col items-center justify-center gap-2 rounded-xl border p-4">
            <span className="text-muted-foreground text-xs font-medium">Overall Rating</span>
            <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  className="focus-visible:ring-primary rounded-md p-1 transition-transform hover:scale-115 focus-visible:ring-2 focus-visible:outline-none"
                >
                  <Star
                    className={`size-7 transition-colors ${
                      star <= activeRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-foreground text-xs font-semibold">
              {RATING_LABELS[activeRating] || ''}
            </span>
          </div>

          {/* Comment Section */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="review-comment" className="text-foreground text-xs font-semibold">
              Your Experience &amp; Highlights
            </Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the bus journey, hotel stay, tour guide guidance, and food? What advice would you give future travelers?"
              rows={4}
              className="resize-none text-sm"
              maxLength={500}
            />
            <div className="text-muted-foreground flex items-center justify-between text-[11px]">
              <span>Minimum 10 characters</span>
              <span>{comment.length} / 500</span>
            </div>
          </div>

          {/* Upload Photos Section */}
          <div className="flex flex-col gap-2">
            <Label className="text-foreground text-xs font-semibold">Tour Photos (Optional)</Label>
            <div className="flex flex-wrap items-center gap-3">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="group border-border relative size-18 overflow-hidden rounded-lg border shadow-xs"
                >
                  <img src={photo} alt="Tour thumbnail" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    aria-label="Remove photo"
                    className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}

              {photos.length < 3 && (
                <button
                  type="button"
                  onClick={handlePhotoUploadPlaceholder}
                  className="border-border hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary flex size-18 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors"
                >
                  <ImagePlus className="size-5" />
                  <span className="mt-0.5 text-[10px] font-medium">Add Photo</span>
                </button>
              )}
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting} className="gap-1.5">
              <CheckCircle2 className="size-4" />
              <span>Submit Review</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

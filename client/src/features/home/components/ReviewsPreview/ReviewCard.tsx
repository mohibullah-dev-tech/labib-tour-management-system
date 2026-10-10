import { memo } from 'react';
import { motion } from 'framer-motion';
import { Quote, CheckCircle2, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Rating } from '@/components/common/Rating';
import { Badge } from '@/components/ui/badge';
import { fadeInUp } from '@/lib/animations/variants';

export interface DisplayReview {
  id: string;
  name: string;
  location?: string;
  tourTitle?: string;
  avatar?: string;
  rating: number;
  comment: string;
  date?: string;
}

export interface ReviewCardProps {
  review: DisplayReview;
}

const ReviewCard = memo(function ReviewCard({ review }: ReviewCardProps) {
  const initials = review.name
    ? review.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'GT';

  const formattedDate = review.date
    ? new Date(review.date).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <motion.figure
      variants={fadeInUp}
      className="border-border bg-card hover:border-primary/40 flex h-full flex-col justify-between rounded-xl border p-6 shadow-xs transition-colors duration-200"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Quote className="text-primary/40 size-6" aria-hidden="true" />
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/30 text-[11px] text-emerald-600 dark:text-emerald-400"
          >
            <CheckCircle2 className="size-3" />
            যাচাইকৃত ভ্রমণকারী
          </Badge>
        </div>

        <blockquote className="text-foreground text-sm leading-relaxed">
          &ldquo;{review.comment}&rdquo;
        </blockquote>
      </div>

      <div className="border-border mt-5 border-t pt-4">
        <div className="mb-3 flex items-center justify-between">
          <Rating value={review.rating} showValue />
          {formattedDate && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Calendar className="size-3" />
              {formattedDate}
            </span>
          )}
        </div>

        <figcaption className="flex items-center gap-3">
          <Avatar className="size-9 border">
            {review.avatar && <AvatarImage src={review.avatar} alt={review.name} />}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-medium">{review.name}</p>
            <p className="text-muted-foreground truncate text-xs">
              {review.tourTitle || review.location || 'ট্যুর সদস্য'}
            </p>
          </div>
        </figcaption>
      </div>
    </motion.figure>
  );
});

export { ReviewCard };

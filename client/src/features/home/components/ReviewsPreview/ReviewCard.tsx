import { memo } from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import type { GuestReview } from '@/features/home/data/reviews';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Rating } from '@/components/common/Rating';
import { fadeInUp } from '@/lib/animations/variants';

export interface ReviewCardProps {
  review: GuestReview;
}

const ReviewCard = memo(function ReviewCard({ review }: ReviewCardProps) {
  const initials = review.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

  return (
    <motion.figure
      variants={fadeInUp}
      className="border-border bg-card flex h-full flex-col gap-4 rounded-lg border p-6 shadow-sm"
    >
      <Quote className="text-primary-300 size-6" aria-hidden="true" />
      <blockquote className="text-foreground flex-1 text-sm leading-relaxed">
        {review.comment}
      </blockquote>
      <Rating value={review.rating} showValue />
      <figcaption className="border-border flex items-center gap-3 border-t pt-4">
        <Avatar>
          <AvatarImage src={`https://picsum.photos/seed/${review.avatarSeed}/80/80`} alt="" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-foreground text-sm font-medium">{review.name}</p>
          <p className="text-muted-foreground text-xs">
            {review.location} · {review.tour}
          </p>
        </div>
      </figcaption>
    </motion.figure>
  );
});

export { ReviewCard };

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RatingProps {
  value: number;
  /** Max stars, defaults to 5. */
  max?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
  className?: string;
}

/**
 * Reusable star rating display (read-only) — used on Review cards today,
 * and later on Tour cards / detail pages once bookings + reviews exist.
 * Rendered as a single accessible label (`aria-label="4.5 out of 5"`)
 * rather than 5 individually-announced star icons, which would be noisy
 * for screen reader users.
 */
function Rating({ value, max = 5, size = 'sm', showValue = false, className }: RatingProps) {
  const starSize = size === 'sm' ? 'size-4' : 'size-5';

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role="img"
      aria-label={`${value} out of ${max} stars`}
    >
      <div className="flex" aria-hidden="true">
        {Array.from({ length: max }, (_, i) => {
          const filled = i < Math.round(value);
          return (
            <Star
              key={i}
              className={cn(
                starSize,
                filled ? 'fill-accent-500 text-accent-500' : 'fill-muted text-muted',
              )}
            />
          );
        })}
      </div>
      {showValue && <span className="text-foreground text-sm font-medium">{value.toFixed(1)}</span>}
    </div>
  );
}

export { Rating };

import { Badge } from '@/components/ui/badge';
import { TOUR_CATEGORY_LABELS, type TourCategory } from '@/features/tours/types';

const CATEGORY_VARIANT: Record<TourCategory, 'secondary' | 'warning' | 'success' | 'default'> = {
  relax: 'secondary',
  premium: 'warning',
  day: 'success',
  seasonal: 'default',
};

export interface CategoryBadgeProps {
  category: TourCategory;
  className?: string;
}

/** One mapping of category -> color, reused everywhere a category shows (card, filters, details page). */
function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <Badge variant={CATEGORY_VARIANT[category]} className={className}>
      {TOUR_CATEGORY_LABELS[category]}
    </Badge>
  );
}

export { CategoryBadge };

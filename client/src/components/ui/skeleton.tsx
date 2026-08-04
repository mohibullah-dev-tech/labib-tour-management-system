import { cn } from '@/lib/utils';

/**
 * Skeleton — a placeholder shape shown while real content loads.
 * Deliberately just a styled <div>; feature code controls width/height
 * via className to match whatever it's standing in for (avatar circle,
 * text line, card block, etc.).
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('bg-muted animate-pulse rounded-sm', className)} {...props} />;
}

export { Skeleton };

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Container — the single horizontal-padding + max-width wrapper every
 * page/section should use, so page edges line up consistently across
 * the whole app instead of each page picking its own max-w-*.
 */
const Container = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)}
      {...props}
    />
  ),
);
Container.displayName = 'Container';

export { Container };

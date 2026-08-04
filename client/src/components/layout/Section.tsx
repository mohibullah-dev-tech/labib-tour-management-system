import * as React from 'react';
import { Container } from '@/components/common/Container';
import { cn } from '@/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Set false to render full-bleed content (e.g. an edge-to-edge image row) without the Container's max-width/padding. */
  contained?: boolean;
  as?: 'section' | 'div';
}

/**
 * Section — the consistent vertical-rhythm wrapper every page section
 * should use (hero, feature grid, testimonials, CTA band, ...). Wraps
 * Container internally by default so features never have to remember to
 * add both. Spacing scale intentionally uses Tailwind's existing scale
 * (py-16/py-24), not new custom tokens — consistency comes from reuse.
 */
const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, contained = true, as = 'section', children, ...props }, ref) => {
    const Comp = as as 'section';
    return (
      <Comp ref={ref as never} className={cn('laptop:py-24 py-16', className)} {...props}>
        {contained ? <Container>{children}</Container> : children}
      </Comp>
    );
  },
);
Section.displayName = 'Section';

export { Section };

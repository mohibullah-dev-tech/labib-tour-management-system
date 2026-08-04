/* eslint-disable jsx-a11y/heading-has-content -- headings here always receive content via the `children` prop at usage sites; ESLint cannot see through the generic forwardRef wrapper. */
import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Typography primitives implement the LTMS type scale as components
 * (not just utility classes) so heading/body styles stay consistent
 * without every feature re-deciding font-size + weight + tracking by hand.
 * Headings use the display serif (Fraunces); everything else uses the
 * UI sans (Plus Jakarta Sans) — see styles/tokens.css.
 */

const H1 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn(
        'font-display text-foreground text-4xl leading-tight font-semibold tracking-tight sm:text-5xl',
        className,
      )}
      {...props}
    />
  ),
);
H1.displayName = 'H1';

const H2 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        'font-display text-foreground text-3xl leading-tight font-semibold tracking-tight',
        className,
      )}
      {...props}
    />
  ),
);
H2.displayName = 'H2';

const H3 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'font-display text-foreground text-2xl leading-snug font-semibold tracking-tight',
        className,
      )}
      {...props}
    />
  ),
);
H3.displayName = 'H3';

const H4 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn(
        'font-display text-foreground text-xl leading-snug font-semibold tracking-tight',
        className,
      )}
      {...props}
    />
  ),
);
H4.displayName = 'H4';

const Lead = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-muted-foreground text-lg leading-relaxed', className)}
      {...props}
    />
  ),
);
Lead.displayName = 'Lead';

const Body = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-foreground text-base leading-relaxed', className)}
      {...props}
    />
  ),
);
Body.displayName = 'Body';

const Small = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-foreground text-sm leading-normal', className)} {...props} />
  ),
);
Small.displayName = 'Small';

/** Caption — the smallest text tier: timestamps, helper text, metadata. */
const Caption = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('text-muted-foreground text-xs font-medium tracking-wide uppercase', className)}
      {...props}
    />
  ),
);
Caption.displayName = 'Caption';

export { H1, H2, H3, H4, Lead, Body, Small, Caption };

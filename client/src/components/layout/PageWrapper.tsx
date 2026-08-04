import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageWrapper marks the main content landmark of every page (id used by
 * SkipToContent) and guarantees a sane minimum height so a short page's
 * Footer never rides up against the Navbar with no content between them.
 */
function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <main id="main-content" tabIndex={-1} className={cn('min-h-[60vh]', className)}>
      {children}
    </main>
  );
}

export { PageWrapper };

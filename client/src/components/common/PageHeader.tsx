import type { ReactNode } from 'react';
import { H1, Lead } from '@/components/ui/typography';
import { Container } from '@/components/common/Container';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Right-aligned slot for page-level actions (buttons, filters). */
  actions?: ReactNode;
  className?: string;
}

/**
 * PageHeader — the banner every internal/dashboard page starts with:
 * title + optional description on the left, actions on the right.
 * A reusable shell, not a page itself — feature pages compose it.
 */
function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('border-border bg-background border-b py-8', className)}>
      <Container className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <H1 className="text-3xl sm:text-4xl">{title}</H1>
          {description && <Lead className="text-base">{description}</Lead>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </Container>
    </div>
  );
}

export { PageHeader };

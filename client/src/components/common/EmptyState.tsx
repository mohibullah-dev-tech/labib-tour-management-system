import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { H3, Body } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Typically a <Button>, e.g. "Create your first tour". */
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyState — the "nothing here yet" pattern for empty lists/tables
 * (no bookings yet, no search results, no tours). Consistent so the
 * whole app feels designed even in its empty/zero states, not just
 * when data exists.
 */
function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-border flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="bg-muted text-muted-foreground mb-1 flex size-12 items-center justify-center rounded-full">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      )}
      <H3 className="text-lg">{title}</H3>
      {description && <Body className="text-muted-foreground max-w-sm">{description}</Body>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export { EmptyState };

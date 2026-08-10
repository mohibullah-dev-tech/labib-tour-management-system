import type { ReactNode } from 'react';
import { AdminBreadcrumb } from '@/features/admin/components/layout/AdminBreadcrumb';
import { H1 } from '@/components/ui/typography';

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * Denser than the public site's PageHeader (no border-b py-8 banner) —
 * admin screens prioritize information density over marketing-style
 * whitespace. Always paired with AdminBreadcrumb above the title.
 */
function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="border-border flex flex-col gap-3 border-b pb-6">
      <AdminBreadcrumb />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <H1 className="text-2xl sm:text-2xl">{title}</H1>
          {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export { AdminPageHeader };

import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  /** Hide on narrow screens — every table keeps at least name/status/actions visible on mobile. */
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

/**
 * One generic table implementation shared by every admin list page
 * (Templates, Events, Buses, Hosts, Bookings, Guests, Reviews). Each
 * page only supplies its own column definitions — this component never
 * knows what a "Bus" or a "Booking" is, keeping it truly reusable rather
 * than copy-pasted per section.
 */
function DataTable<T>({
  columns,
  rows,
  getRowId,
  isLoading,
  emptyTitle = 'No records found',
  emptyDescription,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="border-border overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="border-border bg-muted/40 border-b">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'text-muted-foreground px-4 py-3 font-medium whitespace-nowrap',
                  col.hideOnMobile && 'hidden sm:table-cell',
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {rows.map((row) => (
            <tr key={getRowId(row)} className="hover:bg-muted/30 transition-colors">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 py-3 align-middle',
                    col.hideOnMobile && 'hidden sm:table-cell',
                    col.className,
                  )}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { DataTable };

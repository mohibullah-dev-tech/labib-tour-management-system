import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface AdminToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Filter <Select> controls, actions, etc. — rendered to the right of search. */
  children?: ReactNode;
}

/** The recurring "search + filters + primary action" row above every admin list. */
function AdminToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  children,
}: AdminToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {onSearchChange && (
        <div className="relative max-w-sm flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
            aria-label="Search"
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export { AdminToolbar };

import { Link, useLocation } from 'react-router';
import { ChevronRight, Home } from 'lucide-react';
import { ADMIN_NAV_ITEMS } from '@/features/admin/config/admin-navigation';

/**
 * Derives its trail entirely from the current URL + ADMIN_NAV_ITEMS —
 * no page manually declares its own breadcrumb, so it can never drift
 * out of sync with the sidebar's labels.
 */
function AdminBreadcrumb() {
  const { pathname } = useLocation();
  const current = ADMIN_NAV_ITEMS.find((item) => item.path === pathname);

  return (
    <nav
      aria-label="Breadcrumb"
      className="text-muted-foreground flex items-center gap-1.5 text-sm"
    >
      <Link to="/admin" className="hover:text-foreground flex items-center gap-1">
        <Home className="size-3.5" aria-hidden="true" />
        Admin
      </Link>
      {current && current.path !== '/admin' && (
        <>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <span aria-current="page" className="text-foreground font-medium">
            {current.label}
          </span>
        </>
      )}
    </nav>
  );
}

export { AdminBreadcrumb };

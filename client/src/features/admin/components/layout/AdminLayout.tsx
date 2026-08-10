import { Outlet } from 'react-router';
import { AdminSidebar } from '@/features/admin/components/layout/AdminSidebar';
import { AdminTopbar } from '@/features/admin/components/layout/AdminTopbar';
import { SkipToContent } from '@/components/layout/SkipToContent';

/**
 * Sibling to PublicLayout (see components/layout/PublicLayout.tsx's own
 * docstring, which named this exact split as the future plan) — no
 * Navbar/Footer/WhatsApp/ScrollToTop here, since none of those belong in
 * an authenticated admin context. Route protection (redirecting
 * unauthenticated visitors) is intentionally not implemented here — it
 * belongs to the future Authentication module, at which point this
 * layout gains an auth guard without changing its visual structure.
 */
function AdminLayout() {
  return (
    <div className="bg-muted/30 flex min-h-dvh">
      <SkipToContent />

      {/* Desktop sidebar — permanent, laptop+ only */}
      <aside className="border-border bg-background laptop:block hidden w-64 shrink-0 border-r">
        <div className="sticky top-0 h-dvh">
          <AdminSidebar />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main id="main-content" tabIndex={-1} className="laptop:p-8 flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export { AdminLayout };

import { Link, Outlet } from 'react-router';
import { Compass } from 'lucide-react';

/**
 * Sibling to PublicLayout and AdminLayout (same pattern established in
 * the Application Shell and Admin Dashboard phases) — no public
 * Navbar/Footer, no admin sidebar. Just a centered card on a quiet
 * background, which every auth page (/login, /register,
 * /forgot-password, /reset-password, /verify-email) renders inside via
 * <Outlet />.
 */
function AuthLayout() {
  return (
    <div className="bg-muted/30 flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12">
      <Link
        to="/"
        className="font-display text-foreground flex items-center gap-2 text-xl font-semibold"
      >
        <Compass className="text-primary size-7" aria-hidden="true" />
        LTMS
      </Link>
      <Outlet />
    </div>
  );
}

export { AuthLayout };

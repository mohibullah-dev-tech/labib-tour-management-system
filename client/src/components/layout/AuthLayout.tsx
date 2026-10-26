import { Suspense } from 'react';
import { Link, Outlet } from 'react-router';
import { AuthSkeleton } from '@/features/auth/components/AuthSkeleton';
import labibLogo from '@/assets/labib_logo.jpg';

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
        className="font-display text-foreground flex items-center gap-2.5 text-xl font-bold"
      >
        <img
          src={labibLogo}
          alt="Labib Tours Logo"
          className="ring-border size-10 rounded-full object-cover shadow-xs ring-1"
        />
        <span>Labib Tours</span>
      </Link>
      <Suspense fallback={<AuthSkeleton />}>
        <Outlet />
      </Suspense>
    </div>
  );
}

export { AuthLayout };

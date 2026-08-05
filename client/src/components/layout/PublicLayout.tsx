import { Outlet, useMatches } from 'react-router';
import { SkipToContent } from '@/components/layout/SkipToContent';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { Footer } from '@/components/layout/Footer/Footer';
import { WhatsAppButton } from '@/components/layout/FloatingActions/WhatsAppButton';
import { ScrollToTopButton } from '@/components/layout/FloatingActions/ScrollToTopButton';

interface RouteHandle {
  /** Route opts in via `handle: { transparentNavbar: true }` — used by pages with a full-bleed hero (e.g. Home). */
  transparentNavbar?: boolean;
}

/**
 * Layout for every public marketing/booking page: Navbar + page content
 * + Footer + the two floating actions. A future authenticated area
 * (customer dashboard, admin panel) would get its own sibling layout —
 * e.g. DashboardLayout with a sidebar instead of Navbar/Footer — routed
 * separately in app/router, without touching this file.
 */
function PublicLayout() {
  const matches = useMatches();
  const transparentNavbar = matches.some(
    (match) => (match.handle as RouteHandle | undefined)?.transparentNavbar,
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <SkipToContent />
      <Navbar transparentOnTop={transparentNavbar} />
      <Outlet />
      <Footer />
      <ScrollToTopButton />
      <WhatsAppButton />
    </div>
  );
}

export { PublicLayout };

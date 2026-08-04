import { Outlet } from 'react-router';
import { SkipToContent } from '@/components/layout/SkipToContent';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { Footer } from '@/components/layout/Footer/Footer';
import { WhatsAppButton } from '@/components/layout/FloatingActions/WhatsAppButton';
import { ScrollToTopButton } from '@/components/layout/FloatingActions/ScrollToTopButton';

/**
 * Layout for every public marketing/booking page: Navbar + page content
 * + Footer + the two floating actions. A future authenticated area
 * (customer dashboard, admin panel) would get its own sibling layout —
 * e.g. DashboardLayout with a sidebar instead of Navbar/Footer — routed
 * separately in app/router, without touching this file.
 */
function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipToContent />
      <Navbar />
      <Outlet />
      <Footer />
      <ScrollToTopButton />
      <WhatsAppButton />
    </div>
  );
}

export { PublicLayout };

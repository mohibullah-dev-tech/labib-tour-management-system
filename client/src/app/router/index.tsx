import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/components/layout/RootLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/features/admin/components/layout/AdminLayout';
import { HomePage } from '@/pages/HomePage';
import { ComingSoonPage } from '@/pages/ComingSoonPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { NAV_ITEMS, LEGAL_ITEMS } from '@/config/navigation';

/**
 * Central route table, structured as nested layouts:
 *   RootLayout (scroll restoration only)
 *     ├─ PublicLayout (Navbar + Footer + floating actions) — the public site
 *     └─ AdminLayout (Sidebar + Topbar) — the admin dashboard, a SIBLING
 *        of PublicLayout, not nested under it (no public Navbar/Footer in
 *        an authenticated admin context). Route protection is deferred to
 *        the future Authentication module.
 *
 * Every public NAV_ITEMS entry gets a real route (rendering
 * ComingSoonPage until its feature module exists) so the Navbar never
 * links to a 404. Every admin section now has full CRUD UI — see
 * docs/ADMIN_DASHBOARD.md for the complete module breakdown.
 *
 * Tours, Booking, and every Admin route use React Router's `lazy` field
 * instead of a static `element` import, so none of them cost anything in
 * the Home page's initial bundle.
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <HomePage />, handle: { transparentNavbar: true } },
          {
            path: '/tours',
            lazy: () => import('@/pages/ToursPage').then((m) => ({ Component: m.ToursPage })),
          },
          {
            path: '/tours/:slug',
            lazy: () =>
              import('@/pages/TourDetailsPage').then((m) => ({ Component: m.TourDetailsPage })),
          },
          {
            path: '/booking',
            lazy: () => import('@/pages/BookingPage').then((m) => ({ Component: m.BookingPage })),
          },
          ...NAV_ITEMS.filter((item) => item.path !== '/' && item.path !== '/tours').map(
            (item) => ({
              path: item.path,
              element: <ComingSoonPage title={item.label} />,
            }),
          ),
          ...LEGAL_ITEMS.map((item) => ({
            path: item.path,
            element: <ComingSoonPage title={item.label} />,
          })),
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            lazy: () =>
              import('@/pages/admin/AdminDashboardPage').then((m) => ({
                Component: m.AdminDashboardPage,
              })),
          },
          {
            path: 'tours',
            lazy: () =>
              import('@/pages/admin/AdminToursPage').then((m) => ({ Component: m.AdminToursPage })),
          },
          {
            path: 'events',
            lazy: () =>
              import('@/pages/admin/AdminEventsPage').then((m) => ({
                Component: m.AdminEventsPage,
              })),
          },
          {
            path: 'buses',
            lazy: () =>
              import('@/pages/admin/AdminBusesPage').then((m) => ({ Component: m.AdminBusesPage })),
          },
          {
            path: 'hosts',
            lazy: () =>
              import('@/pages/admin/AdminHostsPage').then((m) => ({ Component: m.AdminHostsPage })),
          },
          {
            path: 'bookings',
            lazy: () =>
              import('@/pages/admin/AdminBookingsPage').then((m) => ({
                Component: m.AdminBookingsPage,
              })),
          },
          {
            path: 'guests',
            lazy: () =>
              import('@/pages/admin/AdminGuestsPage').then((m) => ({
                Component: m.AdminGuestsPage,
              })),
          },
          {
            path: 'reviews',
            lazy: () =>
              import('@/pages/admin/AdminReviewsPage').then((m) => ({
                Component: m.AdminReviewsPage,
              })),
          },
          {
            path: 'gallery',
            lazy: () =>
              import('@/pages/admin/AdminGalleryPage').then((m) => ({
                Component: m.AdminGalleryPage,
              })),
          },
          {
            path: 'content',
            lazy: () =>
              import('@/pages/admin/AdminContentPage').then((m) => ({
                Component: m.AdminContentPage,
              })),
          },
          {
            path: 'settings',
            lazy: () =>
              import('@/pages/admin/AdminSettingsPage').then((m) => ({
                Component: m.AdminSettingsPage,
              })),
          },
          {
            path: 'analytics',
            lazy: () =>
              import('@/pages/admin/AdminAnalyticsPage').then((m) => ({
                Component: m.AdminAnalyticsPage,
              })),
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

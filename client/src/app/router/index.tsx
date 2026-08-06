import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/components/layout/RootLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { HomePage } from '@/pages/HomePage';
import { ComingSoonPage } from '@/pages/ComingSoonPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { NAV_ITEMS, LEGAL_ITEMS } from '@/config/navigation';

/**
 * Central route table, structured as nested layouts:
 *   RootLayout (scroll restoration only)
 *     └─ PublicLayout (Navbar + Footer + floating actions)
 *          └─ page routes
 *
 * Every NAV_ITEMS entry gets a real route here (rendering ComingSoonPage
 * until its feature module exists) so the Navbar never links to a 404.
 * `/tours` and `/tours/:slug` are now real (Tours Module phase) — the
 * rest of NAV_ITEMS is filtered to skip `/tours` below so it isn't
 * double-registered.
 *
 * Both Tours routes use React Router's `lazy` field instead of a static
 * `element` import — the Tours module (11 tour records, ~15 detail-page
 * components) only downloads when a visitor actually navigates there,
 * keeping it out of the Home page's initial bundle entirely.
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
    ],
  },
]);

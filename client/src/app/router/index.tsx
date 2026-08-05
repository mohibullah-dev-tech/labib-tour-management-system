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
 * Feature modules will replace these with real elements as they're built
 * — e.g. `{ path: '/tours', element: <ToursPage /> }` — without touching
 * this file's structure.
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <HomePage />, handle: { transparentNavbar: true } },
          ...NAV_ITEMS.filter((item) => item.path !== '/').map((item) => ({
            path: item.path,
            element: <ComingSoonPage title={item.label} />,
          })),
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

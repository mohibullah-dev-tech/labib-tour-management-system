import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/components/layout/RootLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AdminLayout } from '@/features/admin/components/layout/AdminLayout';
import { GuestRoute } from '@/features/auth/components/GuestRoute';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { RoleGuard } from '@/features/auth/components/RoleGuard';
import { Role } from '@/features/auth/types/role';
import { HomePage } from '@/pages/HomePage';
import { ComingSoonPage } from '@/pages/ComingSoonPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { NAV_ITEMS, LEGAL_ITEMS } from '@/config/navigation';

/**
 * Central route table, structured as nested layouts:
 *   RootLayout (scroll restoration only)
 *     ├─ PublicLayout (Navbar + Footer + floating actions) — the public site,
 *     │    now including <ProtectedRoute> branches for /dashboard, /profile,
 *     │    /bookings, /host (keeps the public chrome around authenticated
 *     │    guest/host pages, unlike the admin area)
 *     ├─ AuthLayout (centered card, no Navbar/Footer) — /login, /register,
 *     │    /forgot-password, /reset-password, /verify-email, each wrapped in
 *     │    <GuestRoute> so an already-logged-in visitor is redirected away
 *     └─ AdminLayout (Sidebar + Topbar) — now wrapped in <ProtectedRoute> +
 *          <RoleGuard allowedRoles={[Admin, SuperAdmin]}>, closing the gap
 *          the Admin Dashboard phase explicitly deferred to this phase.
 *
 * Every public NAV_ITEMS entry gets a real route (rendering
 * ComingSoonPage until its feature module exists) so the Navbar never
 * links to a 404.
 *
 * Tours, Booking, Admin, and Auth routes use React Router's `lazy` field
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
          { path: '/unauthorized', element: <UnauthorizedPage /> },

          // --- Authenticated, any role ------------------------------
          {
            element: <ProtectedRoute />,
            children: [
              {
                path: '/dashboard',
                lazy: () =>
                  import('@/pages/protected/DashboardPage').then((m) => ({
                    Component: m.DashboardPage,
                  })),
              },
              {
                path: '/profile',
                lazy: () =>
                  import('@/pages/protected/ProfilePage').then((m) => ({
                    Component: m.ProfilePage,
                  })),
              },
              {
                path: '/bookings',
                lazy: () =>
                  import('@/pages/protected/MyBookingsPage').then((m) => ({
                    Component: m.MyBookingsPage,
                  })),
              },
              // --- Authenticated + Host/Admin/SuperAdmin only -------
              {
                element: <RoleGuard allowedRoles={[Role.Host, Role.Admin, Role.SuperAdmin]} />,
                children: [
                  {
                    path: '/host',
                    lazy: () =>
                      import('@/pages/protected/HostPage').then((m) => ({ Component: m.HostPage })),
                  },
                ],
              },
            ],
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

      // --- Auth pages — guests only (already-logged-in visitors are redirected away) ---
      {
        element: <AuthLayout />,
        children: [
          {
            element: <GuestRoute />,
            children: [
              {
                path: '/login',
                lazy: () =>
                  import('@/pages/auth/LoginPage').then((m) => ({ Component: m.LoginPage })),
              },
              {
                path: '/register',
                lazy: () =>
                  import('@/pages/auth/RegisterPage').then((m) => ({ Component: m.RegisterPage })),
              },
              {
                path: '/forgot-password',
                lazy: () =>
                  import('@/pages/auth/ForgotPasswordPage').then((m) => ({
                    Component: m.ForgotPasswordPage,
                  })),
              },
            ],
          },
          // Reset/verify links from email may be opened by an already-authenticated
          // visitor (different browser/session) — never gated behind GuestRoute.
          {
            path: '/reset-password',
            lazy: () =>
              import('@/pages/auth/ResetPasswordPage').then((m) => ({
                Component: m.ResetPasswordPage,
              })),
          },
          {
            path: '/verify-email',
            lazy: () =>
              import('@/pages/auth/VerifyEmailPage').then((m) => ({
                Component: m.VerifyEmailPage,
              })),
          },
        ],
      },

      // --- Admin — Admin/SuperAdmin only ---
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <RoleGuard allowedRoles={[Role.Admin, Role.SuperAdmin]} />,
            children: [
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
                      import('@/pages/admin/AdminToursPage').then((m) => ({
                        Component: m.AdminToursPage,
                      })),
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
                      import('@/pages/admin/AdminBusesPage').then((m) => ({
                        Component: m.AdminBusesPage,
                      })),
                  },
                  {
                    path: 'hosts',
                    lazy: () =>
                      import('@/pages/admin/AdminHostsPage').then((m) => ({
                        Component: m.AdminHostsPage,
                      })),
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
        ],
      },
    ],
  },
]);

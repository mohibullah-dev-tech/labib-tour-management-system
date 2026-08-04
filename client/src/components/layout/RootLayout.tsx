import { Outlet, ScrollRestoration } from 'react-router';

/**
 * Absolute root of every route in the app — intentionally minimal.
 * Its only jobs: reset scroll position on navigation, and render
 * whichever nested layout (PublicLayout today; a DashboardLayout or
 * AuthLayout later) the matched route belongs under. App-wide providers
 * (Theme, Query, Tooltip) live in app/App.tsx, one level up — kept
 * separate so this file stays about *routing structure*, not app setup.
 */
function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

export { RootLayout };

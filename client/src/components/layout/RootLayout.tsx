import { Outlet, ScrollRestoration } from 'react-router';
import { useHashScroll } from '@/hooks/useHashScroll';

/**
 * Absolute root of every route in the app — intentionally minimal.
 * Its jobs: reset scroll position on navigation, smoothly scroll to anchor hashes,
 * and render whichever nested layout the matched route belongs under.
 */
function RootLayout() {
  useHashScroll();

  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

export { RootLayout };

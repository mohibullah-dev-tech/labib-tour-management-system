import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Ensures in-page hash links (e.g. /#upcoming-events, /#gallery) smoothly
 * scroll to their target elements across both route transitions and direct page loads.
 */
export function useHashScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    const targetId = hash.replace(/^#/, '');

    // Allow React lazy components to mount before finding the element
    const tryScroll = (attempts = 0) => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (attempts < 8) {
        setTimeout(() => tryScroll(attempts + 1), 100);
      }
    };

    const timer = setTimeout(() => tryScroll(), 60);
    return () => clearTimeout(timer);
  }, [pathname, hash]);
}

import { useEffect, useState } from 'react';

/**
 * Returns true once the page has scrolled past `threshold` px. Drives the
 * Navbar's transparent → solid transition. Uses a passive scroll listener
 * (never blocks the scrolling thread) and only flips state at the
 * threshold crossing — not on every pixel — so it triggers far fewer
 * re-renders than storing raw scrollY would.
 */
export function useScrolled(threshold = 24): boolean {
  const [scrolled, setScrolled] = useState(() => window.scrollY > threshold);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > threshold);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}

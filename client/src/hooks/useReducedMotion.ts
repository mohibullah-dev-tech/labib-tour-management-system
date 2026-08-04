import { useEffect, useState } from 'react';

/**
 * WCAG 2.3.3 (Animation from Interactions): respect the user's OS-level
 * "reduce motion" preference. Any component using variants.ts or gsap.ts
 * should check this before playing a non-essential animation — e.g.
 * `const reduced = useReducedMotion(); <motion.div animate={reduced ? undefined : 'visible'} />`
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setReduced(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reduced;
}

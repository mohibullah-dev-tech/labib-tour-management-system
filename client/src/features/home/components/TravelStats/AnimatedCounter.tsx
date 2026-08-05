import { useEffect, useRef, useState } from 'react';
import { useInView, animate } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  decimals?: number;
  durationSeconds?: number;
}

/**
 * Counts up from 0 to `value` once it scrolls into view (never re-triggers
 * on repeated scroll, via `useInView({ once: true })`). Uses Framer
 * Motion's standalone `animate()` — an imperative tween, not tied to a
 * component's animate prop — driving a single piece of local state, so
 * only this span re-renders on every tick, not its parent section.
 * Reduced-motion users see the final number immediately, no count-up.
 */
function AnimatedCounter({
  value,
  suffix = '',
  decimals = 0,
  durationSeconds = 1.8,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [display, setDisplay] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;

    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    const controls = animate(0, value, {
      duration: durationSeconds,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(latest),
    });

    return () => controls.stop();
  }, [isInView, value, durationSeconds, reducedMotion]);

  return (
    <span ref={ref}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export { AnimatedCounter };

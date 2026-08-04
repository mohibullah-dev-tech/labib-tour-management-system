import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/**
 * Registers GSAP plugins exactly once. Call this at the top of any
 * component/module that uses ScrollTrigger before it's used — safe to
 * call repeatedly (guarded), so no need to worry about import order.
 */
export function registerGsapPlugins() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

/**
 * Reusable GSAP helpers for scroll/marketing-style animations (tour
 * galleries, landing sections). Framer Motion (variants.ts) covers
 * component-level React state transitions; GSAP is reserved for the
 * timeline/scroll-driven work it's actually better at.
 *
 * NOT applied anywhere yet — prepared utilities only, per this phase's
 * scope.
 */
export function fadeInOnScroll(target: gsap.TweenTarget, options?: { delay?: number }) {
  registerGsapPlugins();
  return gsap.fromTo(
    target,
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay: options?.delay ?? 0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: target as gsap.DOMTarget,
        start: 'top 85%',
      },
    },
  );
}

export function staggerFadeInOnScroll(targets: gsap.TweenTarget, staggerSeconds = 0.1) {
  registerGsapPlugins();
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 24 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: staggerSeconds,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: targets as gsap.DOMTarget,
        start: 'top 85%',
      },
    },
  );
}

export { gsap, ScrollTrigger };

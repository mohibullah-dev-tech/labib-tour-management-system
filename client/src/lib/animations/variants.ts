import type { Variants } from 'framer-motion';

/**
 * Shared Framer Motion variants. Defined once here so every feature that
 * animates in later (booking cards, list items, page transitions) reuses
 * the exact same easing/duration — a consistent "feel" app-wide instead
 * of every component inventing its own timing.
 *
 * NOT applied anywhere yet — this phase only prepares the utilities per
 * the project brief. Usage later looks like:
 *   <motion.div variants={fadeInUp} initial="hidden" animate="visible" />
 */

const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const; // soft deceleration — no bounce

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE_PREMIUM } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_PREMIUM } },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_PREMIUM } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: EASE_PREMIUM } },
};

export const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE_PREMIUM } },
};

export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE_PREMIUM } },
};

/** Wrap a list container with this + fadeInUp on each child for a staggered reveal. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

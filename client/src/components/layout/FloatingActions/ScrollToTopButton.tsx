import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useScrolled } from '@/hooks/useScrolled';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Appears once the user has scrolled past 400px, smooth-scrolls back to
 * top on click. Positioned above the WhatsApp button (bottom-24 vs
 * bottom-6) so the two floating actions never overlap.
 */
const ScrollToTopButton = memo(function ScrollToTopButton() {
  const visible = useScrolled(400);
  const reducedMotion = useReducedMotion();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          whileHover={reducedMotion ? undefined : { scale: 1.06 }}
          whileTap={reducedMotion ? undefined : { scale: 0.94 }}
          className="border-border bg-card text-foreground fixed right-6 bottom-24 z-30 flex size-11 items-center justify-center rounded-full border shadow-lg"
        >
          <ArrowUp className="size-5" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
});

export { ScrollToTopButton };

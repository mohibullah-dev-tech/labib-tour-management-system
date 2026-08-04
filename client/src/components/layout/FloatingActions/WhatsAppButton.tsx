import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** Placeholder number — replace with the real business WhatsApp number
 *  when that's available; kept as one obvious constant to swap. */
const WHATSAPP_PLACEHOLDER_URL = 'https://wa.me/8801000000000';

/**
 * Floating WhatsApp entry point, bottom-right. Expands to show a text
 * label on hover/focus (desktop) — collapses back to just the icon on
 * mobile where there's no hover, tap goes straight through to WhatsApp.
 * Respects prefers-reduced-motion: the entrance/expand animation is
 * skipped entirely for users who've asked for reduced motion, but the
 * button still functions immediately.
 */
const WhatsAppButton = memo(function WhatsAppButton() {
  const [expanded, setExpanded] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <motion.a
      href={WHATSAPP_PLACEHOLDER_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
      initial={reducedMotion ? false : { opacity: 0, scale: 0.8, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reducedMotion ? undefined : { scale: 1.04 }}
      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
      className="bg-success text-success-foreground shadow-floating fixed right-6 bottom-6 z-30 flex items-center gap-2 overflow-hidden rounded-full px-4 py-3.5"
    >
      <MessageCircle className="size-5 shrink-0" aria-hidden="true" />
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm font-medium whitespace-nowrap"
          >
            Chat with us
          </motion.span>
        )}
      </AnimatePresence>
    </motion.a>
  );
});

export { WhatsAppButton };

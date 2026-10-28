import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ExternalLink, Phone, CheckCircle2 } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { LABIB_CONTACTS } from '@/config/contacts';

/**
 * Multi-number floating WhatsApp entry point, bottom-right.
 * Allows users to choose from any of Labib Tours' official WhatsApp agents.
 */
const WhatsAppButton = memo(function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="fixed right-6 bottom-6 z-40">
      {/* Multi-number Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="border-border bg-card/95 text-card-foreground absolute right-0 bottom-16 w-80 max-w-[calc(100vw-3rem)] rounded-2xl border p-4 shadow-2xl backdrop-blur-md sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                  <MessageCircle className="size-4.5" />
                </div>
                <div>
                  <h4 className="font-display text-sm leading-tight font-bold">
                    লাবিব ট্যুর হোয়াটসঅ্যাপ সাপোর্ট
                  </h4>
                  <p className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                    <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                    সবগুলো হেল্পলাইন এখন অনলাইন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full p-1 transition-colors"
                aria-label="Close WhatsApp options"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-muted-foreground pt-2.5 pb-2 text-xs">
              আপনার প্রয়োজনীয় নম্বরে সরাসরি হোয়াটসঅ্যাপ মেসেজ পাঠান অথবা কল করুন:
            </p>

            {/* List of 3 WhatsApp lines */}
            <div className="flex flex-col gap-2 pt-1">
              {LABIB_CONTACTS.whatsAppList.map((contact) => (
                <div
                  key={contact.id}
                  className="group rounded-xl border p-2.5 transition-all hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-foreground text-xs font-semibold">{contact.name}</span>
                      {contact.badge && (
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {contact.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-foreground font-mono text-xs font-bold">
                      {contact.number}
                    </span>
                  </div>

                  <p className="text-muted-foreground mt-0.5 text-[11px]">{contact.description}</p>

                  <div className="mt-2 flex items-center gap-2">
                    <a
                      href={contact.waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700"
                    >
                      <MessageCircle className="size-3.5" />
                      <span>WhatsApp চ্যাট</span>
                      <ExternalLink className="size-3 opacity-70" />
                    </a>

                    <a
                      href={`tel:${contact.raw}`}
                      className="border-border hover:bg-muted text-foreground flex items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
                      title={`Call ${contact.number}`}
                    >
                      <Phone className="size-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-muted-foreground mt-3 flex items-center justify-center gap-1.5 border-t pt-2.5 text-[11px]">
              <CheckCircle2 className="size-3 text-emerald-500" />
              <span>২৪/৭ কাস্টমার অ্যাসিস্ট্যান্স পাওয়া যাবে</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Trigger Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Open Labib Tours WhatsApp Support"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.8, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        whileHover={reducedMotion ? undefined : { scale: 1.05 }}
        whileTap={reducedMotion ? undefined : { scale: 0.95 }}
        className="flex items-center gap-2 overflow-hidden rounded-full bg-emerald-600 px-4 py-3.5 text-white shadow-2xl transition-colors hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:outline-none"
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle className="size-5 shrink-0" aria-hidden="true" />
          <span className="absolute -top-1 -right-1 size-2 animate-ping rounded-full bg-white" />
        </div>

        <AnimatePresence initial={false}>
          {(hovered || isOpen) && (
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm font-semibold whitespace-nowrap"
            >
              {isOpen ? 'Close' : 'WhatsApp Support'}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
});

export { WhatsAppButton };

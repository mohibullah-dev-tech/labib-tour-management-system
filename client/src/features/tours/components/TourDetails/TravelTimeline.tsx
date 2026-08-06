import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import type { RouteStop } from '@/features/tours/types';
import { staggerContainer, fadeInUp } from '@/lib/animations/variants';

export interface TravelTimelineProps {
  route?: RouteStop[];
}

/**
 * Vertical connected-dot timeline. Purely data-driven off `route` — the
 * exact structure the brief's Dhaka → Cumilla → Feni → Khagrachari →
 * Sajek example implies, sorted by `order` so a backend can send stops
 * in any array order and this still renders correctly.
 */
function TravelTimeline({ route }: TravelTimelineProps) {
  if (!route?.length) return null;

  const sorted = [...route].sort((a, b) => a.order - b.order);

  return (
    <motion.ol
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="relative flex flex-col gap-8 pl-2"
    >
      {sorted.map((stop, i) => (
        <motion.li key={stop.id} variants={fadeInUp} className="relative flex gap-4">
          <div className="relative flex flex-col items-center">
            <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
              <MapPin className="size-4" aria-hidden="true" />
            </span>
            {i < sorted.length - 1 && (
              <span aria-hidden="true" className="bg-border mt-1 h-full w-px flex-1" />
            )}
          </div>
          <div className="pb-2">
            <p className="text-primary text-xs font-medium tracking-wide uppercase">Stop {i + 1}</p>
            <h4 className="font-display text-foreground text-base font-semibold">
              {stop.location}
            </h4>
            {stop.description && (
              <p className="text-muted-foreground mt-1 text-sm">{stop.description}</p>
            )}
          </div>
        </motion.li>
      ))}
    </motion.ol>
  );
}

export { TravelTimeline };

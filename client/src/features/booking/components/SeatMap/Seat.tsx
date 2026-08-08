import { memo } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import type { Seat as SeatType } from '@/features/booking/types';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

export interface SeatProps {
  seat: SeatType;
  isSelected: boolean;
  onToggle: (seatId: string) => void;
}

const STATUS_CLASS: Record<SeatType['status'], string> = {
  available:
    'border-border bg-background text-foreground hover:border-primary hover:bg-primary-50 dark:hover:bg-primary-950',
  booked:
    'border-neutral-300 bg-neutral-300 text-neutral-500 cursor-not-allowed dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-400',
  locked:
    'border-dashed border-neutral-400 bg-neutral-200 text-neutral-500 cursor-not-allowed dark:bg-neutral-800',
  reserved:
    'border-accent-400 bg-accent-100 text-accent-800 cursor-not-allowed dark:border-accent-700 dark:bg-accent-950 dark:text-accent-300',
  'female-reserved':
    'border-rose-300 bg-rose-100 text-rose-700 cursor-not-allowed dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300',
};

const STATUS_LABEL: Record<SeatType['status'], string> = {
  available: 'available',
  booked: 'already booked',
  locked: 'temporarily locked',
  reserved: 'reserved',
  'female-reserved': 'reserved for women',
};

/** One seat button — the atomic unit of the whole SeatMap, memoized since a 45-seat bus renders 45 of these. */
const Seat = memo(function Seat({ seat, isSelected, onToggle }: SeatProps) {
  const isInteractive = seat.status === 'available';
  const reducedMotion = useReducedMotion();
  const label = isSelected
    ? `Seat ${seat.id}, selected`
    : `Seat ${seat.id}, ${STATUS_LABEL[seat.status]}`;

  return (
    <motion.button
      type="button"
      disabled={!isInteractive}
      aria-pressed={isSelected}
      aria-label={label}
      onClick={() => isInteractive && onToggle(seat.id)}
      whileHover={isInteractive && !reducedMotion ? { scale: 1.08 } : undefined}
      whileTap={isInteractive && !reducedMotion ? { scale: 0.95 } : undefined}
      className={cn(
        'relative flex size-9 items-center justify-center rounded-md border-2 text-[11px] font-medium transition-colors',
        isSelected
          ? 'border-primary bg-primary text-primary-foreground'
          : STATUS_CLASS[seat.status],
      )}
    >
      {seat.status === 'locked' ? <Lock className="size-3.5" aria-hidden="true" /> : seat.id}
    </motion.button>
  );
});

export { Seat };

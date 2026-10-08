import { memo } from 'react';
import { motion } from 'framer-motion';
import { Lock, Ban } from 'lucide-react';
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
    'border-dashed border-amber-400 bg-amber-100 text-amber-700 cursor-not-allowed dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  reserved:
    'border-accent-400 bg-accent-100 text-accent-800 cursor-not-allowed dark:border-accent-700 dark:bg-accent-950 dark:text-accent-300',
  blocked:
    'border-neutral-400 bg-neutral-200 text-neutral-400 cursor-not-allowed dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-600',
  'female-reserved':
    'border-rose-300 bg-rose-100 text-rose-700 cursor-not-allowed dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300',
};

const STATUS_LABEL: Record<SeatType['status'], string> = {
  available: 'available',
  booked: 'already booked',
  locked: 'temporarily unavailable (held by another customer)',
  reserved: 'reserved',
  blocked: 'blocked',
  'female-reserved': 'reserved for women',
};

/**
 * One seat button — the atomic unit of the SeatMap.
 * Differentiates between available, selected/held by current user,
 * temporarily locked by another customer, booked, reserved, and blocked.
 */
const Seat = memo(function Seat({ seat, isSelected, onToggle }: SeatProps) {
  const isLockedByOther = seat.status === 'locked' && !seat.lockedByCurrentUser;
  const isHeldByMe = isSelected || (seat.status === 'locked' && !!seat.lockedByCurrentUser);
  const isInteractive = seat.status === 'available' || isHeldByMe;

  const reducedMotion = useReducedMotion();

  let label = `Seat ${seat.id}, ${STATUS_LABEL[seat.status]}`;
  if (isHeldByMe) {
    label = `Seat ${seat.id}, held by you (click to unselect)`;
  } else if (isLockedByOther) {
    label = `Seat ${seat.id}, temporarily unavailable`;
  }

  return (
    <motion.button
      type="button"
      disabled={!isInteractive}
      aria-pressed={isHeldByMe}
      aria-label={label}
      title={label}
      onClick={() => isInteractive && onToggle(seat.id)}
      whileHover={isInteractive && !reducedMotion ? { scale: 1.08 } : undefined}
      whileTap={isInteractive && !reducedMotion ? { scale: 0.95 } : undefined}
      className={cn(
        'relative flex size-9 items-center justify-center rounded-md border-2 text-[11px] font-medium transition-colors',
        isHeldByMe
          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
          : STATUS_CLASS[seat.status],
      )}
    >
      {seat.status === 'blocked' ? (
        <Ban className="size-3 text-neutral-400" aria-hidden="true" />
      ) : isLockedByOther ? (
        <Lock className="size-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
      ) : (
        seat.id
      )}
    </motion.button>
  );
});

export { Seat };

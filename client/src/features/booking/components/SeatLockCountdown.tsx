import { useEffect, useState, memo } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SeatLockCountdownProps {
  expiresAt: string | null;
  onExpired?: () => void;
  className?: string;
  showWarningThresholdSeconds?: number;
}

/**
 * Reusable countdown timer for temporary seat locks.
 * Derives accurate remaining time directly from server ISO timestamp (expiresAt)
 * avoiding drift and handling browser tab sleep/inactivity cleanly.
 */
export const SeatLockCountdown = memo(function SeatLockCountdown({
  expiresAt,
  onExpired,
  className,
  showWarningThresholdSeconds = 120,
}: SeatLockCountdownProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (!expiresAt) return 0;
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  useEffect(() => {
    if (!expiresAt) {
      setSecondsRemaining(0);
      return;
    }

    const calculateRemaining = () => {
      const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
      const remaining = Math.max(0, diff);
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        onExpired?.();
      }
    };

    // Immediate check
    calculateRemaining();

    const interval = setInterval(calculateRemaining, 1000);

    // Re-check when browser tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        calculateRemaining();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [expiresAt, onExpired]);

  if (!expiresAt || secondsRemaining <= 0) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400',
          className,
        )}
      >
        <AlertTriangle className="size-4 shrink-0" />
        <span>Your seat hold has expired</span>
      </div>
    );
  }

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = secondsRemaining <= showWarningThresholdSeconds;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
        isWarning
          ? 'animate-pulse border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
          : 'border-primary/20 bg-primary/5 text-primary dark:border-primary/30 dark:bg-primary/10',
        className,
      )}
    >
      <Timer className="size-4 shrink-0" />
      <span>
        Seats held for: <strong className="font-mono font-semibold">{formattedTime}</strong>
      </span>
    </div>
  );
});

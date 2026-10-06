import { Badge } from '@/components/ui/badge';
import type { BookingStatus, PaymentStatus } from '@/features/guest/types';

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  switch (status) {
    case 'confirmed':
      return (
        <Badge
          className={`border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 ${className || ''}`}
        >
          ● Confirmed
        </Badge>
      );
    case 'pending':
      return (
        <Badge
          className={`border-amber-500/20 bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 ${className || ''}`}
        >
          ● Pending
        </Badge>
      );
    case 'completed':
      return (
        <Badge
          className={`border-blue-500/20 bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 ${className || ''}`}
        >
          ✓ Completed
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge
          className={`border-rose-500/20 bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 ${className || ''}`}
        >
          ✕ Cancelled
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  switch (status) {
    case 'paid':
      return (
        <Badge
          variant="outline"
          className={`bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-300 border-success-200 dark:border-success-800 ${className || ''}`}
        >
          Paid in Full
        </Badge>
      );
    case 'partial':
      return (
        <Badge
          variant="outline"
          className={`border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300 ${className || ''}`}
        >
          Partial Due
        </Badge>
      );
    case 'due':
      return (
        <Badge
          variant="outline"
          className={`border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300 ${className || ''}`}
        >
          Payment Due
        </Badge>
      );
    case 'refunded':
      return (
        <Badge
          variant="outline"
          className={`bg-muted text-muted-foreground border-border ${className || ''}`}
        >
          Refunded
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

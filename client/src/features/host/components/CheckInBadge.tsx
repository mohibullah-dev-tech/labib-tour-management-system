import { CheckCircle2, Clock, UserX, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CheckInStatus } from '@/features/host/types';

interface CheckInBadgeProps {
  status: CheckInStatus;
  className?: string;
  size?: 'sm' | 'default';
}

export function CheckInBadge({ status, className = '', size = 'default' }: CheckInBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1';

  switch (status) {
    case 'checked-in':
      return (
        <Badge
          variant="outline"
          className={`gap-1 border-emerald-500/40 bg-emerald-500/10 font-medium text-emerald-700 dark:text-emerald-400 ${sizeClasses} ${className}`}
        >
          <CheckCircle2 className={size === 'sm' ? 'size-2.5' : 'size-3.5'} />
          <span>Checked In</span>
        </Badge>
      );
    case 'not-checked-in':
      return (
        <Badge
          variant="outline"
          className={`gap-1 border-amber-500/40 bg-amber-500/10 font-medium text-amber-700 dark:text-amber-400 ${sizeClasses} ${className}`}
        >
          <Clock className={size === 'sm' ? 'size-2.5' : 'size-3.5'} />
          <span>Not Checked In</span>
        </Badge>
      );
    case 'absent':
      return (
        <Badge
          variant="outline"
          className={`gap-1 border-rose-500/40 bg-rose-500/10 font-medium text-rose-700 dark:text-rose-400 ${sizeClasses} ${className}`}
        >
          <UserX className={size === 'sm' ? 'size-2.5' : 'size-3.5'} />
          <span>Absent</span>
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge
          variant="outline"
          className={`border-muted-foreground/30 bg-muted text-muted-foreground gap-1 font-medium ${sizeClasses} ${className}`}
        >
          <XCircle className={size === 'sm' ? 'size-2.5' : 'size-3.5'} />
          <span>Cancelled</span>
        </Badge>
      );
  }
}

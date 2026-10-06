import { Calendar, AlertCircle, Users, Navigation, CheckCircle, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { EventLifecycleStatus } from '@/features/host/types';

interface EventLifecycleBadgeProps {
  status: EventLifecycleStatus;
  className?: string;
  size?: 'sm' | 'default';
}

export function EventLifecycleBadge({
  status,
  className = '',
  size = 'default',
}: EventLifecycleBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2.5 py-1';

  switch (status) {
    case 'scheduled':
      return (
        <Badge
          variant="outline"
          className={`gap-1 border-blue-500/40 bg-blue-500/10 font-medium text-blue-700 dark:text-blue-400 ${sizeClasses} ${className}`}
        >
          <Calendar className={size === 'sm' ? 'size-2.5' : 'size-3.5'} />
          <span>Scheduled</span>
        </Badge>
      );
    case 'preparing':
      return (
        <Badge
          variant="outline"
          className={`gap-1 border-amber-500/40 bg-amber-500/10 font-medium text-amber-700 dark:text-amber-400 ${sizeClasses} ${className}`}
        >
          <AlertCircle className={size === 'sm' ? 'size-2.5' : 'size-3.5'} />
          <span>Preparing</span>
        </Badge>
      );
    case 'boarding':
      return (
        <Badge
          variant="outline"
          className={`animate-pulse gap-1 border-indigo-500/40 bg-indigo-500/10 font-medium text-indigo-700 dark:text-indigo-400 ${sizeClasses} ${className}`}
        >
          <Users className={size === 'sm' ? 'size-2.5' : 'size-3.5'} />
          <span>Boarding</span>
        </Badge>
      );
    case 'started':
    case 'in-progress':
      return (
        <Badge
          variant="outline"
          className={`gap-1.5 border-emerald-500/40 bg-emerald-500/10 font-medium text-emerald-700 dark:text-emerald-400 ${sizeClasses} ${className}`}
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <Navigation className={size === 'sm' ? 'size-2.5' : 'size-3'} />
          <span>{status === 'started' ? 'Started' : 'In Progress'}</span>
        </Badge>
      );
    case 'completed':
      return (
        <Badge
          variant="outline"
          className={`gap-1 border-purple-500/40 bg-purple-500/10 font-medium text-purple-700 dark:text-purple-400 ${sizeClasses} ${className}`}
        >
          <CheckCircle className={size === 'sm' ? 'size-2.5' : 'size-3.5'} />
          <span>Completed</span>
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge
          variant="outline"
          className={`gap-1 border-rose-500/40 bg-rose-500/10 font-medium text-rose-700 dark:text-rose-400 ${sizeClasses} ${className}`}
        >
          <Ban className={size === 'sm' ? 'size-2.5' : 'size-3.5'} />
          <span>Cancelled</span>
        </Badge>
      );
  }
}

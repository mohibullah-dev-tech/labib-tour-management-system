/**
 * Location Status Badges
 * Labib Tour Management System (LTMS) — Phase 11
 */

import { Radio, Pause, StopCircle, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { LocationSharingStatus, NetworkStatus } from '../types/location.types';

interface LocationStatusProps {
  status: LocationSharingStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LocationStatusBadge({ status, size = 'md', className = '' }: LocationStatusProps) {
  const sizeClasses =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5'
      : size === 'lg'
        ? 'text-xs px-3.5 py-1.5'
        : 'text-xs px-2.5 py-1';

  switch (status) {
    case 'active':
      return (
        <Badge
          className={`gap-1.5 bg-emerald-600 font-bold text-white shadow-xs hover:bg-emerald-700 ${sizeClasses} ${className}`}
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-white" />
          </span>
          <span>LIVE SHARING ACTIVE</span>
        </Badge>
      );

    case 'starting':
      return (
        <Badge
          variant="outline"
          className={`border-primary/40 bg-primary/10 text-primary gap-1.5 font-bold ${sizeClasses} ${className}`}
        >
          <Loader2 className="size-3 animate-spin" />
          <span>CONNECTING GPS...</span>
        </Badge>
      );

    case 'paused':
      return (
        <Badge
          variant="outline"
          className={`gap-1.5 border-amber-500/40 bg-amber-500/10 font-bold text-amber-700 dark:text-amber-400 ${sizeClasses} ${className}`}
        >
          <Pause className="size-3" />
          <span>BROADCAST PAUSED</span>
        </Badge>
      );

    case 'stopped':
      return (
        <Badge
          variant="outline"
          className={`gap-1.5 border-rose-500/30 bg-rose-500/10 font-medium text-rose-700 dark:text-rose-400 ${sizeClasses} ${className}`}
        >
          <StopCircle className="size-3" />
          <span>SHARING STOPPED</span>
        </Badge>
      );

    case 'error':
      return (
        <Badge variant="destructive" className={`gap-1.5 font-bold ${sizeClasses} ${className}`}>
          <Radio className="size-3" />
          <span>GPS ERROR</span>
        </Badge>
      );

    case 'inactive':
    default:
      return (
        <Badge
          variant="outline"
          className={`border-border text-muted-foreground gap-1.5 font-medium ${sizeClasses} ${className}`}
        >
          <span className="bg-muted-foreground/50 size-2 rounded-full" />
          <span>LOCATION SHARING OFF</span>
        </Badge>
      );
  }
}

export function NetworkStatusIndicator({ networkStatus }: { networkStatus: NetworkStatus }) {
  if (networkStatus === 'offline') {
    return (
      <div className="flex animate-pulse items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
        <WifiOff className="size-3.5" />
        <span>Connection interrupted (Offline)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
      <Wifi className="size-3.5" />
      <span>Online</span>
    </div>
  );
}

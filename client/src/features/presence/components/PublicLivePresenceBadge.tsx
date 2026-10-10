import { Sparkles } from 'lucide-react';
import { usePresenceTracker } from '../hooks/usePresenceTracker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PublicLivePresenceBadgeProps {
  className?: string;
  variant?: 'pill' | 'card';
}

export function PublicLivePresenceBadge({
  className = '',
  variant = 'pill',
}: PublicLivePresenceBadgeProps) {
  const { summary } = usePresenceTracker();
  const onlineCount = Math.max(1, summary.totalOnline);

  if (variant === 'card') {
    return (
      <div
        className={`text-card-foreground rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-sm backdrop-blur ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
              Live Traveler Activity
            </span>
          </div>
          <Sparkles className="size-4 text-emerald-500" />
        </div>
        <p className="text-foreground mt-2 text-2xl font-bold tracking-tight">
          {onlineCount}{' '}
          <span className="text-muted-foreground text-sm font-normal">online now</span>
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Travelers and visitors are currently exploring tours and checking seat availability across
          Bangladesh.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-500/20 dark:text-emerald-300 ${className}`}
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span>
              <strong className="font-semibold">{onlineCount}</strong> online right now
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs p-3 text-xs">
          <p className="text-foreground font-semibold">Real-time Activity</p>
          <p className="text-muted-foreground mt-1">
            {summary.guestsCount > 0 && `${summary.guestsCount} logged-in travelers, `}
            {summary.hostsCount > 0 && `${summary.hostsCount} tour guides on road, `}
            {summary.visitorsCount > 0 && `${summary.visitorsCount} exploring packages.`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

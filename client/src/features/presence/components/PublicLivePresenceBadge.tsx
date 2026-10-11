import { Sparkles } from 'lucide-react';
import { usePresenceTracker } from '../hooks/usePresenceTracker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PublicLivePresenceBadgeProps {
  className?: string;
  variant?: 'pill' | 'card';
  /** True when rendered over dark hero image on transparent navbar */
  onTransparentSurface?: boolean;
}

export function PublicLivePresenceBadge({
  className = '',
  variant = 'pill',
  onTransparentSurface = false,
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
          <span className="text-muted-foreground text-sm font-normal">অনলাইনে আছেন</span>
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          বর্তমানে পর্যটকরা প্যাকেজ দেখছেন এবং আসন প্রাপ্যতা যাচাই করছেন।
        </p>
      </div>
    );
  }

  const pillStyles = onTransparentSurface
    ? 'border-emerald-400/50 bg-emerald-950/75 text-emerald-100 hover:bg-emerald-900/80 shadow-sm backdrop-blur-md'
    : 'border-emerald-400/60 bg-emerald-50 text-emerald-900 hover:bg-emerald-100/90 dark:border-emerald-500/40 dark:bg-emerald-950/60 dark:text-emerald-100 dark:hover:bg-emerald-900/70 shadow-xs';

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition select-none shrink-0 whitespace-nowrap',
              pillStyles,
              className,
            )}
          >
            <span className="relative flex size-2.5 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="tracking-wide">
              <strong
                className={cn(
                  'font-bold',
                  onTransparentSurface
                    ? 'text-emerald-300'
                    : 'text-emerald-950 dark:text-emerald-300',
                )}
              >
                {onlineCount}
              </strong>{' '}
              জন এখন অনলাইনে আছেন
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs p-3 text-xs">
          <p className="text-foreground font-semibold">লাইভ কার্যক্রম</p>
          <p className="text-muted-foreground mt-1">
            {summary.guestsCount > 0 && `${summary.guestsCount} জন পর্যটক, `}
            {summary.hostsCount > 0 && `${summary.hostsCount} জন ট্যুর গাইড, `}
            {summary.visitorsCount > 0 && `${summary.visitorsCount} জন প্যাকেজ দেখছেন।`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

import { memo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { DashboardStat } from '@/features/admin/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  stat: DashboardStat;
}

/** One of 8 rendered on the Overview — memoized since none depend on anything that changes per-render of the grid. */
const StatCard = memo(function StatCard({ stat }: StatCardProps) {
  const Icon = stat.icon;

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div>
          <p className="text-muted-foreground text-xs">{stat.label}</p>
          <p className="font-display text-foreground mt-1 text-2xl font-semibold">{stat.value}</p>
          {stat.change && (
            <p
              className={cn(
                'mt-1 flex items-center gap-1 text-xs font-medium',
                stat.change.direction === 'up' ? 'text-success-600' : 'text-danger-600',
              )}
            >
              {stat.change.direction === 'up' ? (
                <TrendingUp className="size-3.5" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3.5" aria-hidden="true" />
              )}
              {stat.change.value}
            </p>
          )}
        </div>
        <div className="bg-primary-50 text-primary dark:bg-primary-950 flex size-10 shrink-0 items-center justify-center rounded-full">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
});

export { StatCard };

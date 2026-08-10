import type { LucideIcon } from 'lucide-react';
import { Ticket, Wallet, Star, UserPlus, CalendarClock } from 'lucide-react';
import type { RecentActivity } from '@/features/admin/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TYPE_ICON: Record<RecentActivity['type'], LucideIcon> = {
  booking: Ticket,
  payment: Wallet,
  review: Star,
  guest: UserPlus,
  event: CalendarClock,
};

const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function relativeTime(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (Math.abs(diffHours) < 24) return relativeFormatter.format(diffHours, 'hour');
  return relativeFormatter.format(Math.round(diffHours / 24), 'day');
}

export interface RecentActivityListProps {
  activities: RecentActivity[];
}

function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4">
          {activities.map((activity) => {
            const Icon = TYPE_ICON[activity.type];
            return (
              <li key={activity.id} className="flex items-start gap-3">
                <span className="bg-muted text-muted-foreground mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-foreground text-sm">{activity.message}</p>
                  <time dateTime={activity.timestamp} className="text-muted-foreground text-xs">
                    {relativeTime(activity.timestamp)}
                  </time>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

export { RecentActivityList };

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/features/admin/components/layout/AdminPageHeader';
import { StatCard } from '@/features/admin/components/overview/StatCard';
import { ChartCard } from '@/features/admin/components/overview/ChartCard';
import { RecentActivityList } from '@/features/admin/components/overview/RecentActivityList';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DASHBOARD_STATS,
  MONTHLY_REVENUE,
  BOOKING_TRENDS,
  POPULAR_DESTINATIONS_CHART,
  RECENT_ACTIVITIES,
} from '@/features/admin/data/dashboard';
import { formatBDT } from '@/lib/format';

/**
 * Admin Dashboard Overview — the module this phase fully implements.
 * Reads exclusively from features/admin/data/dashboard.ts; every stat
 * card and chart's data source is a single swap away from a real
 * `GET /api/v1/admin/dashboard` response (see docs/ADMIN_DASHBOARD.md).
 */
export function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Dashboard"
        description="An overview of tours, bookings, and revenue."
      />

      {isLoading ? (
        <div className="laptop:grid-cols-4 grid grid-cols-2 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="laptop:grid-cols-4 grid grid-cols-2 gap-4">
          {DASHBOARD_STATS.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </div>
      )}

      <div className="laptop:grid-cols-2 grid grid-cols-1 gap-6">
        <ChartCard
          title="Monthly Revenue"
          description="Last 6 months"
          data={MONTHLY_REVENUE}
          variant="bar"
          formatValue={formatBDT}
        />
        <ChartCard
          title="Booking Trends"
          description="This month, by week"
          data={BOOKING_TRENDS}
          variant="line"
        />
      </div>

      <div className="laptop:grid-cols-2 grid grid-cols-1 gap-6">
        <ChartCard
          title="Popular Destinations"
          description="Bookings by destination"
          data={POPULAR_DESTINATIONS_CHART}
          variant="bar"
        />
        <RecentActivityList activities={RECENT_ACTIVITIES} />
      </div>
    </div>
  );
}

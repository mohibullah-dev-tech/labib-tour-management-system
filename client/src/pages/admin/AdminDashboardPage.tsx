import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Radio, ArrowRight, Clock } from 'lucide-react';
import { AdminPageHeader } from '@/features/admin/components/layout/AdminPageHeader';
import { StatCard } from '@/features/admin/components/overview/StatCard';
import { ChartCard } from '@/features/admin/components/overview/ChartCard';
import { RecentActivityList } from '@/features/admin/components/overview/RecentActivityList';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DASHBOARD_STATS,
  MONTHLY_REVENUE,
  BOOKING_TRENDS,
  POPULAR_DESTINATIONS_CHART,
  RECENT_ACTIVITIES,
} from '@/features/admin/data/dashboard';
import { formatBDT } from '@/lib/format';
import { useAdminLiveLocation, LocationStatusBadge } from '@/features/live-location';

/**
 * Admin Dashboard Overview — the module this phase fully implements.
 * Reads exclusively from features/admin/data/dashboard.ts; every stat
 * card and chart's data source is a single swap away from a real
 * `GET /api/v1/admin/dashboard` response (see docs/ADMIN_DASHBOARD.md).
 */
export function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { activeTours, allEvents } = useAdminLiveLocation();

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

      {/* Live Tours Real-Time Tracking Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="size-4 animate-pulse text-emerald-600" />
            <h2 className="font-display text-foreground text-base font-bold">
              Live Tours (Real-Time GPS Tracking)
            </h2>
          </div>
          <span className="text-muted-foreground text-xs">
            {allEvents.length} Active Tours in Field
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {allEvents.map((tour) => {
            const isTourLive = activeTours.some((t) => t.id === tour.id);
            return (
              <Card key={tour.id} className="border-border bg-card overflow-hidden shadow-xs">
                <CardContent className="flex flex-col justify-between gap-4 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-primary bg-primary/10 border-primary/20 rounded border px-2 py-0.5 font-mono text-[10px] font-bold">
                          {tour.busNumber}
                        </span>
                        <LocationStatusBadge
                          status={isTourLive ? 'active' : 'inactive'}
                          size="sm"
                        />
                      </div>
                      <h3 className="font-display text-foreground mt-1 text-base font-bold">
                        {tour.destination}: {tour.tourName}
                      </h3>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        Host: <strong>{tour.hostName}</strong> • {tour.guestCount} Guests
                      </p>
                    </div>
                  </div>

                  <div className="border-border/60 flex items-center justify-between border-t pt-2 text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3.5" />
                      <span>{isTourLive ? 'Broadcasting live now' : 'Scheduled departure'}</span>
                    </span>

                    <Link to={`/admin/live-location/${tour.id}`}>
                      <Button size="sm" className="h-8 gap-1.5 text-xs font-semibold">
                        <span>View Location</span>
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

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

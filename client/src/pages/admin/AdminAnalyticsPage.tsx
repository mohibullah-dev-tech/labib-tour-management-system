import {
  ANALYTICS_REVENUE,
  ANALYTICS_PROFIT,
  ANALYTICS_BOOKINGS,
  ANALYTICS_GUESTS,
  ANALYTICS_TOP_DESTINATIONS,
  MONTHLY_REPORTS,
} from '@/features/admin/data/analytics';
import { AdminPageHeader } from '@/features/admin/components/layout/AdminPageHeader';
import { ChartCard } from '@/features/admin/components/overview/ChartCard';
import { DataTable, type DataTableColumn } from '@/features/admin/components/shared/DataTable';
import type { MonthlyReportRow } from '@/features/admin/data/analytics';
import { formatBDT } from '@/lib/format';

const reportColumns: DataTableColumn<MonthlyReportRow>[] = [
  { key: 'month', header: 'Month', render: (r) => r.month },
  { key: 'bookings', header: 'Bookings', render: (r) => r.bookings },
  { key: 'revenue', header: 'Revenue', render: (r) => formatBDT(r.revenueBDT) },
  { key: 'profit', header: 'Profit', render: (r) => formatBDT(r.profitBDT), hideOnMobile: true },
  { key: 'guests', header: 'New Guests', render: (r) => r.newGuests, hideOnMobile: true },
];

export function AdminAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Analytics"
        description="Revenue, profit, bookings, guests, and monthly performance."
      />

      <div className="laptop:grid-cols-2 grid grid-cols-1 gap-6">
        <ChartCard
          title="Revenue"
          description="Last 6 months"
          data={ANALYTICS_REVENUE}
          variant="bar"
          formatValue={formatBDT}
        />
        <ChartCard
          title="Profit"
          description="Last 6 months"
          data={ANALYTICS_PROFIT}
          variant="bar"
          formatValue={formatBDT}
        />
      </div>

      <div className="laptop:grid-cols-2 grid grid-cols-1 gap-6">
        <ChartCard
          title="Bookings"
          description="Last 6 months"
          data={ANALYTICS_BOOKINGS}
          variant="line"
        />
        <ChartCard
          title="Guests"
          description="New guests, last 6 months"
          data={ANALYTICS_GUESTS}
          variant="line"
        />
      </div>

      <ChartCard
        title="Top Destinations"
        description="Bookings by destination"
        data={ANALYTICS_TOP_DESTINATIONS}
        variant="bar"
      />

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-foreground text-lg font-semibold">Monthly Reports</h2>
        <DataTable columns={reportColumns} rows={MONTHLY_REPORTS} getRowId={(r) => r.month} />
      </div>
    </div>
  );
}

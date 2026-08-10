import type { ChartSeriesPoint } from '@/features/admin/types';

export const ANALYTICS_REVENUE: ChartSeriesPoint[] = [
  { label: 'Apr', value: 320000 },
  { label: 'May', value: 410000 },
  { label: 'Jun', value: 380000 },
  { label: 'Jul', value: 465000 },
  { label: 'Aug', value: 512000 },
  { label: 'Sep', value: 642000 },
];

export const ANALYTICS_PROFIT: ChartSeriesPoint[] = [
  { label: 'Apr', value: 96000 },
  { label: 'May', value: 123000 },
  { label: 'Jun', value: 108000 },
  { label: 'Jul', value: 142000 },
  { label: 'Aug', value: 158000 },
  { label: 'Sep', value: 201000 },
];

export const ANALYTICS_BOOKINGS: ChartSeriesPoint[] = [
  { label: 'Apr', value: 42 },
  { label: 'May', value: 51 },
  { label: 'Jun', value: 47 },
  { label: 'Jul', value: 58 },
  { label: 'Aug', value: 64 },
  { label: 'Sep', value: 79 },
];

export const ANALYTICS_GUESTS: ChartSeriesPoint[] = [
  { label: 'Apr', value: 88 },
  { label: 'May', value: 104 },
  { label: 'Jun', value: 96 },
  { label: 'Jul', value: 121 },
  { label: 'Aug', value: 138 },
  { label: 'Sep', value: 162 },
];

export const ANALYTICS_TOP_DESTINATIONS: ChartSeriesPoint[] = [
  { label: "Cox's Bazar", value: 38 },
  { label: 'Sajek Valley', value: 29 },
  { label: 'Bandarban', value: 21 },
  { label: 'Sylhet', value: 17 },
  { label: 'Rangamati', value: 9 },
];

export interface MonthlyReportRow {
  month: string;
  bookings: number;
  revenueBDT: number;
  profitBDT: number;
  newGuests: number;
}

export const MONTHLY_REPORTS: MonthlyReportRow[] = [
  { month: 'April 2026', bookings: 42, revenueBDT: 320000, profitBDT: 96000, newGuests: 35 },
  { month: 'May 2026', bookings: 51, revenueBDT: 410000, profitBDT: 123000, newGuests: 44 },
  { month: 'June 2026', bookings: 47, revenueBDT: 380000, profitBDT: 108000, newGuests: 38 },
  { month: 'July 2026', bookings: 58, revenueBDT: 465000, profitBDT: 142000, newGuests: 51 },
  { month: 'August 2026', bookings: 64, revenueBDT: 512000, profitBDT: 158000, newGuests: 57 },
];

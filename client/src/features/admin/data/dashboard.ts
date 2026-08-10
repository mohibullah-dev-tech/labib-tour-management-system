import {
  MapPinned,
  CalendarRange,
  Ticket,
  Users,
  Wallet,
  AlertCircle,
  Armchair,
  UserRound,
} from 'lucide-react';
import type { ChartSeriesPoint, DashboardStat, RecentActivity } from '@/features/admin/types';

/**
 * Placeholder dashboard data. Every stat/series here is what the real
 * endpoints (see docs/ADMIN_DASHBOARD.md's "Future Backend APIs") will
 * compute server-side — this file exists purely so the Overview page has
 * something concrete to render today.
 */

export const DASHBOARD_STATS: DashboardStat[] = [
  { id: 'total-tours', label: 'Total Tours', value: '11', icon: MapPinned },
  {
    id: 'upcoming-events',
    label: 'Upcoming Events',
    value: '4',
    icon: CalendarRange,
    change: { value: '+2 this month', direction: 'up' },
  },
  {
    id: 'todays-bookings',
    label: "Today's Bookings",
    value: '7',
    icon: Ticket,
    change: { value: '+3 vs yesterday', direction: 'up' },
  },
  {
    id: 'active-guests',
    label: 'Active Guests',
    value: '1,284',
    icon: Users,
    change: { value: '+18 this week', direction: 'up' },
  },
  {
    id: 'revenue',
    label: 'Revenue (This Month)',
    value: '\u09f3 6,42,000',
    icon: Wallet,
    change: { value: '+12.4%', direction: 'up' },
  },
  {
    id: 'pending-payments',
    label: 'Pending Payments',
    value: '\u09f3 84,500',
    icon: AlertCircle,
    change: { value: '9 bookings', direction: 'down' },
  },
  { id: 'available-seats', label: 'Available Seats', value: '124', icon: Armchair },
  { id: 'tour-hosts', label: 'Tour Hosts', value: '6', icon: UserRound },
];

export const MONTHLY_REVENUE: ChartSeriesPoint[] = [
  { label: 'Apr', value: 320000 },
  { label: 'May', value: 410000 },
  { label: 'Jun', value: 380000 },
  { label: 'Jul', value: 465000 },
  { label: 'Aug', value: 512000 },
  { label: 'Sep', value: 642000 },
];

export const BOOKING_TRENDS: ChartSeriesPoint[] = [
  { label: 'Week 1', value: 18 },
  { label: 'Week 2', value: 24 },
  { label: 'Week 3', value: 21 },
  { label: 'Week 4', value: 31 },
];

export const POPULAR_DESTINATIONS_CHART: ChartSeriesPoint[] = [
  { label: "Cox's Bazar", value: 38 },
  { label: 'Sajek Valley', value: 29 },
  { label: 'Bandarban', value: 21 },
  { label: 'Sylhet', value: 17 },
];

export const RECENT_ACTIVITIES: RecentActivity[] = [
  {
    id: 'act-1',
    type: 'booking',
    message: 'Farhana Akter booked 2 seats for Sajek Valley Tour',
    timestamp: '2026-08-08T09:24:00+06:00',
  },
  {
    id: 'act-2',
    type: 'payment',
    message: 'Advance payment received for booking LTMS-40881213',
    timestamp: '2026-08-08T08:57:00+06:00',
  },
  {
    id: 'act-3',
    type: 'review',
    message: 'New 5-star review submitted for Bandarban Hill Trekking',
    timestamp: '2026-08-08T08:10:00+06:00',
  },
  {
    id: 'act-4',
    type: 'guest',
    message: 'New guest profile created — Rakibul Islam',
    timestamp: '2026-08-07T21:42:00+06:00',
  },
  {
    id: 'act-5',
    type: 'event',
    message: "Cox's Bazar Weekend Getaway marked as filling fast",
    timestamp: '2026-08-07T18:15:00+06:00',
  },
];

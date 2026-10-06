import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  MapPinned,
  CalendarRange,
  Bus,
  UserRound,
  ClipboardList,
  Users,
  Star,
  Images,
  FileText,
  Settings,
  BarChart3,
  MessageSquare,
} from 'lucide-react';

export interface AdminNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Section this item belongs to — not yet built beyond Overview (see docs/ADMIN_DASHBOARD.md). */
  isPlaceholder?: boolean;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

/**
 * Single source of truth for the sidebar AND the breadcrumb (which
 * looks up the current route's label from here rather than duplicating
 * page titles). Grouped to match how an admin actually thinks about the
 * product: tour content, fleet/people, bookings, site content, system.
 */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', path: '/admin', icon: LayoutDashboard }],
  },
  {
    label: 'Tour Management',
    items: [
      { label: 'Tour Templates', path: '/admin/tours', icon: MapPinned, isPlaceholder: true },
      { label: 'Tour Events', path: '/admin/events', icon: CalendarRange, isPlaceholder: true },
    ],
  },
  {
    label: 'Fleet & People',
    items: [
      { label: 'Buses', path: '/admin/buses', icon: Bus, isPlaceholder: true },
      { label: 'Hosts', path: '/admin/hosts', icon: UserRound, isPlaceholder: true },
    ],
  },
  {
    label: 'Bookings',
    items: [
      { label: 'Bookings', path: '/admin/bookings', icon: ClipboardList, isPlaceholder: true },
      { label: 'Guests', path: '/admin/guests', icon: Users, isPlaceholder: true },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Reviews', path: '/admin/reviews', icon: Star, isPlaceholder: true },
      { label: 'Gallery', path: '/admin/gallery', icon: Images, isPlaceholder: true },
      { label: 'Website Content', path: '/admin/content', icon: FileText, isPlaceholder: true },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Messages', path: '/admin/messages', icon: MessageSquare },
      { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, isPlaceholder: true },
      { label: 'Settings', path: '/admin/settings', icon: Settings, isPlaceholder: true },
    ],
  },
];

/** Flat lookup used by the breadcrumb to resolve a path -> label without walking the grouped structure each time. */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((g) => g.items);

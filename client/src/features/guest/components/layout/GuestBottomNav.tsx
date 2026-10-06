import { LayoutDashboard, CalendarCheck2, CalendarDays, Ticket, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GuestDashboardTab } from '@/features/guest/types';

interface GuestBottomNavProps {
  activeTab: GuestDashboardTab;
  onTabChange: (tab: GuestDashboardTab) => void;
  className?: string;
}

const BOTTOM_ITEMS: {
  id: GuestDashboardTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: CalendarCheck2 },
  { id: 'upcoming', label: 'Upcoming', icon: CalendarDays },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
  { id: 'profile', label: 'Profile', icon: User },
];

export function GuestBottomNav({ activeTab, onTabChange, className }: GuestBottomNavProps) {
  return (
    <nav
      className={cn(
        'laptop:hidden border-border bg-card/95 supports-[backdrop-filter]:bg-card/85 fixed right-0 bottom-0 left-0 z-40 flex h-16 items-center justify-around border-t px-2 shadow-lg backdrop-blur',
        className,
      )}
      aria-label="Mobile Navigation"
    >
      {BOTTOM_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-1 px-3 py-1 text-[10px] font-medium transition-colors',
              isActive
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-full transition-all',
                isActive && 'bg-primary/10 text-primary scale-110',
              )}
            >
              <Icon className="size-4.5" />
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

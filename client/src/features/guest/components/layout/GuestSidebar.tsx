import { Link } from 'react-router';
import {
  Compass,
  LayoutDashboard,
  CalendarCheck2,
  CalendarDays,
  History,
  Ticket,
  CreditCard,
  MessageSquare,
  User,
  LifeBuoy,
  LogOut,
  Radio,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GuestDashboardTab } from '@/features/guest/types';

interface GuestSidebarProps {
  activeTab: GuestDashboardTab;
  onTabChange: (tab: GuestDashboardTab) => void;
  className?: string;
}

const GUEST_NAV_ITEMS: {
  id: GuestDashboardTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bookings', label: 'My Bookings', icon: CalendarCheck2 },
  { id: 'upcoming', label: 'Upcoming Tours', icon: CalendarDays },
  { id: 'past-tours', label: 'Past Tours', icon: History },
  { id: 'tickets', label: 'Digital Tickets', icon: Ticket },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'support', label: 'Help & Support', icon: LifeBuoy },
];

export function GuestSidebar({ activeTab, onTabChange, className }: GuestSidebarProps) {
  const { user, logout } = useAuth();

  const initials = (user?.fullName || 'Guest')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <aside
      className={cn(
        'border-border bg-card flex h-full w-64 shrink-0 flex-col justify-between border-r select-none',
        className,
      )}
    >
      <div className="flex flex-col gap-6 p-5">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="font-display text-foreground flex items-center gap-2.5 text-lg font-bold tracking-tight transition-opacity hover:opacity-90"
        >
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl shadow-xs">
            <Compass className="size-5" />
          </div>
          <div>
            <span className="block leading-none">LTMS Guest</span>
            <span className="text-muted-foreground text-[10px] font-normal">Traveler Portal</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1" aria-label="Guest Dashboard Navigation">
          {GUEST_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all sm:text-sm',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'size-4 shrink-0',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground',
                  )}
                />
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Live Bus Tracking Highlight */}
        <Link
          to="/dashboard/live-location"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs font-semibold text-emerald-700 shadow-xs transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
        >
          <span className="flex items-center gap-2">
            <Radio className="size-3.5 animate-pulse text-emerald-600" />
            <span>Live Bus Tracking</span>
          </span>
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
        </Link>
      </div>

      {/* Footer User Profile & Logout */}
      <div className="border-border flex flex-col gap-3 border-t p-4">
        <div className="flex items-center gap-3 px-2">
          <Avatar className="border-border size-9 border">
            <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-xs leading-tight font-semibold">
              {user?.fullName || 'Traveler Guest'}
            </p>
            <p className="text-muted-foreground truncate text-[11px]">{user?.email}</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => logout()}
          className="text-muted-foreground hover:text-foreground hover:bg-muted h-8 w-full gap-1.5 text-xs"
        >
          <LogOut className="size-3.5" />
          <span>Log Out</span>
        </Button>
      </div>
    </aside>
  );
}

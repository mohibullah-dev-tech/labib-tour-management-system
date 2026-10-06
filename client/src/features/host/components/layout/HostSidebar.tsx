import {
  LayoutDashboard,
  CalendarCheck2,
  Compass,
  Users,
  Bus,
  Clock,
  Navigation,
  MessageSquare,
  Bell,
  User,
  LifeBuoy,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { HostDashboardTab, HostProfile } from '@/features/host/types';

interface HostSidebarProps {
  activeTab: HostDashboardTab;
  onTabChange: (tab: HostDashboardTab) => void;
  profile?: HostProfile;
  unreadMessagesCount?: number;
  unreadNotificationsCount?: number;
  isLocationSharingActive?: boolean;
  className?: string;
}

interface NavItem {
  id: HostDashboardTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: 'default' | 'destructive' | 'secondary' | 'outline';
}

export function HostSidebar({
  activeTab,
  onTabChange,
  profile,
  unreadMessagesCount = 0,
  unreadNotificationsCount = 0,
  isLocationSharingActive = false,
  className = '',
}: HostSidebarProps) {
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'today', label: "Today's Tour", icon: Compass, badge: 'Active', badgeVariant: 'default' },
    { id: 'events', label: 'My Events', icon: CalendarCheck2 },
    { id: 'guests', label: 'Guest List', icon: Users },
    { id: 'seats', label: 'Bus & Seats', icon: Bus },
    { id: 'timeline', label: 'Tour Timeline', icon: Clock },
    {
      id: 'location',
      label: 'Live Location',
      icon: Navigation,
      badge: isLocationSharingActive ? 'LIVE' : undefined,
      badgeVariant: 'destructive',
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    { id: 'profile', label: 'Guide Profile', icon: User },
    { id: 'support', label: 'Help & Safety', icon: LifeBuoy },
  ];

  return (
    <aside
      className={cn(
        'border-border bg-card flex h-screen w-64 flex-col justify-between border-r select-none',
        className,
      )}
    >
      {/* Brand & Host Identification */}
      <div>
        <div className="border-border/70 flex items-center justify-between border-b p-5">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary text-primary-foreground font-display flex size-9 items-center justify-center rounded-xl font-bold shadow-xs">
              LT
            </div>
            <div>
              <span className="font-display text-foreground block text-sm leading-tight font-black tracking-tight">
                Labib Tours
              </span>
              <span className="text-primary block flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase">
                <Shield className="size-3" />
                <span>Host Portal</span>
              </span>
            </div>
          </div>
        </div>

        {/* Live Event Indicator Mini-card */}
        <div className="bg-primary/5 border-primary/15 mx-3 my-2.5 flex items-center justify-between rounded-xl border p-3">
          <div className="min-w-0 pr-2">
            <span className="text-primary block text-[10px] font-bold tracking-wider uppercase">
              Active Bus
            </span>
            <span className="text-foreground block truncate text-xs font-semibold">
              LABIB-01 • Sajek
            </span>
          </div>
          <Badge
            variant="outline"
            className="h-5 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-medium text-emerald-700 dark:text-emerald-400"
          >
            Boarding
          </Badge>
        </div>

        {/* Navigation Item Links */}
        <nav className="max-h-[calc(100vh-270px)] space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'group flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-primary/20 font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Icon
                    className={cn(
                      'size-4 shrink-0 transition-transform group-hover:scale-110',
                      isActive
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground group-hover:text-primary',
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <Badge
                    variant={item.badgeVariant ?? 'secondary'}
                    className={cn(
                      'h-4.5 px-1.5 text-[10px] font-bold',
                      isActive && 'bg-primary-foreground/20 text-primary-foreground border-none',
                      item.badge === 'LIVE' && 'animate-pulse bg-rose-500 text-white',
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Host User Profile & Sign Out Footer */}
      <div className="border-border/70 bg-card/60 border-t p-3">
        <div className="bg-muted/40 border-border/60 flex items-center justify-between rounded-xl border p-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar className="border-primary/20 size-8.5 shrink-0 border">
              <AvatarImage src={profile?.avatarUrl} alt={profile?.fullName ?? 'Host'} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {profile?.fullName
                  ? profile.fullName
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('')
                  : 'HA'}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <span className="text-foreground block truncate text-xs font-bold">
                {profile?.fullName ?? 'Rahim Ahmed'}
              </span>
              <span className="text-muted-foreground block truncate text-[10px]">
                {profile?.experience ?? 'Lead Guide'}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            className="text-muted-foreground hover:text-destructive size-7"
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut className="size-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

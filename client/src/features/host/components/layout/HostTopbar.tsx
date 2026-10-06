import { Menu, Navigation, LogOut, User, Compass, HelpCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { HostDashboardTab, HostProfile } from '@/features/host/types';
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter';

interface HostTopbarProps {
  activeTab: HostDashboardTab;
  profile?: HostProfile;
  isLocationSharingActive: boolean;
  onOpenMobileMenu: () => void;
  onNavigateTab: (tab: HostDashboardTab) => void;
  tourName?: string;
  busNumber?: string;
}

const TAB_TITLES: Record<HostDashboardTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Dashboard Overview',
    subtitle: 'Live event status, guest metrics, and quick operational controls',
  },
  today: {
    title: "Today's Tour Operation",
    subtitle: 'Real-time passenger roll-call, departure readiness, and departure triggers',
  },
  events: {
    title: 'My Assigned Events',
    subtitle: 'All tours and seasonal departures scheduled under your leadership',
  },
  guests: {
    title: 'Passenger Manifest',
    subtitle: 'Search, filter, inspect details, and perform guest check-ins',
  },
  seats: {
    title: 'Bus Seating Chart',
    subtitle: 'Visual coach layout with check-in status and seat assignment inspector',
  },
  timeline: {
    title: 'Tour Journey Timeline',
    subtitle: 'Highway milestones, checkpoint timings, and itinerary checkpoints',
  },
  location: {
    title: 'Live Location & GPS Sharing',
    subtitle: 'Real-time vehicle telemetry and explicit passenger location broadcast',
  },
  messages: {
    title: 'Field Communication',
    subtitle: 'Direct messaging channels with passengers, operations dispatch, and fleet support',
  },
  notifications: {
    title: 'Operations Alerts',
    subtitle: 'Real-time booking changes, convoy notices, and admin bulletins',
  },
  profile: {
    title: 'Tour Leader Profile',
    subtitle: 'Manage your bio, contact numbers, languages, and field qualifications',
  },
  support: {
    title: 'Field Support & SOS',
    subtitle: 'Emergency contacts, operations escalation, problem reports, and travel FAQs',
  },
};

export function HostTopbar({
  activeTab,
  profile,
  isLocationSharingActive,
  onOpenMobileMenu,
  onNavigateTab,
  tourName = 'Sajek Valley Odyssey',
  busNumber = 'LABIB-01',
}: HostTopbarProps) {
  const { logout } = useAuth();
  const currentTabInfo = TAB_TITLES[activeTab] || { title: 'Host Dashboard', subtitle: '' };

  return (
    <header className="border-border bg-background/95 sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile hamburger + Tab title */}
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="laptop:hidden size-9"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="size-5" />
        </Button>

        <div className="min-w-0">
          <h1 className="font-display text-foreground truncate text-sm font-bold sm:text-base">
            {currentTabInfo.title}
          </h1>
          <p className="text-muted-foreground hidden truncate text-[11px] sm:block">
            {currentTabInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Live Location pill + Active Event Chip + Notification Bell + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Bus & Event Chip (hidden on small phones) */}
        <div className="bg-muted/60 border-border hidden items-center gap-2 rounded-full border px-3 py-1 text-xs md:flex">
          <Compass className="text-primary size-3.5" />
          <span className="text-foreground max-w-[130px] truncate font-semibold">{tourName}</span>
          <span className="text-muted-foreground bg-background border-border rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold">
            {busNumber}
          </span>
        </div>

        {/* Live Location Status Indicator Pill */}
        <button
          type="button"
          onClick={() => onNavigateTab('location')}
          aria-label="View Live Location status"
          className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
            isLocationSharingActive
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400'
              : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
          }`}
        >
          <span className="relative flex size-2">
            {isLocationSharingActive && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex size-2 rounded-full ${
                isLocationSharingActive ? 'bg-rose-500' : 'bg-muted-foreground/60'
              }`}
            />
          </span>
          <Navigation className="size-3" />
          <span className="xs:inline hidden text-[11px]">
            {isLocationSharingActive ? 'GPS Live' : 'GPS Off'}
          </span>
        </button>

        {/* Notifications Bell */}
        <NotificationCenter />

        {/* Host Avatar Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="focus-visible:ring-ring cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              aria-label="Host account menu"
            >
              <Avatar className="border-primary/20 size-8.5 border">
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
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-foreground text-xs font-medium">
                {profile?.fullName ?? 'Rahim Ahmed'}
              </p>
              <p className="text-muted-foreground text-[11px] font-normal">
                {profile?.email ?? 'host@labibtours.com'}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigateTab('profile')}>
              <User className="text-muted-foreground mr-2 size-4" />
              <span>Guide Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigateTab('support')}>
              <HelpCircle className="text-muted-foreground mr-2 size-4" />
              <span>Safety &amp; Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => logout()}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

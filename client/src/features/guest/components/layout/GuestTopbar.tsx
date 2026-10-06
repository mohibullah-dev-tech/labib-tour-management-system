import { Menu, Compass, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import type { GuestDashboardTab } from '@/features/guest/types';
import { NotificationCenter as AppNotificationCenter } from '@/features/notifications/components/NotificationCenter';

interface GuestTopbarProps {
  activeTab: GuestDashboardTab;
  onOpenMobileMenu?: () => void;
}

const TAB_TITLES: Record<GuestDashboardTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Guest Dashboard',
    subtitle: 'Welcome back! View your upcoming tour, departure countdown, and bookings.',
  },
  bookings: {
    title: 'My Tour Bookings',
    subtitle: 'Manage all confirmed, pending, and past holiday packages.',
  },
  upcoming: {
    title: 'Upcoming Tour Details',
    subtitle: 'Everything you need for your next adventure: bus schedule, meeting point, and host.',
  },
  'past-tours': {
    title: 'Past & Completed Tours',
    subtitle: 'Relive your travel memories and share reviews of your trips.',
  },
  tickets: {
    title: 'Digital E-Tickets',
    subtitle: 'Your boarding passes with verified QR code, bus seats, and travel permits.',
  },
  payments: {
    title: 'Payment History & Receipts',
    subtitle: 'Track your payments, due balances, and transaction receipts.',
  },
  reviews: {
    title: 'Tour Reviews & Feedback',
    subtitle: 'Rate your tour hosts, hotels, food, and overall holiday experience.',
  },
  profile: {
    title: 'My Guest Profile',
    subtitle: 'Manage personal details, emergency contacts, and preferred pickup locations.',
  },
  support: {
    title: 'Help & Traveler Support',
    subtitle: 'Connect with your tour host, customer care, and 24/7 SOS emergency team.',
  },
};

export function GuestTopbar({ activeTab, onOpenMobileMenu }: GuestTopbarProps) {
  const currentTabInfo = TAB_TITLES[activeTab] || {
    title: 'Guest Dashboard',
    subtitle: 'Manage your tour itineraries and tickets.',
  };

  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            className="laptop:hidden size-9"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </Button>
        )}

        <div>
          <h1 className="font-display text-foreground text-base leading-tight font-bold sm:text-lg">
            {currentTabInfo.title}
          </h1>
          <p className="text-muted-foreground hidden max-w-md truncate text-xs sm:block">
            {currentTabInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Browse Tours Shortcut */}
        <Button asChild variant="outline" size="sm" className="hidden h-8 gap-1.5 text-xs sm:flex">
          <Link to="/tours">
            <Compass className="text-primary size-3.5" />
            <span>Browse Tours</span>
            <ExternalLink className="text-muted-foreground ml-0.5 size-3" />
          </Link>
        </Button>

        {/* Notification Bell */}
        <AppNotificationCenter />
      </div>
    </header>
  );
}

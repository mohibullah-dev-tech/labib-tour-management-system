import { useState, type ReactNode } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { HostSidebar } from './HostSidebar';
import { HostTopbar } from './HostTopbar';
import { HostBottomNav } from './HostBottomNav';
import type { HostDashboardTab, HostProfile, HostNotification } from '@/features/host/types';

interface HostLayoutProps {
  activeTab: HostDashboardTab;
  onTabChange: (tab: HostDashboardTab) => void;
  profile?: HostProfile;
  notifications: HostNotification[];
  unreadMessagesCount?: number;
  isLocationSharingActive: boolean;
  onOpenNotifications: () => void;
  tourName?: string;
  busNumber?: string;
  children: ReactNode;
}

export function HostLayout({
  activeTab,
  onTabChange,
  profile,
  notifications,
  unreadMessagesCount = 0,
  isLocationSharingActive,
  onOpenNotifications,
  tourName,
  busNumber,
  children,
}: HostLayoutProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleMobileTabSelect = (tab: HostDashboardTab) => {
    onTabChange(tab);
    setMobileDrawerOpen(false);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="bg-muted/20 flex min-h-dvh">
      {/* Desktop Persistent Sidebar */}
      <HostSidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        profile={profile}
        unreadMessagesCount={unreadMessagesCount}
        unreadNotificationsCount={unreadNotificationsCount}
        isLocationSharingActive={isLocationSharingActive}
        className="laptop:flex fixed top-0 bottom-0 left-0 z-30 hidden"
      />

      {/* Mobile Slide-in Drawer */}
      <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <DrawerContent className="max-h-[88vh] p-0">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Host Navigation Menu</DrawerTitle>
          </DrawerHeader>
          <div className="p-3">
            <HostSidebar
              activeTab={activeTab}
              onTabChange={handleMobileTabSelect}
              profile={profile}
              unreadMessagesCount={unreadMessagesCount}
              unreadNotificationsCount={unreadNotificationsCount}
              isLocationSharingActive={isLocationSharingActive}
              className="h-auto max-h-[80vh] w-full border-none"
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Main Content Workspace */}
      <div className="laptop:pl-64 flex min-w-0 flex-1 flex-col">
        <HostTopbar
          activeTab={activeTab}
          profile={profile}
          notifications={notifications}
          isLocationSharingActive={isLocationSharingActive}
          onOpenNotifications={onOpenNotifications}
          onOpenMobileMenu={() => setMobileDrawerOpen(true)}
          onNavigateTab={onTabChange}
          tourName={tourName}
          busNumber={busNumber}
        />

        <main className="laptop:pb-12 mx-auto w-full max-w-7xl flex-1 p-4 pb-24 sm:p-6">
          {children}
        </main>

        <HostBottomNav
          activeTab={activeTab}
          onTabChange={onTabChange}
          onOpenMoreMenu={() => setMobileDrawerOpen(true)}
        />
      </div>
    </div>
  );
}

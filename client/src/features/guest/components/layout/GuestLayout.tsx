import { useState, type ReactNode } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { GuestSidebar } from '@/features/guest/components/layout/GuestSidebar';
import { GuestTopbar } from '@/features/guest/components/layout/GuestTopbar';
import { GuestBottomNav } from '@/features/guest/components/layout/GuestBottomNav';
import type { GuestDashboardTab } from '@/features/guest/types';

interface GuestLayoutProps {
  activeTab: GuestDashboardTab;
  onTabChange: (tab: GuestDashboardTab) => void;
  children: ReactNode;
}

export function GuestLayout({ activeTab, onTabChange, children }: GuestLayoutProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleMobileTabSelect = (tab: GuestDashboardTab) => {
    onTabChange(tab);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="bg-muted/20 flex min-h-dvh">
      {/* Desktop Persistent Sidebar */}
      <GuestSidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        className="laptop:flex fixed top-0 bottom-0 left-0 z-30 hidden"
      />

      {/* Mobile Slide-in Navigation Drawer */}
      <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <DrawerContent className="max-h-[85vh] p-0">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Guest Portal Menu</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <GuestSidebar
              activeTab={activeTab}
              onTabChange={handleMobileTabSelect}
              className="w-full border-none"
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Main Workspace Viewport */}
      <div className="laptop:pl-64 flex min-w-0 flex-1 flex-col">
        <GuestTopbar activeTab={activeTab} onOpenMobileMenu={() => setMobileDrawerOpen(true)} />

        {/* Scrollable Page Content (padding bottom on mobile for BottomNav) */}
        <main className="laptop:pb-12 mx-auto w-full max-w-7xl flex-1 p-4 pb-24 sm:p-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <GuestBottomNav activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  );
}

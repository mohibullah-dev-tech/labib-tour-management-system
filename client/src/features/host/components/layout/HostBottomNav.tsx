import { LayoutDashboard, Compass, Users, Bus, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HostDashboardTab } from '@/features/host/types';

interface HostBottomNavProps {
  activeTab: HostDashboardTab;
  onTabChange: (tab: HostDashboardTab) => void;
  onOpenMoreMenu: () => void;
}

export function HostBottomNav({ activeTab, onTabChange, onOpenMoreMenu }: HostBottomNavProps) {
  const primaryTabs: {
    id: HostDashboardTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'today', label: 'Today', icon: Compass },
    { id: 'guests', label: 'Guests', icon: Users },
    { id: 'seats', label: 'Seats', icon: Bus },
  ];

  const isMoreActive = !primaryTabs.some((t) => t.id === activeTab);

  return (
    <nav
      aria-label="Mobile Host Navigation"
      className="laptop:hidden border-border bg-background/95 safe-area-pb fixed right-0 bottom-0 left-0 z-30 flex h-16 items-center justify-around border-t px-2 shadow-lg backdrop-blur-md"
    >
      {primaryTabs.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={cn(
              'flex flex-1 cursor-pointer flex-col items-center justify-center py-1 transition-colors select-none',
              isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center rounded-xl p-1 transition-all',
                isActive && 'bg-primary/10 scale-105',
              )}
            >
              <Icon className="size-5" />
            </div>
            <span className="mt-0.5 text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}

      {/* 5th slot: "More Menu" drawer trigger */}
      <button
        type="button"
        onClick={onOpenMoreMenu}
        className={cn(
          'flex flex-1 cursor-pointer flex-col items-center justify-center py-1 transition-colors select-none',
          isMoreActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center rounded-xl p-1 transition-all',
            isMoreActive && 'bg-primary/10 scale-105',
          )}
        >
          <Menu className="size-5" />
        </div>
        <span className="mt-0.5 text-[10px] tracking-tight">More</span>
      </button>
    </nav>
  );
}

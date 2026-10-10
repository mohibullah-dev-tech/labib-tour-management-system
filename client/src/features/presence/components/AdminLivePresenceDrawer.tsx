import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Users,
  Search,
  RefreshCw,
  Compass,
  Shield,
  User,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  MessageSquare,
  Clock,
  Eye,
} from 'lucide-react';
import { useAdminPresence } from '../hooks/useAdminPresence';
import type { ActiveUserPresence } from '../types/presence.types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: typeof User }> = {
  admin: {
    label: 'Admin',
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    icon: Shield,
  },
  super_admin: {
    label: 'Super Admin',
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    icon: Shield,
  },
  host: {
    label: 'Tour Host',
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    icon: Compass,
  },
  guest: {
    label: 'Guest Traveler',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: User,
  },
  visitor: {
    label: 'Website Visitor',
    color: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    icon: Globe,
  },
};

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
};

function formatElapsed(dateStr: string): string {
  const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}

interface AdminLivePresenceDrawerProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AdminLivePresenceDrawer({
  trigger,
  open,
  onOpenChange,
}: AdminLivePresenceDrawerProps) {
  const navigate = useNavigate();
  const {
    users,
    totalCount,
    summary,
    isLoading,
    roleFilter,
    setRoleFilter,
    searchQuery,
    setSearchQuery,
    refetch,
  } = useAdminPresence();

  const [isOpen, setIsOpen] = useState(false);
  const actualOpen = open !== undefined ? open : isOpen;
  const setActualOpen = onOpenChange || setIsOpen;

  const handleOpenChat = (_user: ActiveUserPresence) => {
    setActualOpen(false);
    navigate('/admin/messages');
  };

  return (
    <Sheet open={actualOpen} onOpenChange={setActualOpen}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-xl">
        {/* Drawer Header */}
        <div className="border-border border-b p-6 pb-4">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
                </span>
                <SheetTitle className="text-xl font-bold">Live Active Users</SheetTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                className="size-8 rounded-full"
                title="Refresh"
              >
                <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <SheetDescription>
              Real-time monitor showing all currently connected travelers, tour guides, and
              visitors.
            </SheetDescription>
          </SheetHeader>

          {/* Quick Metrics Bar */}
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="border-border bg-muted/40 rounded-xl border p-2">
              <p className="text-muted-foreground">Total</p>
              <p className="text-foreground text-base font-bold">{summary.totalOnline}</p>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-2">
              <p className="text-blue-500">Guests</p>
              <p className="text-foreground text-base font-bold">{summary.guestsCount}</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2">
              <p className="text-amber-500">Hosts</p>
              <p className="text-foreground text-base font-bold">{summary.hostsCount}</p>
            </div>
            <div className="rounded-xl border border-slate-500/20 bg-slate-500/5 p-2">
              <p className="text-slate-500">Visitors</p>
              <p className="text-foreground text-base font-bold">{summary.visitorsCount}</p>
            </div>
          </div>

          {/* Search & Role Filter */}
          <div className="mt-4 space-y-3">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search by name, email, or page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 text-xs"
              />
            </div>
            <Tabs value={roleFilter} onValueChange={setRoleFilter} className="w-full">
              <TabsList className="grid h-8 w-full grid-cols-5 p-0.5">
                <TabsTrigger value="all" className="px-1 text-[11px]">
                  All ({totalCount})
                </TabsTrigger>
                <TabsTrigger value="guest" className="px-1 text-[11px]">
                  Guests
                </TabsTrigger>
                <TabsTrigger value="host" className="px-1 text-[11px]">
                  Hosts
                </TabsTrigger>
                <TabsTrigger value="admin" className="px-1 text-[11px]">
                  Admins
                </TabsTrigger>
                <TabsTrigger value="visitor" className="px-1 text-[11px]">
                  Visitors
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* User Roster List */}
        <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
          {users.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center p-12 text-center">
              <Users className="text-muted-foreground/50 mb-2 size-10 stroke-[1.5]" />
              <p className="text-sm font-medium">No connected users matching filter</p>
              <p className="text-muted-foreground text-xs">
                Active travelers will appear here immediately when they browse or sign in.
              </p>
            </div>
          ) : (
            users.map((user) => {
              const roleCfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.visitor;
              const RoleIcon = roleCfg.icon;
              const DeviceIcon = DEVICE_ICONS[user.device || 'Desktop'] || Monitor;

              return (
                <div
                  key={user.socketId}
                  className="group border-border bg-card hover:border-border/80 hover:bg-muted/20 relative flex flex-col gap-2 rounded-xl border p-3.5 shadow-sm transition"
                >
                  {/* Top line: Avatar, Name, Role, Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                            {user.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="border-background absolute right-0 bottom-0 size-2.5 rounded-full border-2 bg-emerald-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-foreground text-sm leading-none font-semibold">
                            {user.name}
                          </p>
                          <Badge
                            variant="outline"
                            className={`px-1.5 py-0 text-[10px] ${roleCfg.color}`}
                          >
                            <RoleIcon className="mr-1 size-3" />
                            {roleCfg.label}
                          </Badge>
                        </div>
                        {user.email && (
                          <p className="text-muted-foreground mt-0.5 text-[11px]">{user.email}</p>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenChat(user)}
                      className="h-7 gap-1 px-2.5 text-xs"
                    >
                      <MessageSquare className="size-3.5" />
                      Chat
                    </Button>
                  </div>

                  {/* Activity Info: Page & Device */}
                  <div className="text-muted-foreground border-border/50 mt-1 flex flex-wrap items-center justify-between gap-y-1 border-t pt-2 text-[11px]">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Eye className="text-muted-foreground size-3" />
                      <span className="bg-muted text-foreground rounded px-1.5 py-0.5 font-medium">
                        {user.currentPath || '/'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <DeviceIcon className="size-3" />
                        <span>{user.device || 'Desktop'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="size-3" />
                        <span>Active {formatElapsed(user.lastActiveAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

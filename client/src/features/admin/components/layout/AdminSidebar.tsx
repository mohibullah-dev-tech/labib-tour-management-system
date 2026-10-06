import { NavLink } from 'react-router';
import { Compass } from 'lucide-react';
import { ADMIN_NAV_GROUPS } from '@/features/admin/config/admin-navigation';
import { cn } from '@/lib/utils';
import { useConversations } from '@/features/messaging/hooks/useMessaging';
import { Badge } from '@/components/ui/badge';

export interface AdminSidebarProps {
  /** Called after a nav click so a parent Sheet (mobile) can close itself. Undefined on the permanent desktop sidebar. */
  onNavigate?: () => void;
}

/**
 * Rendered twice: permanently visible on laptop+ (see AdminLayout), and
 * inside a Sheet on mobile/tablet — identical content either way, same
 * pattern as the public site's Navbar/MobileNav split.
 */
function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const { data: conversations = [] } = useConversations('admin');
  const unreadMessages = conversations.reduce((count, item) => count + item.unreadCount, 0);
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto">
      <div className="border-border font-display text-foreground flex h-16 shrink-0 items-center gap-2 border-b px-4 text-lg font-semibold">
        <Compass className="text-primary size-6" aria-hidden="true" />
        LTMS Admin
      </div>

      <nav aria-label="Admin" className="flex flex-col gap-6 px-3 pb-6">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <p className="text-muted-foreground px-3 text-xs font-semibold tracking-wide uppercase">
              {group.label}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    'text-foreground/80 hover:bg-muted hover:text-foreground',
                    isActive && 'bg-primary-50 text-primary dark:bg-primary-950',
                  )
                }
              >
                <item.icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
                {item.path === '/admin/messages' && unreadMessages > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-auto h-5 min-w-5 justify-center px-1 text-[10px]"
                  >
                    {unreadMessages}
                  </Badge>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}

export { AdminSidebar };

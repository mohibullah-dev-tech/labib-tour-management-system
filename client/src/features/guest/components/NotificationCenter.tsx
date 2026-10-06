import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationItem } from '@/features/guest/components/NotificationItem';
import type { GuestNotification } from '@/features/guest/types';

interface NotificationCenterProps {
  notifications: GuestNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBooking?: (bookingId: string) => void;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  open,
  onOpenChange,
  onSelectBooking,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <DialogHeader className="border-border bg-card border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                <Bell className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">Notifications</DialogTitle>
                <DialogDescription className="text-xs">
                  {unreadCount > 0 ? `${unreadCount} unread update(s)` : 'You are all caught up'}
                </DialogDescription>
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary-600 h-8 gap-1.5 text-xs"
                onClick={onMarkAllAsRead}
              >
                <CheckCheck className="size-3.5" />
                <span>Mark all read</span>
              </Button>
            )}
          </div>

          {/* Filter Pill Switcher */}
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-7 rounded-full px-2.5 text-xs"
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              className="h-7 gap-1.5 rounded-full px-2.5 text-xs"
              onClick={() => setFilter('unread')}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-primary-100 text-primary-900 px-1 py-0 text-[10px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Notification List */}
        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto p-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              <Bell className="text-muted-foreground/40 mx-auto mb-2 size-8" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-muted-foreground/70 text-xs">
                {filter === 'unread'
                  ? 'All notifications have been marked as read.'
                  : 'Important trip updates and booking alerts will show up here.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onMarkAsRead={onMarkAsRead}
                onClick={(item) => {
                  if (!item.isRead) onMarkAsRead(item.id);
                  if (item.bookingId && onSelectBooking) {
                    onOpenChange(false);
                    onSelectBooking(item.bookingId);
                  }
                }}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

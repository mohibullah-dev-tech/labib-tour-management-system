import { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Check,
  AlertTriangle,
  Radio,
  Calendar,
  UserPlus,
  UserMinus,
  MessageSquare,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { HostNotification, HostNotificationType } from '@/features/host/types';

interface HostNotificationsViewProps {
  notifications: HostNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function HostNotificationsView({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: HostNotificationsViewProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getNotificationIcon = (type: HostNotificationType) => {
    switch (type) {
      case 'guest_booking':
        return <UserPlus className="size-4 text-emerald-600" />;
      case 'booking_cancellation':
        return <UserMinus className="size-4 text-rose-600" />;
      case 'schedule_change':
        return <Calendar className="size-4 text-amber-600" />;
      case 'admin_announcement':
        return <AlertTriangle className="size-4 text-indigo-600" />;
      case 'guest_message':
        return <MessageSquare className="text-primary size-4" />;
      case 'location_reminder':
        return <Radio className="size-4 animate-pulse text-rose-600" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-display text-foreground text-lg font-bold sm:text-xl">
            Host Notifications &amp; Operational Bulletins
          </h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Real-time itinerary updates, guest booking shifts, and dispatch reminders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={onMarkAllAsRead}
            >
              <CheckCheck className="text-primary size-3.5" />
              <span>Mark all read</span>
            </Button>
          )}

          <div className="bg-muted flex items-center gap-1 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-card text-foreground font-bold shadow-2xs'
                  : 'text-muted-foreground'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-card text-foreground font-bold shadow-2xs'
                  : 'text-muted-foreground'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex flex-col gap-2.5">
        {filteredNotifications.length === 0 ? (
          <Card className="text-muted-foreground border-dashed p-12 text-center text-xs">
            <Bell className="text-muted-foreground/30 mx-auto mb-2 size-10" />
            <p className="text-foreground text-sm font-semibold">No notifications</p>
            <p className="mt-1 text-xs">
              {filter === 'unread'
                ? 'All operational bulletins have been marked as read.'
                : 'No alerts recorded.'}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => !n.isRead && onMarkAsRead(n.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!n.isRead) onMarkAsRead(n.id);
                }
              }}
              className={`flex cursor-pointer items-start justify-between gap-3 rounded-2xl border p-4 transition-all ${
                !n.isRead
                  ? 'bg-card border-primary/25 ring-primary/10 shadow-xs ring-1'
                  : 'bg-card/70 border-border opacity-90'
              }`}
            >
              <div className="flex min-w-0 items-start gap-3.5">
                <div className="bg-background border-border mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-xs leading-tight sm:text-sm ${!n.isRead ? 'text-foreground font-bold' : 'text-foreground/85 font-semibold'}`}
                    >
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <span
                        className="bg-primary size-2 shrink-0 rounded-full"
                        aria-label="Unread indicator"
                      />
                    )}
                  </div>

                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{n.message}</p>

                  <span className="text-muted-foreground/80 mt-2 block text-[10px]">
                    {new Date(n.timestamp).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-muted-foreground hover:text-primary size-7 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(n.id);
                  }}
                  title="Mark read"
                >
                  <Check className="size-3.5" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

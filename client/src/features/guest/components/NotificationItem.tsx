import {
  CheckCircle2,
  CreditCard,
  Armchair,
  Bell,
  UserCheck,
  Calendar,
  XCircle,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GuestNotification } from '@/features/guest/types';

interface NotificationItemProps {
  notification: GuestNotification;
  onMarkAsRead?: (id: string) => void;
  onClick?: (notification: GuestNotification) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onClick }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'booking_confirmed':
        return <CheckCircle2 className="size-4 text-emerald-500" />;
      case 'payment_received':
        return <CreditCard className="size-4 text-blue-500" />;
      case 'seat_confirmed':
        return <Armchair className="size-4 text-indigo-500" />;
      case 'tour_reminder':
        return <Bell className="size-4 text-amber-500" />;
      case 'host_assigned':
        return <UserCheck className="size-4 text-emerald-500" />;
      case 'schedule_changed':
        return <Calendar className="size-4 text-amber-500" />;
      case 'booking_cancelled':
        return <XCircle className="size-4 text-rose-500" />;
      default:
        return <Bell className="text-primary size-4" />;
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(notification)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(notification);
        }
      }}
      className={`group hover:bg-muted/50 relative flex cursor-pointer items-start gap-3 rounded-xl border border-transparent p-3.5 transition-colors ${
        !notification.isRead ? 'bg-primary/5 border-primary/15' : 'bg-card'
      }`}
    >
      <div className="bg-background border-border mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border shadow-2xs">
        {getIcon()}
      </div>

      <div className="min-w-0 flex-1 pr-6">
        <div className="flex items-center gap-2">
          <h4
            className={`truncate text-xs leading-tight sm:text-sm ${
              !notification.isRead
                ? 'text-foreground font-semibold'
                : 'text-foreground/80 font-medium'
            }`}
          >
            {notification.title}
          </h4>
          {!notification.isRead && (
            <span
              className="bg-primary size-2 shrink-0 rounded-full"
              aria-label="Unread notification"
            />
          )}
        </div>
        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
          {notification.message}
        </p>
        <span className="text-muted-foreground/80 mt-1.5 block text-[10px]">
          {timeAgo(notification.timestamp)}
        </span>
      </div>

      {!notification.isRead && onMarkAsRead && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 size-7 opacity-70 group-hover:opacity-100"
          title="Mark as read"
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead(notification.id);
          }}
        >
          <Check className="size-3.5" />
          <span className="sr-only">Mark as read</span>
        </Button>
      )}
    </div>
  );
}

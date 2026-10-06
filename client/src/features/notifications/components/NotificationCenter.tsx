import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Role } from '@/features/auth/types/role';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  MapPin,
  MessageCircle,
  Megaphone,
  TicketCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useDismissNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '../hooks/useNotifications';
import type { AppNotification, NotificationFilter } from '../types';

const filters: { id: NotificationFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'booking', label: 'Booking' },
  { id: 'tour', label: 'Tour' },
  { id: 'message', label: 'Message' },
  { id: 'system', label: 'System' },
];

function NotificationList({
  onClose,
  data,
  isLoading,
  isError,
  refetch,
  userId,
}: {
  onClose: () => void;
  data: AppNotification[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => unknown;
  userId: string;
}) {
  const navigate = useNavigate();
  const markRead = useMarkNotificationRead(userId);
  const markAll = useMarkAllNotificationsRead(userId);
  const dismiss = useDismissNotification(userId);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const unread = data.filter((item) => !item.isRead).length;
  const filtered = useMemo(
    () =>
      data.filter(
        (item) =>
          filter === 'all' ||
          (filter === 'unread'
            ? !item.isRead
            : item.type === filter ||
              (filter === 'tour' && ['reminder', 'location', 'announcement'].includes(item.type)) ||
              (filter === 'system' && ['system', 'payment'].includes(item.type))),
      ),
    [data, filter],
  );
  const openItem = (item: AppNotification) => {
    if (!item.isRead) markRead.mutate(item.id);
    onClose();
    if (item.actionUrl) navigate(item.actionUrl);
  };
  const iconFor = (item: AppNotification) => {
    if (item.type === 'message') return <MessageCircle className="text-primary size-4" />;
    if (item.type === 'payment') return <CreditCard className="size-4 text-emerald-600" />;
    if (item.type === 'location') return <MapPin className="size-4 text-rose-500" />;
    if (item.type === 'announcement') return <Megaphone className="size-4 text-amber-600" />;
    if (item.type === 'booking') return <TicketCheck className="size-4 text-sky-600" />;
    return <Bell className="text-muted-foreground size-4" />;
  };
  const content = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <div>
          <p className="font-semibold">Notification center</p>
          <p className="text-muted-foreground text-xs">
            {unread ? `${unread} unread` : "You're all caught up"}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAll.mutate(undefined)}>
            <CheckCheck className="mr-1 size-4" />
            Mark all read
          </Button>
        )}
      </div>
      <div
        className="border-border flex gap-1.5 overflow-x-auto border-b p-3"
        aria-label="Filter notifications"
      >
        {filters.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={filter === item.id ? 'default' : 'outline'}
            className="h-7 shrink-0 rounded-full px-3 text-xs"
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {isLoading && (
          <>
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-muted h-20 animate-pulse rounded-xl" />
            ))}
          </>
        )}
        {isError && (
          <div className="text-center text-sm">
            <p>Unable to load notifications.</p>
            <Button variant="link" onClick={() => void refetch()}>
              Please try again
            </Button>
          </div>
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-muted-foreground py-12 text-center">
            <Bell className="mx-auto mb-2 size-8 opacity-40" />
            <p className="text-sm font-medium">You're all caught up</p>
            <p className="text-xs">New trip updates will appear here.</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {filtered.map((item) => (
            <motion.article
              key={item.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className={`group relative rounded-xl border p-3 ${item.isRead ? 'border-border bg-card' : 'border-primary/20 bg-primary/5'}`}
            >
              <button
                type="button"
                onClick={() => openItem(item)}
                className="focus-visible:ring-ring flex w-full items-start gap-3 rounded-md pr-8 text-left focus-visible:ring-2 focus-visible:outline-none"
              >
                <span className="bg-background flex size-9 shrink-0 items-center justify-center rounded-lg border">
                  {iconFor(item)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {item.title}
                    {!item.isRead && (
                      <span className="bg-primary size-2 rounded-full" aria-label="Unread" />
                    )}
                  </span>
                  <span className="text-muted-foreground mt-0.5 line-clamp-2 block text-xs">
                    {item.message}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-[10px]">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </span>
              </button>
              <div className="absolute top-2 right-2 flex">
                {!item.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label="Mark as read"
                    onClick={() => markRead.mutate(item.id)}
                  >
                    <Check className="size-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-70"
                  aria-label="Dismiss notification"
                  onClick={() => dismiss.mutate(item.id)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
  return content;
}

function NotificationCenter() {
  const { user } = useAuth();
  const userId =
    user?.role === Role.Host
      ? 'u-host-1'
      : user?.role === Role.Admin || user?.role === Role.SuperAdmin
        ? 'u-admin-1'
        : 'gst-1';
  const { data = [], isLoading, isError, refetch } = useNotifications(userId);
  const { data: mobileUnread = 0 } = useUnreadNotificationCount(userId);
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  );
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setMobile(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const trigger = (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={`Notifications${mobileUnread ? `, ${mobileUnread} unread` : ''}`}
    >
      <Bell className="size-4.5" />
      {mobileUnread > 0 && (
        <Badge className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px]">
          {mobileUnread}
        </Badge>
      )}
    </Button>
  );
  const list = (
    <NotificationList
      onClose={() => setOpen(false)}
      data={data}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      userId={userId}
    />
  );
  if (mobile)
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open notifications"
          onClick={() => setOpen(true)}
          className="relative"
        >
          <Bell className="size-4.5" />
          {mobileUnread > 0 && (
            <Badge className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full p-0 text-[10px]">
              {mobileUnread}
            </Badge>
          )}
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
            <SheetHeader className="sr-only">
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>Your recent booking and tour updates</SheetDescription>
            </SheetHeader>
            {list}
          </SheetContent>
        </Sheet>
      </>
    );
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="h-[min(640px,80vh)] w-[min(420px,calc(100vw-2rem))] overflow-hidden p-0"
      >
        {list}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { NotificationCenter };

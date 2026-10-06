import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCheck,
  CircleAlert,
  FilePlus2,
  Megaphone,
  MessageCircle,
  MoreVertical,
  Search,
  Send,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter';
import { MOCK_MESSAGE_EVENTS } from '../data/mock-messaging';
import {
  useConversation,
  useConversations,
  useEventAnnouncements,
  useMarkConversationRead,
  useSendAnnouncement,
  useSendMessage,
} from '../hooks/useMessaging';
import type { Conversation, EventAnnouncement, MessageRole } from '../types';

const roleTitles: Record<MessageRole, string> = {
  guest: 'My messages',
  host: 'Field communications',
  admin: 'Messages inbox',
};
const fallbackIdentity: Record<MessageRole, { id: string; name: string }> = {
  guest: { id: 'gst-1', name: 'Farhana Akter' },
  host: { id: 'u-host-1', name: 'Rahim Ahmed' },
  admin: { id: 'u-admin-1', name: 'Central Operations' },
};
const stamp = (value: string) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function AnnouncementComposer({
  role,
  eventId,
  onSent,
}: {
  role: 'host' | 'admin';
  eventId?: string;
  onSent: (item: EventAnnouncement) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(eventId ?? MOCK_MESSAGE_EVENTS[0]?.id ?? '');
  const send = useSendAnnouncement();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !message.trim() || !selectedEvent) return;
    const selected = MOCK_MESSAGE_EVENTS.find((item) => item.id === selectedEvent);
    send.mutate(
      {
        eventId: selectedEvent,
        title: title.trim(),
        message: message.trim(),
        senderName: role === 'host' ? 'Rahim Ahmed' : 'Central Operations',
        recipients: `All guests of ${selected?.destination ?? 'this event'}`,
      },
      {
        onSuccess: (item) => {
          toast.success('Announcement sent to event guests');
          onSent(item);
          setTitle('');
          setMessage('');
          setOpen(false);
        },
        onError: () => toast.error("Announcement couldn't be sent. Please try again."),
      },
    );
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FilePlus2 className="size-4" />
          <span className="hidden sm:inline">Announcement</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Send event announcement</DialogTitle>
            <DialogDescription>
              Guests booked on the selected event will receive an in-app update.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 text-sm">
            <label htmlFor="announcement-event">Event</label>
            <select
              id="announcement-event"
              className="border-input bg-background h-10 w-full rounded-md border px-3"
              value={selectedEvent}
              onChange={(event) => setSelectedEvent(event.target.value)}
            >
              {MOCK_MESSAGE_EVENTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.destination} · {item.guestCount} guests
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 text-sm">
            <label htmlFor="announcement-title">Title</label>
            <Input
              id="announcement-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              required
              placeholder="Bus departure update"
            />
          </div>
          <div className="space-y-1.5 text-sm">
            <label htmlFor="announcement-message">Message</label>
            <Textarea
              id="announcement-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={1000}
              required
              placeholder="Write a clear update for the guests..."
            />
          </div>
          <p className="text-muted-foreground text-xs">
            Recipients: all guests assigned to this event
          </p>
          <DialogFooter>
            <Button type="submit" disabled={send.isPending || !title.trim() || !message.trim()}>
              {send.isPending ? 'Sending…' : 'Send announcement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AnnouncementFeed({ eventId, role }: { eventId?: string; role: MessageRole }) {
  const { data = [], isLoading, isError, refetch } = useEventAnnouncements(eventId);
  const mayAnnounce = role === 'host' || role === 'admin';
  const scoped = useMemo(
    () => data.filter((item) => !eventId || item.eventId === eventId),
    [data, eventId],
  );
  return (
    <section className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold">Event announcements</h2>
          <p className="text-muted-foreground text-sm">Updates shared with guests on a tour.</p>
        </div>
        {mayAnnounce && (
          <AnnouncementComposer role={role} eventId={eventId} onSent={() => undefined} />
        )}
      </div>
      {isLoading && <Skeleton className="h-24 w-full" />}
      {isError && (
        <div className="rounded-xl border p-6 text-center text-sm">
          Unable to load announcements.{' '}
          <Button variant="link" onClick={() => void refetch()}>
            Please try again
          </Button>
        </div>
      )}
      {!isLoading && !isError && scoped.length === 0 && (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <MessageCircle className="text-muted-foreground mx-auto mb-2 size-8" />
          <p className="font-medium">No announcements yet</p>
          <p className="text-muted-foreground text-sm">Event updates will appear here.</p>
        </div>
      )}
      {scoped.map((item) => (
        <article key={item.id} className="bg-card rounded-2xl border p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge variant="secondary">{item.recipients}</Badge>
              <h3 className="mt-3 font-semibold">{item.title}</h3>
            </div>
            <span className="text-muted-foreground text-xs">{stamp(item.createdAt)}</span>
          </div>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.message}</p>
          <p className="text-muted-foreground mt-4 text-xs">By {item.senderName}</p>
        </article>
      ))}
    </section>
  );
}

export function MessagingPage({ currentRole: role }: { currentRole: MessageRole }) {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [typing, setTyping] = useState(false);
  const { data: conversations = [], isLoading, isError, refetch } = useConversations(role);
  const active = useMemo(
    () => conversations.find((item) => item.id === conversationId) ?? null,
    [conversations, conversationId],
  );
  const detail = useConversation(active?.id ?? '');
  const viewed = detail.data ?? active;
  const send = useSendMessage();
  const { mutate: markConversationRead } = useMarkConversationRead();
  const identity = fallbackIdentity[role];
  const senderId = user?.id ?? identity.id;
  const senderName = user?.fullName ?? identity.name;
  const unreadTotal = conversations.reduce((sum, item) => sum + item.unreadCount, 0);
  const filtered = conversations.filter((item) => {
    const other =
      item.participants.find((person) => person.id !== senderId) ??
      item.participants.find((person) => person.role !== role);
    return `${other?.name ?? ''} ${item.eventName ?? ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  useEffect(() => {
    if (!conversationId && conversations[0])
      navigate(
        role === 'guest'
          ? `/dashboard/messages/${conversations[0].id}`
          : role === 'host'
            ? `/host/messages/${conversations[0].id}`
            : `/admin/messages/${conversations[0].id}`,
        { replace: true },
      );
    if (conversationId && active?.unreadCount) markConversationRead(conversationId);
  }, [active?.unreadCount, conversationId, conversations, markConversationRead, navigate, role]);

  const goConversation = (id: string) =>
    navigate(
      role === 'guest'
        ? `/dashboard/messages/${id}`
        : role === 'host'
          ? `/host/messages/${id}`
          : `/admin/messages/${id}`,
    );
  const onSend = (event: FormEvent) => {
    event.preventDefault();
    if (!viewed || !draft.trim() || send.isPending) return;
    send.mutate(
      { conversationId: viewed.id, content: draft.trim(), senderId, senderName, senderRole: role },
      {
        onSuccess: () => {
          setDraft('');
          toast.success('Message sent');
        },
        onError: () => toast.error("Message couldn't be sent. Please try again."),
      },
    );
  };
  const composerKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };
  const setDemoTyping = (value: string) => {
    setDraft(value);
    if (value.trim()) {
      setTyping(true);
      window.setTimeout(() => setTyping(false), 1300);
    } else setTyping(false);
  };
  const showListOnMobile = !conversationId;

  if (showAnnouncements)
    return (
      <div className="bg-muted/20 min-h-dvh">
        <header className="border-border bg-background sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4 sm:px-6">
          <Button variant="ghost" size="sm" onClick={() => setShowAnnouncements(false)}>
            <ArrowLeft className="mr-2 size-4" />
            Messages
          </Button>
          <div className="flex items-center gap-2">
            <NotificationCenter />
          </div>
        </header>
        <AnnouncementFeed eventId={viewed?.eventId} role={role} />
      </div>
    );

  return (
    <main className="bg-muted/20 flex h-dvh min-h-[520px] flex-col overflow-hidden">
      <header className="border-border bg-background flex h-16 shrink-0 items-center justify-between border-b px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={role === 'guest' ? '/dashboard' : role === 'host' ? '/host' : '/admin'}
            className="text-muted-foreground hover:text-foreground hidden sm:inline-flex"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-display truncate font-bold">{roleTitles[role]}</h1>
            <p className="text-muted-foreground hidden text-xs sm:block">
              Tour-scoped conversations and service updates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground hidden text-xs sm:block">
            {unreadTotal} unread
          </span>
          {role !== 'guest' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Event announcements"
                onClick={() => setShowAnnouncements(true)}
              >
                <Megaphone className="size-4" />
              </Button>
              <AnnouncementComposer
                role={role}
                eventId={viewed?.eventId}
                onSent={() => toast.success('Announcement posted')}
              />
            </>
          )}
          <NotificationCenter />
        </div>
      </header>
      <div className="bg-background mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 overflow-hidden border-x shadow-sm">
        <aside
          className={`${showListOnMobile ? 'flex' : 'hidden'} w-full shrink-0 flex-col border-r md:flex md:w-[330px] lg:w-[370px]`}
        >
          <div className="border-border border-b p-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversations"
                aria-label="Search conversations"
                className="pl-9"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading && (
              <div className="space-y-3 p-4">
                {[1, 2, 3, 4].map((item) => (
                  <Skeleton key={item} className="h-16 w-full" />
                ))}
              </div>
            )}
            {isError && (
              <div className="p-6 text-center text-sm">
                <p>Unable to load messages.</p>
                <Button variant="link" onClick={() => void refetch()}>
                  Please try again
                </Button>
              </div>
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <div className="text-muted-foreground p-8 text-center">
                <MessageCircle className="mx-auto mb-2 size-8 opacity-40" />
                <p className="text-foreground text-sm font-medium">No conversations yet</p>
                <p className="mt-1 text-xs">Messages about your assigned tours will appear here.</p>
              </div>
            )}
            {filtered.map((item) => (
              <ConversationRow
                key={item.id}
                item={item}
                role={role}
                currentId={senderId}
                selected={item.id === conversationId}
                onClick={() => goConversation(item.id)}
              />
            ))}
          </div>
          {role === 'host' && (
            <div className="border-border border-t p-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAnnouncements(true)}
              >
                <Users className="mr-2 size-4" />
                Event announcements
              </Button>
            </div>
          )}
          {role === 'guest' && (
            <div className="border-border border-t p-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAnnouncements(true)}
              >
                <MessageCircle className="mr-2 size-4" />
                Event announcements
              </Button>
            </div>
          )}
        </aside>
        <section
          className={`${showListOnMobile ? 'hidden' : 'flex'} min-w-0 flex-1 flex-col md:flex`}
          aria-label="Conversation"
        >
          {!viewed && (
            <div className="text-muted-foreground m-auto hidden flex-col items-center text-center md:flex">
              <MessageCircle className="mb-3 size-10 opacity-40" />
              <p className="font-medium">Select a conversation</p>
              <p className="text-sm">Your tour communication will appear here.</p>
            </div>
          )}
          {viewed && (
            <>
              <div className="border-border flex h-[68px] shrink-0 items-center justify-between border-b px-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Back to conversations"
                    onClick={() =>
                      navigate(
                        role === 'guest'
                          ? '/dashboard/messages'
                          : role === 'host'
                            ? '/host/messages'
                            : '/admin/messages',
                      )
                    }
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <Avatar className="size-9">
                    <AvatarFallback>
                      {viewed.participants
                        .find((person) => person.id !== senderId)
                        ?.name.split(' ')
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join('') ?? 'LT'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {viewed.participants.find((person) => person.id !== senderId)?.name ??
                        viewed.eventName}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {viewed.eventName ?? 'Support'} ·{' '}
                      {viewed.participants.find((person) => person.id !== senderId)?.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="hidden sm:inline-flex">
                    {viewed.eventId ? 'Event conversation' : 'Support'}
                  </Badge>
                  {role !== 'guest' && (
                    <Button variant="ghost" size="icon" aria-label="Conversation options">
                      <MoreVertical className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="border-border bg-muted/20 flex items-center justify-between border-b px-4 py-2">
                <p className="text-muted-foreground truncate text-xs">
                  {viewed.eventName ?? 'Tour support'} <span className="px-1">·</span> Messages stay
                  with this tour
                </p>
                {role === 'guest' && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-7 shrink-0 px-1 text-xs"
                    onClick={() => setShowAnnouncements(true)}
                  >
                    Announcements <ArrowUpRight className="ml-1 size-3" />
                  </Button>
                )}
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
                <p className="text-muted-foreground bg-muted mx-auto w-fit rounded-full px-3 py-1 text-[10px]">
                  {viewed.eventName} · Conversation history
                </p>
                <AnimatePresence initial={false}>
                  {viewed.messages.slice(-80).map((message) => {
                    const mine = message.senderId === senderId || message.senderRole === role;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[88%] sm:max-w-[72%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}
                        >
                          <span className="text-muted-foreground mb-1 px-1 text-[10px]">
                            {mine ? 'You' : message.senderName}
                          </span>
                          <div
                            className={`rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${mine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'border-border bg-card rounded-bl-sm border'}`}
                          >
                            {message.content}
                          </div>
                          <span className="text-muted-foreground mt-1 flex items-center gap-1 px-1 text-[10px]">
                            {stamp(message.createdAt)}
                            {mine && <Delivery status={message.status} />}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {typing && (
                  <p className="text-muted-foreground animate-pulse text-xs">
                    {viewed.participants.find((person) => person.id !== senderId)?.name ?? 'Rahim'}{' '}
                    is typing…
                  </p>
                )}
              </div>
              <form
                onSubmit={onSend}
                className="border-border bg-background flex shrink-0 items-end gap-2 border-t p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Add attachment (coming soon)"
                  title="Attachments coming soon"
                >
                  <FilePlus2 className="size-4" />
                </Button>
                <Textarea
                  value={draft}
                  onChange={(event) => setDemoTyping(event.target.value)}
                  onKeyDown={composerKey}
                  placeholder="Write a message… (Enter to send, Shift + Enter for a new line)"
                  aria-label="Message"
                  maxLength={4000}
                  rows={1}
                  className="max-h-32 min-h-11 resize-none rounded-xl"
                />
                <Button
                  type="submit"
                  disabled={!draft.trim() || send.isPending}
                  className="size-11 shrink-0 rounded-xl"
                  aria-label="Send message"
                >
                  {send.isPending ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function ConversationRow({
  item,
  role,
  currentId,
  selected,
  onClick,
}: {
  item: Conversation;
  role: MessageRole;
  currentId: string;
  selected: boolean;
  onClick: () => void;
}) {
  const participant =
    item.participants.find((person) => person.id !== currentId) ??
    item.participants.find((person) => person.role !== role);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`hover:bg-muted/70 focus-visible:ring-ring flex w-full items-start gap-3 border-b p-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset ${selected ? 'bg-primary/5' : ''}`}
    >
      <Avatar className="mt-0.5 size-10 shrink-0">
        <AvatarFallback>
          {participant?.name
            .split(' ')
            .map((part) => part[0])
            .slice(0, 2)
            .join('') ?? 'LT'}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold">
            {participant?.name ?? item.eventName}
          </span>
          <span className="text-muted-foreground shrink-0 text-[10px]">
            {item.lastMessage ? stamp(item.lastMessage.createdAt) : ''}
          </span>
        </span>
        <span className="text-primary block truncate text-[10px]">
          {item.eventName ?? 'Support'}
        </span>
        <span className="text-muted-foreground mt-1 block truncate text-xs">
          {item.lastMessage?.content ?? 'Start a conversation'}
        </span>
      </span>
      {item.unreadCount > 0 && (
        <Badge className="mt-4 flex size-5 items-center justify-center rounded-full p-0 text-[10px]">
          {item.unreadCount}
        </Badge>
      )}
    </button>
  );
}

function Delivery({ status }: { status: string }) {
  if (status === 'failed')
    return <CircleAlert className="text-destructive size-3" aria-label="Failed" />;
  if (status === 'delivered' || status === 'seen')
    return (
      <CheckCheck
        className={`size-3 ${status === 'seen' ? 'text-sky-500' : ''}`}
        aria-label={status}
      />
    );
  return <Check className="size-3" aria-label="Sent" />;
}

export function MessageRoutePage({ currentRole }: { currentRole: MessageRole }) {
  return <MessagingPage currentRole={currentRole} />;
}
export function GuestMessagesRoutePage() {
  return <MessagingPage currentRole="guest" />;
}
export function HostMessagesRoutePage() {
  return <MessagingPage currentRole="host" />;
}
export function AdminMessagesRoutePage() {
  return <MessagingPage currentRole="admin" />;
}

export function EventAnnouncementsRoutePage({
  currentRole: role,
}: {
  currentRole: 'host' | 'admin';
}) {
  const { eventId } = useParams();
  return (
    <div className="bg-muted/20 min-h-dvh">
      <header className="border-border bg-background sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4">
        <Link
          to={role === 'admin' ? '/admin/messages' : '/host/messages'}
          className="text-sm font-medium"
        >
          <ArrowLeft className="mr-2 inline size-4" />
          Messages
        </Link>
        <NotificationCenter />
      </header>
      <AnnouncementFeed eventId={eventId} role={role} />
    </div>
  );
}

export function HostEventAnnouncementsRoutePage() {
  return <EventAnnouncementsRoutePage currentRole="host" />;
}
export function AdminEventAnnouncementsRoutePage() {
  return <EventAnnouncementsRoutePage currentRole="admin" />;
}

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { useParams } from 'react-router';
import {
  Search,
  MessageCircle,
  Globe,
  Bot,
  User,
  Check,
  CheckCheck,
  Send,
  Sparkles,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAdminInbox } from '../hooks/useAdminInbox';
import type { ConversationStatus } from '../types/communication.types';

const CHANNEL_ICONS: Record<string, LucideIcon> = {
  website: Globe,
  whatsapp: MessageCircle,
  facebook: MessageCircle,
  instagram: MessageCircle,
  telegram: Send,
  internal: Globe,
};

const CHANNEL_COLORS: Record<string, string> = {
  website: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  whatsapp: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  facebook: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  instagram: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
  telegram: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
  internal: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
};

export function AdminUnifiedInbox() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const {
    conversations,
    selectedId,
    setSelectedId,
    activeConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    channelFilter,
    setChannelFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sendReply,
    isSendingReply,
    updateStatus,
    setHandlingMode,
  } = useAdminInbox(conversationId);

  const [replyText, setReplyText] = useState('');
  const [showRightPanel, setShowRightPanel] = useState(true);
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!replyText.trim() || isSendingReply) return;
    const text = replyText;
    setReplyText('');
    await sendReply(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-border bg-card flex h-[calc(100vh-80px)] w-full overflow-hidden rounded-2xl border shadow-sm">
      {/* ========================================================= */}
      {/* 1. LEFT PANEL: Conversations List & Filters */}
      {/* ========================================================= */}
      <div className="border-border bg-card/60 flex w-full max-w-[360px] flex-col border-r sm:max-w-[380px]">
        {/* Header */}
        <div className="border-border flex flex-col gap-3 border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground flex items-center gap-2 text-lg font-bold tracking-tight">
              <MessageCircle className="text-primary size-5" />
              Unified Inbox
            </h2>
            <Badge variant="secondary" className="text-xs">
              {conversations.length} active
            </Badge>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, phone, text..."
              className="bg-muted/40 h-9 rounded-xl pl-9 text-xs"
            />
          </div>

          {/* Channel Filter Pills */}
          <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['all', 'website', 'whatsapp', 'facebook', 'instagram', 'telegram'].map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition ${
                  channelFilter === ch
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Status Tabs */}
          <div className="bg-muted/40 flex rounded-lg p-0.5 text-xs">
            {['all', 'open', 'pending', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`flex-1 rounded-md py-1 text-[11px] font-medium capitalize transition ${
                  statusFilter === st
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="divide-border/60 flex-1 divide-y overflow-y-auto">
          {isLoadingConversations && conversations.length === 0 ? (
            <div className="text-muted-foreground flex h-40 items-center justify-center text-xs">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-muted-foreground p-8 text-center text-xs">
              No conversations found.
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = (conv._id || conv.id) === selectedId;
              const ChannelIcon = CHANNEL_ICONS[conv.channel] || Globe;
              const channelColor = CHANNEL_COLORS[conv.channel] || '';

              return (
                <button
                  key={conv._id || conv.id}
                  onClick={() => setSelectedId(conv._id || conv.id)}
                  className={`hover:bg-muted/40 flex w-full flex-col gap-1.5 p-3.5 text-left transition ${
                    isSelected ? 'bg-muted/60 border-l-primary border-l-4' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-md border ${channelColor}`}
                      >
                        <ChannelIcon className="size-3.5" />
                      </span>
                      <span className="text-foreground truncate text-xs font-semibold">
                        {conv.customerDisplayName || 'Customer'}
                      </span>
                    </div>

                    <span className="text-muted-foreground shrink-0 text-[10px]">
                      {conv.lastMessageAt
                        ? new Date(conv.lastMessageAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })
                        : ''}
                    </span>
                  </div>

                  {/* Last Message Preview */}
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    {conv.lastMessageId?.content || 'No messages yet'}
                  </p>

                  {/* Badges */}
                  <div className="mt-1 flex items-center justify-between gap-1.5 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`h-4.5 px-1.5 text-[10px] capitalize ${
                          conv.handlingMode === 'ai'
                            ? 'border-purple-500/30 bg-purple-500/10 text-purple-600'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        {conv.handlingMode === 'ai' ? 'AI Active' : 'Human Staff'}
                      </Badge>

                      <span className="text-muted-foreground capitalize">• {conv.status}</span>
                    </div>

                    {conv.unreadCountAdmin > 0 && (
                      <span className="bg-primary text-primary-foreground flex size-4.5 items-center justify-center rounded-full text-[10px] font-bold">
                        {conv.unreadCountAdmin}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CENTER PANEL: Message History & Reply Composer */}
      {/* ========================================================= */}
      <div className="bg-background flex flex-1 flex-col overflow-hidden">
        {activeConversation ? (
          <>
            {/* Active Thread Header */}
            <div className="border-border bg-card/60 flex items-center justify-between border-b px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-foreground text-sm font-semibold">
                      {activeConversation.customerDisplayName || 'Customer'}
                    </h3>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {activeConversation.channel}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    ID: {activeConversation.externalContactId || 'Website Session'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Handling Mode Switcher */}
                <Button
                  size="sm"
                  variant={activeConversation.handlingMode === 'ai' ? 'outline' : 'secondary'}
                  className="h-8 gap-1.5 text-xs"
                  onClick={() =>
                    setHandlingMode(activeConversation.handlingMode === 'ai' ? 'human' : 'ai')
                  }
                >
                  {activeConversation.handlingMode === 'ai' ? (
                    <>
                      <Sparkles className="size-3.5 text-purple-500" />
                      Switch to Human
                    </>
                  ) : (
                    <>
                      <Bot className="text-primary size-3.5" />
                      Handover to AI
                    </>
                  )}
                </Button>

                {/* Status Toggle */}
                <select
                  value={activeConversation.status}
                  onChange={(e) => updateStatus(e.target.value as ConversationStatus)}
                  className="border-border bg-card text-foreground h-8 rounded-lg border px-2.5 text-xs focus-visible:outline-none"
                >
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRightPanel((p) => !p)}
                  className="h-8 px-2 text-xs"
                >
                  {showRightPanel ? 'Hide Info' : 'Show Info'}
                </Button>
              </div>
            </div>

            {/* Thread Message Stream */}
            <div className="bg-muted/10 flex-1 space-y-4 overflow-y-auto p-5">
              {isLoadingMessages ? (
                <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                  Loading message history...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                  No messages in this conversation.
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isStaff = m.senderType === 'staff';
                  const isAi = m.senderType === 'ai';

                  return (
                    <div
                      key={m.id || m._id || idx}
                      className={`flex flex-col ${isStaff || isAi ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-[11px]">
                        <span className="font-medium">
                          {isStaff
                            ? `Staff: ${m.senderName || 'Agent'}`
                            : isAi
                              ? 'Labib AI Assistant'
                              : m.senderName || 'Customer'}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap shadow-xs ${
                          isStaff
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : isAi
                              ? 'rounded-br-none border border-purple-500/20 bg-purple-500/10 text-purple-900 dark:text-purple-100'
                              : 'border-border bg-card text-foreground rounded-bl-none border'
                        }`}
                      >
                        {m.content}
                      </div>

                      <div className="text-muted-foreground mt-1 flex items-center gap-1 text-[10px]">
                        {isStaff && (
                          <span className="flex items-center gap-0.5">
                            {m.status === 'delivered' ? (
                              <CheckCheck className="size-3 text-emerald-500" />
                            ) : (
                              <Check className="size-3" />
                            )}
                            <span className="capitalize">{m.status}</span>
                          </span>
                        )}
                        {m.deliveryError && (
                          <span className="text-destructive font-medium">({m.deliveryError})</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={threadEndRef} />
            </div>

            {/* Reply Composer */}
            <div className="border-border bg-card border-t p-4">
              <form onSubmit={handleSend} className="flex flex-col gap-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Reply via ${activeConversation.channel.toUpperCase()}... (Press Enter to send)`}
                  rows={2}
                  className="bg-muted/20 resize-none rounded-xl text-xs"
                />

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px]">
                    Press <kbd className="bg-muted rounded px-1 py-0.5 font-mono">Enter</kbd> to
                    reply
                  </span>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={!replyText.trim() || isSendingReply}
                    className="gap-2"
                  >
                    <Send className="size-3.5" />
                    <span>Send Reply</span>
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center p-8 text-center">
            <MessageCircle className="text-muted-foreground/40 mb-3 size-12" />
            <h3 className="text-foreground text-sm font-semibold">Select a conversation</h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-xs">
              Choose an active conversation from the inbox on the left to review messages, reply to
              customers, or manage handling modes.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. RIGHT PANEL: Customer Details & Booking Context */}
      {/* ========================================================= */}
      {showRightPanel && activeConversation && (
        <div className="border-border bg-card/60 hidden w-[300px] flex-col space-y-5 overflow-y-auto border-l p-4 lg:flex">
          <div>
            <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Customer Details
            </h4>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground size-4" />
                <span className="text-foreground font-medium">
                  {activeConversation.customerDisplayName || 'Unknown'}
                </span>
              </div>
              {activeConversation.customerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="text-muted-foreground size-4" />
                  <span className="text-foreground">{activeConversation.customerPhone}</span>
                </div>
              )}
              {activeConversation.customerEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="text-muted-foreground size-4" />
                  <span className="text-foreground">{activeConversation.customerEmail}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Globe className="text-muted-foreground size-4" />
                <span className="text-foreground capitalize">{activeConversation.channel}</span>
              </div>
            </div>
          </div>

          {/* Linked Tour Context */}
          {activeConversation.eventId && (
            <div className="border-border bg-muted/20 rounded-xl border p-3">
              <h4 className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                <Calendar className="text-primary size-3.5" />
                Linked Tour Event
              </h4>
              <p className="text-foreground mt-1.5 text-xs font-medium">
                {activeConversation.eventId.title}
              </p>
              <p className="text-muted-foreground text-[11px]">
                {activeConversation.eventId.destination}
              </p>
            </div>
          )}

          {/* Linked Booking Context */}
          {activeConversation.bookingId && (
            <div className="border-border bg-muted/20 rounded-xl border p-3">
              <h4 className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                <CreditCard className="text-primary size-3.5" />
                Linked Booking
              </h4>
              <p className="text-primary mt-1.5 font-mono text-xs font-bold">
                {activeConversation.bookingId.bookingReference}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-foreground font-semibold capitalize">
                  {activeConversation.bookingId.bookingStatus}
                </span>
                <span className="text-muted-foreground">Due Balance:</span>
                <span className="text-foreground font-semibold">
                  ৳{activeConversation.bookingId.dueAmount?.toLocaleString('en-US')}
                </span>
              </div>
            </div>
          )}

          {/* Handling Mode Summary */}
          <div className="border-border bg-muted/20 rounded-xl border p-3">
            <h4 className="text-foreground mb-1.5 text-xs font-semibold">Handling Mode</h4>
            <p className="text-muted-foreground text-[11px]">
              {activeConversation.handlingMode === 'ai'
                ? 'AI Assistant automatically answers questions using verified tour data.'
                : 'Customer is in the human support queue. AI automatic replies are paused.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

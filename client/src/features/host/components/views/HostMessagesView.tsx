import { useState } from 'react';
import { Send, Phone, Search, CheckCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { HostConversation } from '@/features/host/types';

interface HostMessagesViewProps {
  conversations: HostConversation[];
  onSendMessage: (conversationId: string, text: string) => void;
}

const PRESET_QUICK_REPLIES = [
  'Coach departure is on schedule from Sayedabad counter 4.',
  'Please gather at the main lounge for luggage tagging.',
  'Highway breakfast stop reached. 30 minutes refreshment break.',
  'Army escort convoy clearance is complete. Departing baghaihat.',
];

export function HostMessagesView({ conversations, onSendMessage }: HostMessagesViewProps) {
  const [activeSection, setActiveSection] = useState<'all' | 'guest' | 'admin' | 'support'>('all');
  const [selectedConvId, setSelectedConvId] = useState<string>(() => {
    return conversations[0]?.id || '';
  });
  const [inputText, setInputText] = useState('');
  const [search, setSearch] = useState('');

  const filteredConversations = conversations.filter((c) => {
    const matchesSection = activeSection === 'all' || c.type === activeSection;
    const matchesSearch =
      c.participantName.toLowerCase().includes(search.toLowerCase()) ||
      c.participantRole.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase());
    return matchesSection && matchesSearch;
  });

  const activeConversation =
    conversations.find((c) => c.id === selectedConvId) ||
    filteredConversations[0] ||
    conversations[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;
    onSendMessage(activeConversation.id, inputText.trim());
    setInputText('');
  };

  const handleQuickReply = (text: string) => {
    if (!activeConversation) return;
    onSendMessage(activeConversation.id, text);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-display text-foreground text-lg font-bold sm:text-xl">
          Field Communication Hub
        </h3>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Dedicated channels connecting you with registered passengers, operations dispatch, and
          24/7 SOS helpline.
        </p>
      </div>

      {/* Main 2-Pane Chat Application */}
      <div className="border-border bg-card flex h-[620px] flex-col overflow-hidden rounded-2xl border shadow-xs md:flex-row">
        {/* Left Pane: Conversation List */}
        <div className="border-border bg-muted/20 flex w-full flex-col justify-between border-r md:w-80">
          <div>
            {/* Filter Tabs */}
            <div className="border-border bg-card border-b p-3">
              <div className="bg-muted grid grid-cols-4 gap-1 rounded-xl p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveSection('all')}
                  className={cn(
                    'cursor-pointer rounded-lg py-1 text-center text-[11px] transition-colors',
                    activeSection === 'all'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground',
                  )}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('guest')}
                  className={cn(
                    'cursor-pointer rounded-lg py-1 text-center text-[11px] transition-colors',
                    activeSection === 'guest'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground',
                  )}
                >
                  Guests
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('admin')}
                  className={cn(
                    'cursor-pointer rounded-lg py-1 text-center text-[11px] transition-colors',
                    activeSection === 'admin'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground',
                  )}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection('support')}
                  className={cn(
                    'cursor-pointer rounded-lg py-1 text-center text-[11px] transition-colors',
                    activeSection === 'support'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground',
                  )}
                >
                  SOS
                </button>
              </div>

              {/* Search box */}
              <div className="relative mt-2">
                <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3 -translate-y-1/2" />
                <Input
                  placeholder="Search chats..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-7 pl-7 text-[11px]"
                />
              </div>
            </div>

            {/* Thread List */}
            <div className="divide-border/60 max-h-[500px] divide-y overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="text-muted-foreground p-6 text-center text-xs">
                  No conversations found.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = activeConversation?.id === conv.id;

                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => setSelectedConvId(conv.id)}
                      className={cn(
                        'flex w-full cursor-pointer items-start gap-3 p-3.5 text-left transition-colors',
                        isSelected ? 'bg-card border-l-primary border-l-4' : 'hover:bg-muted/40',
                      )}
                    >
                      <Avatar className="border-border size-8.5 shrink-0 border">
                        <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
                          {conv.participantName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-foreground truncate text-xs font-bold">
                            {conv.participantName}
                          </span>
                          <span className="text-muted-foreground shrink-0 text-[9px]">
                            {new Date(conv.lastMessageTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <span className="text-primary block truncate text-[10px] font-medium">
                          {conv.participantRole}
                        </span>

                        <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
                          {conv.lastMessage}
                        </p>
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground flex size-4.5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Pane: Active Chat Window */}
        {activeConversation ? (
          <div className="bg-card flex min-w-0 flex-1 flex-col justify-between">
            {/* Chat Header */}
            <div className="border-border bg-card flex items-center justify-between border-b p-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="border-primary/20 size-9 shrink-0 border">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {activeConversation.participantName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <h4 className="text-foreground truncate text-xs font-bold sm:text-sm">
                    {activeConversation.participantName}
                  </h4>
                  <p className="text-muted-foreground truncate text-[10px]">
                    {activeConversation.participantRole}
                    {activeConversation.tourName && ` • ${activeConversation.tourName}`}
                  </p>
                </div>
              </div>

              {activeConversation.participantPhone && (
                <Button asChild variant="outline" size="sm" className="h-8 gap-1 text-xs">
                  <a href={`tel:${activeConversation.participantPhone}`}>
                    <Phone className="text-primary size-3" />
                    <span className="hidden sm:inline">Call</span>
                  </a>
                </Button>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="bg-muted/10 flex-1 space-y-3 overflow-y-auto p-4">
              <div className="my-2 text-center">
                <span className="bg-muted/60 text-muted-foreground rounded-full px-2.5 py-0.5 text-[10px]">
                  Today&apos;s Tour Operations Thread
                </span>
              </div>

              {activeConversation.messages.map((msg) => {
                const isHost = msg.senderRole === 'host';

                return (
                  <div
                    key={msg.id}
                    className={cn('flex flex-col', isHost ? 'items-end' : 'items-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-2xs',
                        isHost
                          ? 'bg-primary text-primary-foreground rounded-tr-xs'
                          : 'bg-card border-border text-foreground rounded-tl-xs border',
                      )}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>

                    <div className="mt-1 flex items-center gap-1 px-1">
                      <span className="text-muted-foreground text-[9px]">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isHost && <CheckCheck className="text-primary size-3" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Preset Replies Strip */}
            <div className="border-border/60 bg-muted/20 flex items-center gap-1.5 overflow-x-auto border-t px-3 py-1.5">
              <Sparkles className="text-primary ml-1 size-3 shrink-0" />
              {PRESET_QUICK_REPLIES.map((reply, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickReply(reply)}
                  className="text-muted-foreground hover:text-foreground bg-card border-border hover:border-primary/40 shrink-0 cursor-pointer rounded-full border px-2 py-0.5 text-[10px] whitespace-nowrap transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Message Input Footer */}
            <form
              onSubmit={handleSend}
              className="border-border bg-card flex items-center gap-2 border-t p-3"
            >
              <Input
                placeholder={`Message ${activeConversation.participantName.split(' ')[0]}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="h-9 text-xs"
              />
              <Button type="submit" size="sm" className="h-9 shrink-0 gap-1 px-3">
                <Send className="size-3.5" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          </div>
        ) : (
          <div className="text-muted-foreground flex flex-1 items-center justify-center p-8 text-center text-xs">
            Select a conversation on the left to start messaging.
          </div>
        )}
      </div>
    </div>
  );
}

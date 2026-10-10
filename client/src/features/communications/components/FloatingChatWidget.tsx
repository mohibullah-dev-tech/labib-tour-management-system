import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, UserCheck, User, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWebsiteChat } from '../hooks/useWebsiteChat';
import { communicationService } from '../services/communication.service';
import type { PublicContactChannels } from '../types/communication.types';

const QUICK_PROMPTS = [
  {
    labelBn: 'আসন্ন ট্যুর কী আছে?',
    labelEn: 'Upcoming Tours?',
    query: 'আমাদের আসন্ন ট্যুরগুলোর তালিকা ও তারিখ দেখতে চাই',
  },
  {
    labelBn: 'বুকিংয়ের নিয়ম কী?',
    labelEn: 'How to Book?',
    query: 'ট্যুর বুকিং করার নিয়ম এবং ন্যূনতম অগ্রিম পেমেন্ট কত?',
  },
  {
    labelBn: 'হেল্পলাইন নাম্বার?',
    labelEn: 'Contact Helpline?',
    query: 'আপনাদের হেল্পলাইন ও অফিস যোগাযোগের ঠিকানা জানান',
  },
];

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [contactChannels, setContactChannels] = useState<PublicContactChannels | null>(null);
  const [showChannelsDrawer, setShowChannelsDrawer] = useState(false);
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isLoading,
    isSending,
    isTyping,
    unreadCount,
    sendMessage,
    requestHumanSupport,
    isHandingOver,
  } = useWebsiteChat(isOpen);

  // Fetch public contact channels on mount
  useEffect(() => {
    communicationService
      .getPublicChannels()
      .then(setContactChannels)
      .catch(() => {});
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending) return;
    const text = inputText;
    setInputText('');
    await sendMessage(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickPrompt = (query: string) => {
    sendMessage(query);
  };

  return (
    <>
      {/* Floating Chat Launcher Button */}
      <div className="fixed right-6 bottom-6 z-40 flex items-center gap-3">
        <AnimatePresence>
          {!isOpen && unreadCount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-primary text-primary-foreground shadow-floating hidden items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold sm:flex"
            >
              <span>
                {unreadCount} new message{unreadCount > 1 ? 's' : ''}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close chat' : 'Open live chat'}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="bg-primary text-primary-foreground shadow-floating focus-visible:ring-primary relative flex size-14 items-center justify-center rounded-full transition-shadow duration-300 hover:shadow-xl focus-visible:ring-2 focus-visible:outline-none"
        >
          {isOpen ? (
            <X className="size-6" />
          ) : (
            <>
              <MessageCircle className="size-6" />
              {unreadCount > 0 ? (
                <span className="bg-destructive text-destructive-foreground ring-background absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-xs font-bold ring-2">
                  {unreadCount}
                </span>
              ) : (
                <span className="bg-success ring-background absolute top-1 right-1 size-3.5 rounded-full ring-2">
                  <span className="bg-success absolute inset-0 animate-ping rounded-full opacity-75" />
                </span>
              )}
            </>
          )}
        </motion.button>
      </div>

      {/* Expandable Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="border-border bg-card fixed right-4 bottom-22 z-40 flex h-[82vh] max-h-[600px] w-[calc(100vw-32px)] max-w-[420px] flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-lg sm:right-6"
          >
            {/* Header */}
            <div className="border-border from-primary/95 to-primary-700 text-primary-foreground flex flex-col border-b bg-gradient-to-r p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="relative flex size-10 items-center justify-center rounded-full bg-white/15 text-white ring-2 ring-white/30 backdrop-blur-sm">
                    <Bot className="size-5" />
                    <span className="ring-primary-700 absolute right-0 bottom-0 size-2.5 rounded-full bg-emerald-400 ring-2" />
                  </div>
                  <div>
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-white">
                      Labib AI Travel Advisor
                      <Sparkles className="size-3.5 text-amber-300" />
                    </h3>
                    <p className="text-xs text-white/80">
                      {language === 'bn' ? 'অনলাইন • তৎক্ষণাৎ উত্তর' : 'Online • Instant replies'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLanguage((l) => (l === 'bn' ? 'en' : 'bn'))}
                    className="rounded-lg border border-white/20 bg-white/10 px-2 py-0.5 text-xs font-medium text-white transition hover:bg-white/20"
                    title="Toggle Language"
                  >
                    {language === 'bn' ? 'English' : 'বাংলা'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close chat window"
                    className="flex size-7 items-center justify-center rounded-lg text-white/80 hover:bg-white/15 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Handover & Social Links Bar */}
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/15 pt-2 text-xs">
                <button
                  type="button"
                  onClick={requestHumanSupport}
                  disabled={isHandingOver}
                  className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-white/25 active:scale-95 disabled:opacity-50"
                >
                  <UserCheck className="size-3.5" />
                  <span>
                    {isHandingOver
                      ? 'Connecting...'
                      : language === 'bn'
                        ? 'মানুষের সাথে কথা বলুন'
                        : 'Talk to Human'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowChannelsDrawer((p) => !p)}
                  className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs text-white/90 hover:bg-white/20"
                >
                  <span>{language === 'bn' ? 'অন্যান্য চ্যানেল' : 'Other channels'}</span>
                  <ExternalLink className="size-3" />
                </button>
              </div>

              {/* Direct Social Channels Drawer */}
              <AnimatePresence>
                {showChannelsDrawer && contactChannels && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2.5 flex flex-wrap gap-2 border-t border-white/10 pt-2 text-xs"
                  >
                    {contactChannels.whatsapp.enabled && contactChannels.whatsapp.url && (
                      <a
                        href={contactChannels.whatsapp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-md bg-emerald-600/90 px-2.5 py-1 text-white hover:bg-emerald-600"
                      >
                        <span>WhatsApp</span>
                      </a>
                    )}
                    {contactChannels.facebook.enabled && contactChannels.facebook.url && (
                      <a
                        href={contactChannels.facebook.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-md bg-blue-600/90 px-2.5 py-1 text-white hover:bg-blue-600"
                      >
                        <span>Messenger</span>
                      </a>
                    )}
                    {contactChannels.instagram.enabled && contactChannels.instagram.url && (
                      <a
                        href={contactChannels.instagram.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-md bg-pink-600/90 px-2.5 py-1 text-white hover:bg-pink-600"
                      >
                        <span>Instagram</span>
                      </a>
                    )}
                    {contactChannels.telegram.enabled && contactChannels.telegram.url && (
                      <a
                        href={contactChannels.telegram.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-md bg-sky-600/90 px-2.5 py-1 text-white hover:bg-sky-600"
                      >
                        <span>Telegram</span>
                      </a>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Message Thread */}
            <div className="bg-muted/20 flex-1 space-y-3.5 overflow-y-auto p-4">
              {isLoading && messages.length === 0 ? (
                <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                  <div className="flex flex-col items-center gap-2">
                    <span className="border-primary size-5 animate-spin rounded-full border-2 border-t-transparent" />
                    <span>{language === 'bn' ? 'চ্যাট সংযোগ হচ্ছে...' : 'Connecting chat...'}</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-6 text-center">
                  <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                    <Bot className="size-6" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {language === 'bn' ? 'লাবিব ট্যুরে স্বাগতম!' : 'Welcome to Labib Tour!'}
                    </p>
                    <p className="text-muted-foreground mt-1 max-w-[280px] text-xs">
                      {language === 'bn'
                        ? 'আমাদের আগামী ট্যুর, বুকিংয়ের নিয়ম ও সিট সম্পর্কে যেকোনো প্রশ্ন করতে পারেন।'
                        : 'Ask me anything about upcoming tour packages, dates, pricing, or booking.'}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isUser = msg.direction === 'inbound';
                  const isAi = msg.senderType === 'ai';
                  const isStaff = msg.senderType === 'staff';

                  return (
                    <div
                      key={msg.id || msg._id || idx}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      {/* Sender label */}
                      {!isUser && (
                        <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-[11px] font-medium">
                          {isAi ? (
                            <Badge
                              variant="outline"
                              className="bg-primary/5 text-primary border-primary/20 h-4 gap-1 px-1.5 text-[10px]"
                            >
                              <Sparkles className="size-2.5" /> AI Assistant
                            </Badge>
                          ) : isStaff ? (
                            <Badge
                              variant="outline"
                              className="h-4 gap-1 border-emerald-500/20 bg-emerald-500/10 px-1.5 text-[10px] text-emerald-600"
                            >
                              <User className="size-2.5" /> Staff ({msg.senderName || 'Team'})
                            </Badge>
                          ) : null}
                          <span className="text-[10px] opacity-75">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap ${
                          isUser
                            ? 'bg-primary text-primary-foreground rounded-br-none shadow-sm'
                            : 'bg-card text-card-foreground border-border/80 rounded-bl-none border shadow-xs'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* User timestamp */}
                      {isUser && (
                        <span className="text-muted-foreground mt-1 text-[10px]">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <div className="bg-card border-border flex gap-1 rounded-full border px-3 py-1.5 shadow-xs">
                    <span className="bg-primary/70 size-1.5 animate-bounce rounded-full" />
                    <span className="bg-primary/70 size-1.5 animate-bounce rounded-full [animation-delay:0.2s]" />
                    <span className="bg-primary/70 size-1.5 animate-bounce rounded-full [animation-delay:0.4s]" />
                  </div>
                  <span>{language === 'bn' ? 'টাইপ করছে...' : 'Typing...'}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="border-border bg-card/70 flex scrollbar-none items-center gap-1.5 overflow-x-auto border-t px-3 py-2 text-xs">
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickPrompt(p.query)}
                  className="border-border bg-background text-muted-foreground hover:border-primary hover:text-primary shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition active:scale-95"
                >
                  {language === 'bn' ? p.labelBn : p.labelEn}
                </button>
              ))}
            </div>

            {/* Input Composer */}
            <form
              onSubmit={handleSubmit}
              className="border-border bg-card flex items-center gap-2 border-t p-3"
            >
              <Input
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  language === 'bn'
                    ? 'প্রশ্ন লিখুন... (Enter চাপুন)'
                    : 'Ask a question... (Press Enter)'
                }
                className="bg-muted/30 h-10 flex-1 rounded-xl text-xs focus-visible:ring-1"
                disabled={isSending}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!inputText.trim() || isSending}
                className="size-10 shrink-0 rounded-xl p-0"
              >
                {isSending ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

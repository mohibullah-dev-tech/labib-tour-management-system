import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import {
  communicationService,
  type WebsiteSessionResponse,
} from '../services/communication.service';
import type { CommunicationMessage, CommunicationConversation } from '../types/communication.types';

const STORAGE_KEY = 'ltms_guest_chat_session';

interface SendWebsiteMessageResponse extends CommunicationMessage {
  reply?: CommunicationMessage | null;
}

interface HandoverResponse {
  success?: boolean;
  handlingMode?: string;
  message?: CommunicationMessage | null;
}

export function useWebsiteChat(isOpen: boolean) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<WebsiteSessionResponse | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize or restore website session
  useEffect(() => {
    let isMounted = true;
    if (!session) {
      communicationService
        .createWebsiteSession()
        .then((res) => {
          if (isMounted) {
            setSession(res);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
          }
        })
        .catch(() => {
          // Graceful fallback
        });
    }
    return () => {
      isMounted = false;
    };
  }, [session]);

  const conversationId = session?.conversationId;
  const token = session?.token;

  // 2. Fetch messages
  const messagesQuery = useQuery({
    queryKey: ['website-chat-messages', conversationId],
    queryFn: () => communicationService.getWebsiteMessages(conversationId!, token!),
    enabled: Boolean(conversationId && token),
    staleTime: 1000 * 30,
    refetchInterval: isOpen ? 6000 : false, // gentle background polling fallback if socket disconnects
  });

  // 3. Socket.IO Real-time Connection
  useEffect(() => {
    if (!conversationId) return;

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    // Join conversation room
    socket.emit('conversation:join', { conversationId }, () => {});

    // Listen for incoming messages
    const handleNewMessage = (msg: unknown) => {
      const m = msg as CommunicationMessage;
      if (m.conversationId === conversationId) {
        queryClient.setQueryData<CommunicationMessage[]>(
          ['website-chat-messages', conversationId],
          (old = []) => {
            if (old.some((item) => (item.id || item._id) === (m.id || m._id))) return old;
            return [...old, m];
          },
        );

        if (!isOpen && m.direction === 'outbound') {
          setUnreadCount((c) => c + 1);
        }
      }
    };

    const handleConversationUpdated = (data: unknown) => {
      const payload = data as { conversation?: CommunicationConversation };
      if (
        payload?.conversation?._id === conversationId ||
        payload?.conversation?.id === conversationId
      ) {
        queryClient.setQueryData<CommunicationConversation>(
          ['website-chat-conversation', conversationId],
          payload.conversation,
        );
      }
    };

    const handleTyping = (data: unknown) => {
      const payload = data as { conversationId?: string; userId?: string };
      if (payload?.conversationId === conversationId && payload?.userId !== session?.sessionId) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    };

    const handleStopTyping = (data: unknown) => {
      const payload = data as { conversationId?: string };
      if (payload?.conversationId === conversationId) {
        setIsTyping(false);
      }
    };

    socket.on('message:new', handleNewMessage as (payload: unknown) => void);
    socket.on('conversation:updated', handleConversationUpdated as (payload: unknown) => void);
    socket.on('message:typing', handleTyping as (payload: unknown) => void);
    socket.on('message:stop-typing', handleStopTyping as (payload: unknown) => void);

    return () => {
      socket.off('message:new', handleNewMessage as (payload: unknown) => void);
      socket.off('conversation:updated', handleConversationUpdated as (payload: unknown) => void);
      socket.off('message:typing', handleTyping as (payload: unknown) => void);
      socket.off('message:stop-typing', handleStopTyping as (payload: unknown) => void);
      socket.emit('conversation:leave', { conversationId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, isOpen, queryClient, session?.sessionId]);

  // Reset unread count when chat opens
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // 4. Send Message Mutation
  const sendMutation = useMutation({
    mutationFn: ({
      convId,
      sessionToken,
      content,
    }: {
      convId: string;
      sessionToken: string;
      content: string;
    }) => communicationService.sendWebsiteMessage(convId, sessionToken, content),
    onSuccess: (savedMsg: SendWebsiteMessageResponse, variables) => {
      queryClient.setQueryData<CommunicationMessage[]>(
        ['website-chat-messages', variables.convId],
        (old = []) => {
          let updated = old;
          const msgId = savedMsg?.id || savedMsg?._id;
          if (msgId && !updated.some((m) => (m.id || m._id) === msgId)) {
            updated = [...updated, savedMsg];
          }
          if (savedMsg?.reply) {
            const replyId = savedMsg.reply.id || savedMsg.reply._id;
            if (replyId && !updated.some((m) => (m.id || m._id) === replyId)) {
              updated = [...updated, savedMsg.reply];
            }
          }
          return updated;
        },
      );
    },
  });

  // 5. Handover Mutation
  const handoverMutation = useMutation({
    mutationFn: async () => {
      let convId = conversationId;
      if (!convId) {
        const res = await communicationService.createWebsiteSession();
        setSession(res);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
        convId = res.conversationId;
      }
      return communicationService.requestHandover(convId);
    },
    onSuccess: (data: HandoverResponse) => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ['website-chat-conversation', conversationId] });
        const handoverMsg = data?.message;
        if (handoverMsg) {
          queryClient.setQueryData<CommunicationMessage[]>(
            ['website-chat-messages', conversationId],
            (old = []) => {
              const msgId = handoverMsg.id || handoverMsg._id;
              if (msgId && !old.some((m) => (m.id || m._id) === msgId)) {
                return [...old, handoverMsg];
              }
              return old;
            },
          );
        }
      }
    },
  });

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text) return;

      let convId = conversationId;
      let sessionToken = token;

      if (!convId || !sessionToken) {
        try {
          const res = await communicationService.createWebsiteSession();
          setSession(res);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
          convId = res.conversationId;
          sessionToken = res.token;
        } catch (err) {
          console.error('Failed to create guest chat session', err);
          return;
        }
      }

      return sendMutation.mutateAsync({
        convId,
        sessionToken,
        content: text,
      });
    },
    [conversationId, token, sendMutation],
  );

  const requestHumanSupport = useCallback(async () => {
    return handoverMutation.mutateAsync();
  }, [handoverMutation]);

  return {
    session,
    conversationId,
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    isSending: sendMutation.isPending,
    isTyping,
    unreadCount,
    sendMessage,
    requestHumanSupport,
    isHandingOver: handoverMutation.isPending,
  };
}

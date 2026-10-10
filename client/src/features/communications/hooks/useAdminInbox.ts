import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSocket } from '@/lib/socket';
import { communicationService } from '../services/communication.service';
import type {
  CommunicationConversation,
  CommunicationMessage,
  ConversationStatus,
  HandlingMode,
} from '../types/communication.types';

export function useAdminInbox(initialConversationId?: string) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | undefined>(initialConversationId);
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Fetch Conversations List
  const conversationsQuery = useQuery({
    queryKey: [
      'admin-conversations',
      { channel: channelFilter, status: statusFilter, search: searchQuery },
    ],
    queryFn: () =>
      communicationService.listAdminConversations({
        channel: channelFilter !== 'all' ? channelFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
        limit: 50,
      }),
    refetchInterval: 12000,
  });

  const conversations = useMemo(
    () => conversationsQuery.data?.items || [],
    [conversationsQuery.data?.items],
  );

  // Default select first conversation if none selected and list is loaded
  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0]._id || conversations[0].id);
    }
  }, [conversations, selectedId]);

  // 2. Fetch Active Conversation Details
  const activeConversationQuery = useQuery({
    queryKey: ['admin-conversation-details', selectedId],
    queryFn: () => communicationService.getAdminConversation(selectedId!),
    enabled: Boolean(selectedId),
  });

  // 3. Fetch Message Thread
  const messagesQuery = useQuery({
    queryKey: ['admin-conversation-messages', selectedId],
    queryFn: () => communicationService.getAdminConversationMessages(selectedId!),
    enabled: Boolean(selectedId),
  });

  // 4. Socket.IO Real-time updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    if (selectedId) {
      socket.emit('conversation:join', { conversationId: selectedId });
    }

    const handleNewMessage = (msg: CommunicationMessage) => {
      // If message is in currently open conversation, append to thread
      if (msg.conversationId === selectedId) {
        queryClient.setQueryData<CommunicationMessage[]>(
          ['admin-conversation-messages', selectedId],
          (old = []) => {
            if (old.some((m) => (m.id || m._id) === (msg.id || msg._id))) return old;
            return [...old, msg];
          },
        );
      }

      // Update conversations list cache
      queryClient.setQueryData<{ items: CommunicationConversation[]; pagination: unknown }>(
        [
          'admin-conversations',
          { channel: channelFilter, status: statusFilter, search: searchQuery },
        ],
        (old) => {
          if (!old) return old;
          const updatedItems = old.items.map((c) => {
            if (c._id === msg.conversationId || c.id === msg.conversationId) {
              return {
                ...c,
                lastMessageId: msg,
                lastMessageAt: msg.createdAt,
                unreadCountAdmin:
                  msg.conversationId === selectedId ? 0 : (c.unreadCountAdmin || 0) + 1,
              };
            }
            return c;
          });
          return { ...old, items: updatedItems };
        },
      );
    };

    const handleConversationUpdated = (data: { conversation: CommunicationConversation }) => {
      if (data?.conversation) {
        queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
        if (data.conversation._id === selectedId || data.conversation.id === selectedId) {
          queryClient.setQueryData(['admin-conversation-details', selectedId], data.conversation);
        }
      }
    };

    const handleHandover = (data: {
      conversationId: string;
      mode: string;
      reason: string;
      conversation?: CommunicationConversation;
    }) => {
      if (data.mode === 'human') {
        toast.info(`Support Request: A customer has requested human assistance!`, {
          duration: 6000,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
      if (data.conversationId === selectedId) {
        queryClient.invalidateQueries({ queryKey: ['admin-conversation-details', selectedId] });
      }
    };

    const onMessageNew = (payload: unknown) => handleNewMessage(payload as CommunicationMessage);
    const onConvUpdated = (payload: unknown) =>
      handleConversationUpdated(payload as { conversation: CommunicationConversation });
    const onHandover = (payload: unknown) =>
      handleHandover(
        payload as {
          conversationId: string;
          mode: string;
          reason: string;
          conversation?: CommunicationConversation;
        },
      );

    socket.on('message:new', onMessageNew as (payload: unknown) => void);
    socket.on('conversation:updated', onConvUpdated as (payload: unknown) => void);
    socket.on('conversation:handover', onHandover as (payload: unknown) => void);

    return () => {
      socket.off('message:new', onMessageNew as (payload: unknown) => void);
      socket.off('conversation:updated', onConvUpdated as (payload: unknown) => void);
      socket.off('conversation:handover', onHandover as (payload: unknown) => void);
      if (selectedId) {
        socket.emit('conversation:leave', { conversationId: selectedId });
      }
    };
  }, [channelFilter, queryClient, searchQuery, selectedId, statusFilter]);

  // 5. Reply Mutation
  const replyMutation = useMutation({
    mutationFn: (content: string) => communicationService.sendStaffReply(selectedId!, content),
    onSuccess: (saved) => {
      queryClient.setQueryData<CommunicationMessage[]>(
        ['admin-conversation-messages', selectedId],
        (old = []) => {
          if (old.some((m) => (m.id || m._id) === (saved.id || saved._id))) return old;
          return [...old, saved];
        },
      );
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
    },
    onError: () => toast.error('Failed to send reply'),
  });

  // 6. Status Mutation
  const statusMutation = useMutation({
    mutationFn: (status: ConversationStatus) =>
      communicationService.updateStatus(selectedId!, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin-conversation-details', selectedId], updated);
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
      toast.success(`Conversation marked as ${updated.status}`);
    },
    onError: () => toast.error('Failed to update status'),
  });

  // 7. Handling Mode Mutation (AI vs Human)
  const modeMutation = useMutation({
    mutationFn: (mode: HandlingMode) => communicationService.setHandlingMode(selectedId!, mode),
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin-conversation-details', selectedId], updated);
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
      toast.success(`Handling mode switched to ${updated.handlingMode.toUpperCase()}`);
    },
    onError: () => toast.error('Failed to switch handling mode'),
  });

  // 8. Staff Assignment Mutation
  const assignMutation = useMutation({
    mutationFn: (assignedTo: string | null) =>
      communicationService.assignStaff(selectedId!, assignedTo),
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin-conversation-details', selectedId], updated);
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
      toast.success('Assignment updated');
    },
    onError: () => toast.error('Failed to assign conversation'),
  });

  const sendReply = useCallback(
    async (content: string) => {
      if (!selectedId || !content.trim()) return;
      return replyMutation.mutateAsync(content.trim());
    },
    [selectedId, replyMutation],
  );

  return {
    conversations,
    selectedId,
    setSelectedId,
    activeConversation: activeConversationQuery.data,
    messages: messagesQuery.data || [],
    isLoadingConversations: conversationsQuery.isLoading,
    isLoadingMessages: messagesQuery.isLoading,
    channelFilter,
    setChannelFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sendReply,
    isSendingReply: replyMutation.isPending,
    updateStatus: statusMutation.mutateAsync,
    setHandlingMode: modeMutation.mutateAsync,
    assignStaff: assignMutation.mutateAsync,
  };
}

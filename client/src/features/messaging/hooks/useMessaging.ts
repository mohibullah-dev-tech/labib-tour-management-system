import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messageService } from '../services/message.service';
import type { MessageRole } from '../types';

export const messagingKeys = {
  conversations: (role: MessageRole) => ['conversations', role] as const,
  conversation: (id: string) => ['conversation', id] as const,
  messages: (id: string) => ['messages', id] as const,
  announcements: (eventId?: string) => ['event-announcements', eventId ?? 'all'] as const,
};

export function useConversations(role: MessageRole) {
  return useQuery({
    queryKey: messagingKeys.conversations(role),
    queryFn: () => messageService.getConversations(role),
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: messagingKeys.conversation(id),
    queryFn: () => messageService.getConversation(id),
    enabled: Boolean(id),
  });
}

export function useEventAnnouncements(eventId?: string) {
  return useQuery({
    queryKey: messagingKeys.announcements(eventId),
    queryFn: () => messageService.getEventAnnouncements(eventId),
  });
}

export function useSendMessage() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: messageService.sendMessage,
    onSuccess: (_, variables) => {
      client.invalidateQueries({ queryKey: messagingKeys.conversations(variables.senderRole) });
      client.invalidateQueries({ queryKey: messagingKeys.conversation(variables.conversationId) });
      client.invalidateQueries({ queryKey: messagingKeys.messages(variables.conversationId) });
    },
  });
}

export function useMarkConversationRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: messageService.markConversationAsRead,
    onSuccess: (_, id) => {
      client.invalidateQueries({ queryKey: ['conversations'] });
      client.invalidateQueries({ queryKey: messagingKeys.conversation(id) });
    },
  });
}

export function useSendAnnouncement() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: messageService.sendAnnouncement,
    onSuccess: (announcement) => {
      client.invalidateQueries({ queryKey: messagingKeys.announcements(announcement.eventId) });
      client.invalidateQueries({ queryKey: messagingKeys.announcements() });
      client.invalidateQueries({ queryKey: ['notifications'] });
      client.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
}

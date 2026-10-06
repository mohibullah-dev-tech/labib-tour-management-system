import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hostService } from '@/features/host/services/host.service';
import type { HostProfile, CheckInStatus, EventLifecycleStatus } from '@/features/host/types';

export const hostQueryKeys = {
  profile: ['host', 'profile'] as const,
  events: ['host', 'events'] as const,
  event: (id: string) => ['host', 'event', id] as const,
  todayEvent: ['host', 'today-event'] as const,
  guests: (eventId?: string) => ['host', 'guests', eventId ?? 'all'] as const,
  conversations: ['host', 'conversations'] as const,
  notifications: ['host', 'notifications'] as const,
};

export function useHostProfile() {
  return useQuery({
    queryKey: hostQueryKeys.profile,
    queryFn: () => hostService.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAssignedEvents() {
  return useQuery({
    queryKey: hostQueryKeys.events,
    queryFn: () => hostService.getAssignedEvents(),
    staleTime: 60 * 1000,
  });
}

export function useAssignedEvent(id: string) {
  return useQuery({
    queryKey: hostQueryKeys.event(id),
    queryFn: () => hostService.getEventById(id),
    enabled: !!id,
  });
}

export function useTodayEvent() {
  return useQuery({
    queryKey: hostQueryKeys.todayEvent,
    queryFn: () => hostService.getTodayEvent(),
    staleTime: 30 * 1000,
  });
}

export function useEventGuests(eventId?: string) {
  return useQuery({
    queryKey: hostQueryKeys.guests(eventId),
    queryFn: () => hostService.getEventGuests(eventId),
    staleTime: 30 * 1000,
  });
}

export function useHostConversations() {
  return useQuery({
    queryKey: hostQueryKeys.conversations,
    queryFn: () => hostService.getConversations(),
    staleTime: 15 * 1000,
  });
}

export function useHostNotifications() {
  return useQuery({
    queryKey: hostQueryKeys.notifications,
    queryFn: () => hostService.getNotifications(),
    staleTime: 30 * 1000,
  });
}

export function useUpdateHostProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<HostProfile>) => hostService.updateProfile(patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(hostQueryKeys.profile, updated);
    },
  });
}

export function useCheckInMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ guestId, status }: { guestId: string; status: CheckInStatus }) =>
      hostService.updateGuestCheckIn(guestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host', 'guests'] });
    },
  });
}

export function useUpdateEventStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: EventLifecycleStatus }) =>
      hostService.updateEventStatus(eventId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hostQueryKeys.events });
      queryClient.invalidateQueries({ queryKey: hostQueryKeys.todayEvent });
      queryClient.invalidateQueries({ queryKey: hostQueryKeys.event(variables.eventId) });
    },
  });
}

export function useUpdateTimelineMilestoneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      milestoneId,
      status,
    }: {
      eventId: string;
      milestoneId: string;
      status: 'completed' | 'current' | 'upcoming';
    }) => hostService.updateTimelineMilestone(eventId, milestoneId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: hostQueryKeys.events });
      queryClient.invalidateQueries({ queryKey: hostQueryKeys.todayEvent });
      queryClient.invalidateQueries({ queryKey: hostQueryKeys.event(variables.eventId) });
    },
  });
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, text }: { conversationId: string; text: string }) =>
      hostService.sendMessage(conversationId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostQueryKeys.conversations });
    },
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hostService.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostQueryKeys.notifications });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => hostService.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostQueryKeys.notifications });
    },
  });
}

export function useReportProblemMutation() {
  return useMutation({
    mutationFn: (data: {
      eventId?: string;
      category: 'breakdown' | 'medical' | 'weather' | 'route_block' | 'other';
      title: string;
      description: string;
      urgency: 'low' | 'medium' | 'high' | 'critical';
    }) => hostService.reportProblem(data),
  });
}

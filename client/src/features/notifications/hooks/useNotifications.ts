import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';

export const notificationKeys = {
  all: ['notifications'] as const,
  unread: ['notifications-unread'] as const,
};

export function useNotifications(userId = 'gst-1') {
  return useQuery({
    queryKey: [...notificationKeys.all, userId],
    queryFn: () => notificationService.getNotifications(userId),
  });
}

export function useUnreadNotificationCount(userId = 'gst-1') {
  return useQuery({
    queryKey: [...notificationKeys.unread, userId],
    queryFn: async () =>
      (await notificationService.getNotifications(userId)).filter((item) => !item.isRead).length,
  });
}

function useNotificationMutation(mutationFn: (id?: string) => Promise<void>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: notificationKeys.all });
      void client.invalidateQueries({ queryKey: notificationKeys.unread });
    },
  });
}

export const useMarkNotificationRead = (_userId = 'gst-1') =>
  useNotificationMutation((id) => notificationService.markAsRead(id!));
export const useMarkAllNotificationsRead = (userId = 'gst-1') =>
  useNotificationMutation(() => notificationService.markAllAsRead(userId));
export const useDismissNotification = (_userId = 'gst-1') =>
  useNotificationMutation((id) => notificationService.dismiss(id!));

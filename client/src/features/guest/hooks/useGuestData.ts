import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestService } from '@/features/guest/services/guest.service';
import type { GuestProfile, GuestReview } from '@/features/guest/types';

export const guestQueryKeys = {
  bookings: ['guest', 'bookings'] as const,
  booking: (id: string) => ['guest', 'booking', id] as const,
  upcomingTour: ['guest', 'upcoming-tour'] as const,
  payments: ['guest', 'payments'] as const,
  notifications: ['guest', 'notifications'] as const,
  profile: ['guest', 'profile'] as const,
  reviews: ['guest', 'reviews'] as const,
};

export function useGuestBookings() {
  return useQuery({
    queryKey: guestQueryKeys.bookings,
    queryFn: () => guestService.getMyBookings(),
    staleTime: 60 * 1000,
  });
}

export function useGuestBooking(id: string) {
  return useQuery({
    queryKey: guestQueryKeys.booking(id),
    queryFn: () => guestService.getBookingById(id),
    enabled: !!id,
  });
}

export function useUpcomingTour() {
  return useQuery({
    queryKey: guestQueryKeys.upcomingTour,
    queryFn: () => guestService.getUpcomingTour(),
    staleTime: 60 * 1000,
  });
}

export function useGuestPayments() {
  return useQuery({
    queryKey: guestQueryKeys.payments,
    queryFn: () => guestService.getMyPayments(),
    staleTime: 60 * 1000,
  });
}

export function useGuestNotifications() {
  return useQuery({
    queryKey: guestQueryKeys.notifications,
    queryFn: () => guestService.getNotifications(),
    staleTime: 30 * 1000,
  });
}

export function useGuestProfile() {
  return useQuery({
    queryKey: guestQueryKeys.profile,
    queryFn: () => guestService.getProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGuestReviews() {
  return useQuery({
    queryKey: guestQueryKeys.reviews,
    queryFn: () => guestService.getReviews(),
    staleTime: 60 * 1000,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<GuestProfile>) => guestService.updateProfile(patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(guestQueryKeys.profile, updated);
    },
  });
}

export function useSubmitReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<GuestReview, 'id' | 'createdAt' | 'isApproved'>) =>
      guestService.submitReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestQueryKeys.reviews });
      queryClient.invalidateQueries({ queryKey: guestQueryKeys.bookings });
      queryClient.invalidateQueries({ queryKey: guestQueryKeys.upcomingTour });
    },
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => guestService.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestQueryKeys.notifications });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => guestService.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestQueryKeys.notifications });
    },
  });
}

export function useCancelBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      guestService.cancelBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestQueryKeys.bookings });
      queryClient.invalidateQueries({ queryKey: guestQueryKeys.upcomingTour });
    },
  });
}

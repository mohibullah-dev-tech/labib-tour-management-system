import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  seatService,
  getOrCreateSeatLockSessionId,
  type EventSeatStatusResponse,
} from '@/features/booking/services/seat.service';
import { extractApiErrorMessage } from '@/lib/axios';
import { toast } from 'sonner';
import { useEventRoom, useSocketEvent } from '@/lib/socket';

export function useEventSeats(eventId?: string) {
  const queryClient = useQueryClient();
  const sessionId = getOrCreateSeatLockSessionId();

  // Join real-time event room to receive live seat updates
  useEventRoom(eventId);

  const queryKey = ['event-seats', eventId, sessionId];

  // Invalidate and refresh seat map on real-time broadcasts
  useSocketEvent(
    'seat:locked',
    (payload) => {
      if (payload.eventId === eventId) {
        queryClient.invalidateQueries({ queryKey: ['event-seats', eventId] });
      }
    },
    [eventId, queryClient],
  );

  useSocketEvent(
    'seat:released',
    (payload) => {
      if (payload.eventId === eventId) {
        queryClient.invalidateQueries({ queryKey: ['event-seats', eventId] });
      }
    },
    [eventId, queryClient],
  );

  useSocketEvent(
    'seat:expired',
    (payload) => {
      if (payload.eventId === eventId) {
        queryClient.invalidateQueries({ queryKey: ['event-seats', eventId] });
      }
    },
    [eventId, queryClient],
  );

  useSocketEvent(
    'seat:booked',
    (payload) => {
      if (payload.eventId === eventId) {
        queryClient.invalidateQueries({ queryKey: ['event-seats', eventId] });
      }
    },
    [eventId, queryClient],
  );

  const seatsQuery = useQuery<EventSeatStatusResponse[]>({
    queryKey,
    queryFn: () => {
      if (!eventId) return [];
      return seatService.getEventSeats(eventId, sessionId);
    },
    enabled: Boolean(eventId),
    refetchInterval: 30_000, // Reduced fallback polling since real-time socket pushes live changes
    staleTime: 5_000,
  });

  const lockMutation = useMutation({
    mutationFn: async (seatNumbers: string[]) => {
      if (!eventId) throw new Error('No event selected');
      return seatService.lockSeats(eventId, seatNumbers, sessionId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-seats', eventId] });
      return data;
    },
    onError: (error) => {
      const msg = extractApiErrorMessage(error, 'Unable to hold requested seats');
      toast.error(msg);
    },
  });

  const releaseMutation = useMutation({
    mutationFn: async (seatNumbers: string[]) => {
      if (!eventId) return { releasedCount: 0 };
      return seatService.releaseSeats(eventId, seatNumbers, sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-seats', eventId] });
    },
    onError: (error) => {
      loggerWarn('Seat release error', error);
    },
  });

  const heartbeatMutation = useMutation({
    mutationFn: async (seatNumbers: string[]) => {
      if (!eventId || !seatNumbers.length) return;
      return seatService.heartbeatSeats(eventId, seatNumbers, sessionId);
    },
    onError: (error) => {
      loggerWarn('Seat heartbeat error', error);
    },
  });

  return {
    seats: seatsQuery.data ?? [],
    isLoading: seatsQuery.isLoading,
    isRefetching: seatsQuery.isRefetching,
    refetchSeats: seatsQuery.refetch,
    lockSeats: lockMutation.mutateAsync,
    isLocking: lockMutation.isPending,
    releaseSeats: releaseMutation.mutateAsync,
    isReleasing: releaseMutation.isPending,
    heartbeat: heartbeatMutation.mutateAsync,
  };
}

function loggerWarn(msg: string, err: unknown) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[LTMS Seat]: ${msg}`, err);
  }
}

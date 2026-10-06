import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationService } from '@/features/host/services/location.service';

export const locationQueryKeys = {
  hostLocation: (eventId?: string) => ['host', 'location', eventId ?? 'current'] as const,
};

export function useHostLocation(eventId?: string) {
  return useQuery({
    queryKey: locationQueryKeys.hostLocation(eventId),
    queryFn: () => locationService.getLocationData(eventId),
    refetchInterval: (query) => {
      // Poll every 5s if active sharing, otherwise 30s
      return query.state.data?.sharingStatus === 'active' ? 5000 : 30000;
    },
  });
}

export function useStartLocationSharingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => locationService.startSharing(eventId),
    onSuccess: (data, eventId) => {
      queryClient.setQueryData(locationQueryKeys.hostLocation(eventId), data);
      queryClient.invalidateQueries({ queryKey: ['host', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['host', 'today-event'] });
    },
  });
}

export function useStopLocationSharingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => locationService.stopSharing(eventId),
    onSuccess: (data, eventId) => {
      queryClient.setQueryData(locationQueryKeys.hostLocation(eventId), data);
      queryClient.invalidateQueries({ queryKey: ['host', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['host', 'today-event'] });
    },
  });
}

export function useTogglePauseSharingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => locationService.togglePauseSharing(eventId),
    onSuccess: (data, eventId) => {
      queryClient.setQueryData(locationQueryKeys.hostLocation(eventId), data);
    },
  });
}

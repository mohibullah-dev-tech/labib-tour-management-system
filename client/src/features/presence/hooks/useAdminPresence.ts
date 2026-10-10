import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { presenceService } from '../services/presence.service';
import type { ActiveUserPresence, PresenceSummary } from '../types/presence.types';

export function useAdminPresence() {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Initial query fetch
  const presenceQuery = useQuery({
    queryKey: ['admin-presence-roster'],
    queryFn: () => presenceService.getActiveUsers(),
    refetchInterval: 15000,
  });

  // 2. Real-time updates via Socket.IO
  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    const handleRoster = (data: { items: ActiveUserPresence[]; summary: PresenceSummary }) => {
      queryClient.setQueryData(['admin-presence-roster'], data);
    };

    socket.on('presence:roster', handleRoster);

    return () => {
      socket.off('presence:roster', handleRoster);
    };
  }, [queryClient]);

  const rawItems = useMemo(() => presenceQuery.data?.items || [], [presenceQuery.data?.items]);
  const summary = presenceQuery.data?.summary || {
    totalOnline: rawItems.length,
    guestsCount: 0,
    hostsCount: 0,
    adminsCount: 0,
    visitorsCount: 0,
  };

  // Filter items by role and search
  const filteredUsers = useMemo(() => {
    return rawItems.filter((user) => {
      const matchesRole =
        roleFilter === 'all' ||
        (roleFilter === 'visitor' && (user.isVisitor || user.role === 'visitor')) ||
        user.role === roleFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        (user.email && user.email.toLowerCase().includes(q)) ||
        (user.currentPath && user.currentPath.toLowerCase().includes(q));

      return matchesRole && matchesSearch;
    });
  }, [rawItems, roleFilter, searchQuery]);

  return {
    users: filteredUsers,
    totalCount: rawItems.length,
    summary,
    isLoading: presenceQuery.isLoading,
    roleFilter,
    setRoleFilter,
    searchQuery,
    setSearchQuery,
    refetch: presenceQuery.refetch,
  };
}

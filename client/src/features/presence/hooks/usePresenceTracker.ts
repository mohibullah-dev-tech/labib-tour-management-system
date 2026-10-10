import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { presenceService } from '../services/presence.service';
import type { PresenceSummary } from '../types/presence.types';

export function usePresenceTracker() {
  const location = useLocation();
  const [realtimeSummary, setRealtimeSummary] = useState<PresenceSummary | null>(null);

  // 1. Initial query fetch
  const summaryQuery = useQuery({
    queryKey: ['presence-summary'],
    queryFn: () => presenceService.getSummary(),
    staleTime: 30000,
  });

  // 2. Real-time updates via Socket.IO
  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    const handleSummary = (summary: PresenceSummary) => {
      setRealtimeSummary(summary);
    };

    socket.on('presence:summary', handleSummary);

    return () => {
      socket.off('presence:summary', handleSummary);
    };
  }, []);

  // 3. Emit route change activity
  useEffect(() => {
    const socket = getSocket();
    if (socket.connected) {
      const isMobile = /mobile|iphone|android|ipod|ipad|windows phone/i.test(navigator.userAgent);
      const isTablet = /tablet|ipad/i.test(navigator.userAgent);
      const device = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';

      socket.emit('presence:activity', {
        currentPath: location.pathname,
        pageTitle: document.title || 'Labib Tour',
        status: 'active',
        device,
      });
    }
  }, [location.pathname]);

  const summary = realtimeSummary ||
    summaryQuery.data || {
      totalOnline: 1,
      guestsCount: 0,
      hostsCount: 0,
      adminsCount: 0,
      visitorsCount: 1,
    };

  return {
    summary,
    isLoading: summaryQuery.isLoading,
  };
}

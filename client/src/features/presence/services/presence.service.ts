import { apiClient } from '@/lib/axios';
import type { ActiveUsersResponse, PresenceSummary } from '../types/presence.types';

export const presenceService = {
  /**
   * Public: Fetches real-time presence summary.
   */
  async getSummary(): Promise<PresenceSummary> {
    const res = await apiClient.get<{ success: boolean; data: PresenceSummary }>(
      '/presence/summary',
    );
    return res.data.data;
  },

  /**
   * Admin only: Fetches active user roster and summary.
   */
  async getActiveUsers(): Promise<ActiveUsersResponse> {
    const res = await apiClient.get<{ success: boolean; data: ActiveUsersResponse }>(
      '/presence/active-users',
    );
    return res.data.data;
  },
};

import { apiClient } from '@/lib/axios';

export interface EventSeatStatusResponse {
  seatNumber: string;
  status: 'available' | 'locked' | 'booked' | 'reserved' | 'blocked';
  lockExpiresAt: string | null;
  lockedByCurrentUser: boolean;
  busId?: string;
  bookingId?: string | null;
}

export interface LockSeatsResult {
  sessionId: string;
  seatNumbers: string[];
  expiresAt: string;
  ttlSeconds: number;
}

const SESSION_STORAGE_KEY = 'ltms_seat_lock_session_id';

/**
 * Returns or initializes a unique session ID for seat locks in sessionStorage.
 * Survives page refreshes while scoping to the current browser tab.
 */
export function getOrCreateSeatLockSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  let id = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

export function clearSeatLockSessionId(): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export const seatService = {
  /**
   * Fetch merged real-time seat statuses for an event from the backend.
   */
  async getEventSeats(eventId: string, sessionId?: string): Promise<EventSeatStatusResponse[]> {
    const sess = sessionId || getOrCreateSeatLockSessionId();
    const res = await apiClient.get<{ success: boolean; data: EventSeatStatusResponse[] }>(
      `/events/${eventId}/seats`,
      { params: { sessionId: sess } },
    );
    return res.data.data;
  },

  /**
   * Request atomic lock on one or more passenger seats.
   */
  async lockSeats(
    eventId: string,
    seatNumbers: string[],
    sessionId?: string,
  ): Promise<LockSeatsResult> {
    const sess = sessionId || getOrCreateSeatLockSessionId();
    const res = await apiClient.post<{ success: boolean; data: LockSeatsResult }>(
      `/events/${eventId}/seats/lock`,
      { seatNumbers, sessionId: sess },
    );
    return res.data.data;
  },

  /**
   * Release owned temporary locks.
   */
  async releaseSeats(
    eventId: string,
    seatNumbers: string[],
    sessionId?: string,
  ): Promise<{ releasedCount: number }> {
    const sess = sessionId || getOrCreateSeatLockSessionId();
    const res = await apiClient.post<{ success: boolean; data: { releasedCount: number } }>(
      `/events/${eventId}/seats/release`,
      { seatNumbers, sessionId: sess },
    );
    return res.data.data;
  },

  /**
   * Extend active seat locks via heartbeat.
   */
  async heartbeatSeats(
    eventId: string,
    seatNumbers: string[],
    sessionId?: string,
  ): Promise<{ extendedCount: number; expiresAt: string }> {
    const sess = sessionId || getOrCreateSeatLockSessionId();
    const res = await apiClient.post<{
      success: boolean;
      data: { extendedCount: number; expiresAt: string };
    }>(`/events/${eventId}/seats/heartbeat`, { seatNumbers, sessionId: sess });
    return res.data.data;
  },

  /**
   * Confirm booking with concurrency protection and idempotency key.
   */
  async confirmBooking<T = unknown>(bookingData: unknown, idempotencyKey?: string): Promise<T> {
    const sess = getOrCreateSeatLockSessionId();
    const headers: Record<string, string> = {
      'x-seat-session-id': sess,
    };
    if (idempotencyKey) {
      headers['idempotency-key'] = idempotencyKey;
    }

    const res = await apiClient.post<{ success: boolean; data: T }>('/bookings', bookingData, {
      headers,
    });
    return res.data.data;
  },
};

import type {
  HostProfile,
  AssignedEvent,
  HostGuest,
  CheckInStatus,
  EventLifecycleStatus,
  HostConversation,
  HostNotification,
} from '@/features/host/types';
import { MOCK_HOST_PROFILE } from '@/features/host/data/mock-host';
import { MOCK_ASSIGNED_EVENTS } from '@/features/host/data/mock-events';
import { MOCK_HOST_GUESTS } from '@/features/host/data/mock-guests';
import { MOCK_HOST_CONVERSATIONS } from '@/features/host/data/mock-messages';
import { MOCK_HOST_NOTIFICATIONS } from '@/features/host/data/mock-notifications';

/**
 * Standard backend API endpoints contract for future backend integration.
 */
export const HOST_ENDPOINTS = {
  profile: '/api/v1/host/profile',
  events: '/api/v1/host/events',
  eventById: (id: string) => `/api/v1/host/events/${id}`,
  eventGuests: (id: string) => `/api/v1/host/events/${id}/guests`,
  guestCheckIn: (guestId: string) => `/api/v1/host/guests/${guestId}/checkin`,
  eventStatus: (id: string) => `/api/v1/host/events/${id}/status`,
  timelineMilestone: (eventId: string, milestoneId: string) =>
    `/api/v1/host/events/${eventId}/timeline/${milestoneId}`,
  conversations: '/api/v1/host/conversations',
  sendMessage: (convId: string) => `/api/v1/host/conversations/${convId}/messages`,
  notifications: '/api/v1/host/notifications',
  markNotificationRead: (id: string) => `/api/v1/host/notifications/${id}/read`,
  markAllNotificationsRead: '/api/v1/host/notifications/read-all',
  reportProblem: '/api/v1/host/reports',
} as const;

const MOCK_DELAY_MS = 250;
function delay(ms = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// In-memory cloneable session states
let profileState: HostProfile = { ...MOCK_HOST_PROFILE };
let eventsState: AssignedEvent[] = [...MOCK_ASSIGNED_EVENTS];
let guestsState: HostGuest[] = [...MOCK_HOST_GUESTS];
let conversationsState: HostConversation[] = [...MOCK_HOST_CONVERSATIONS];
let notificationsState: HostNotification[] = [...MOCK_HOST_NOTIFICATIONS];

export const hostService = {
  /**
   * GET /api/v1/host/profile
   */
  async getProfile(): Promise<HostProfile> {
    await delay();
    return { ...profileState };
  },

  /**
   * PATCH /api/v1/host/profile
   */
  async updateProfile(patch: Partial<HostProfile>): Promise<HostProfile> {
    await delay(350);
    profileState = { ...profileState, ...patch };
    return { ...profileState };
  },

  /**
   * GET /api/v1/host/events
   */
  async getAssignedEvents(): Promise<AssignedEvent[]> {
    await delay();
    return [...eventsState];
  },

  /**
   * GET /api/v1/host/events/:id
   */
  async getEventById(id: string): Promise<AssignedEvent | null> {
    await delay();
    const event = eventsState.find((e) => e.id === id);
    return event ? { ...event } : null;
  },

  /**
   * Returns today's active assigned event
   */
  async getTodayEvent(): Promise<AssignedEvent | null> {
    await delay();
    const todayEvt = eventsState.find((e) => e.isToday) || eventsState[0];
    return todayEvt ? { ...todayEvt } : null;
  },

  /**
   * GET /api/v1/host/events/:id/guests
   */
  async getEventGuests(eventId?: string): Promise<HostGuest[]> {
    await delay();
    void eventId;
    return [...guestsState];
  },

  /**
   * PATCH /api/v1/host/guests/:guestId/checkin
   */
  async updateGuestCheckIn(guestId: string, status: CheckInStatus): Promise<HostGuest> {
    await delay(200);
    const guest = guestsState.find((g) => g.id === guestId);
    if (!guest) throw new Error('Guest not found');

    const updated: HostGuest = {
      ...guest,
      checkInStatus: status,
      checkedInAt: status === 'checked-in' ? new Date().toISOString() : undefined,
    };

    guestsState = guestsState.map((g) => (g.id === guestId ? updated : g));
    return updated;
  },

  /**
   * PATCH /api/v1/host/events/:id/status
   */
  async updateEventStatus(eventId: string, status: EventLifecycleStatus): Promise<AssignedEvent> {
    await delay(300);
    const event = eventsState.find((e) => e.id === eventId);
    if (!event) throw new Error('Event not found');

    const updated: AssignedEvent = {
      ...event,
      status,
    };

    eventsState = eventsState.map((e) => (e.id === eventId ? updated : e));
    return updated;
  },

  /**
   * PATCH /api/v1/host/events/:id/timeline/:milestoneId
   */
  async updateTimelineMilestone(
    eventId: string,
    milestoneId: string,
    status: 'completed' | 'current' | 'upcoming',
  ): Promise<AssignedEvent> {
    await delay(200);
    const event = eventsState.find((e) => e.id === eventId);
    if (!event) throw new Error('Event not found');

    const updatedTimeline = event.timeline.map((m) => {
      if (m.id === milestoneId) {
        return {
          ...m,
          status,
          reachedAt:
            status === 'completed' || status === 'current' ? new Date().toISOString() : undefined,
        };
      }
      return m;
    });

    const updated: AssignedEvent = {
      ...event,
      timeline: updatedTimeline,
    };

    eventsState = eventsState.map((e) => (e.id === eventId ? updated : e));
    return updated;
  },

  /**
   * GET /api/v1/host/conversations
   */
  async getConversations(): Promise<HostConversation[]> {
    await delay();
    return [...conversationsState];
  },

  /**
   * POST /api/v1/host/conversations/:id/messages
   */
  async sendMessage(conversationId: string, text: string): Promise<HostConversation> {
    await delay(200);
    const thread = conversationsState.find((c) => c.id === conversationId);
    if (!thread) throw new Error('Conversation not found');

    const newMsg = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: profileState.id,
      senderName: profileState.fullName,
      senderRole: 'host' as const,
      text,
      timestamp: new Date().toISOString(),
      isRead: true,
    };

    const updatedThread: HostConversation = {
      ...thread,
      lastMessage: text,
      lastMessageTime: newMsg.timestamp,
      messages: [...thread.messages, newMsg],
    };

    conversationsState = conversationsState.map((c) =>
      c.id === conversationId ? updatedThread : c,
    );

    return updatedThread;
  },

  /**
   * GET /api/v1/host/notifications
   */
  async getNotifications(): Promise<HostNotification[]> {
    await delay();
    return [...notificationsState];
  },

  /**
   * PATCH /api/v1/host/notifications/:id/read
   */
  async markNotificationAsRead(id: string): Promise<void> {
    await delay(100);
    notificationsState = notificationsState.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  },

  /**
   * PATCH /api/v1/host/notifications/read-all
   */
  async markAllNotificationsAsRead(): Promise<void> {
    await delay(150);
    notificationsState = notificationsState.map((n) => ({ ...n, isRead: true }));
  },

  /**
   * POST /api/v1/host/reports
   */
  async reportProblem(data: {
    eventId?: string;
    category: 'breakdown' | 'medical' | 'weather' | 'route_block' | 'other';
    title: string;
    description: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<{ reportId: string; success: boolean }> {
    await delay(300);
    void data;
    return {
      reportId: `REP-${Math.floor(100000 + Math.random() * 900000)}`,
      success: true,
    };
  },
};

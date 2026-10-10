/**
 * Predictable room naming helpers for Socket.IO.
 * Enforces standardized namespaces to prevent accidental cross-room leaks.
 */
export const ROOMS = {
  /** Personal user room for direct notifications and targeted alerts */
  user: (userId: string) => `user:${userId}`,

  /** Event wide room for all verified participants (guests, host, admins) */
  event: (eventId: string) => `event:${eventId}`,

  /** Sub-room scoped to guests of a specific event */
  eventGuests: (eventId: string) => `event:${eventId}:guests`,

  /** Sub-room scoped to hosts of a specific event */
  eventHosts: (eventId: string) => `event:${eventId}:hosts`,

  /** Sub-room scoped to admins monitoring a specific event */
  eventAdmins: (eventId: string) => `event:${eventId}:admins`,

  /** Scoped chat room for a conversation between guests, host, and admin */
  conversation: (conversationId: string) => `conversation:${conversationId}`,

  /** Staff / Admin Unified Inbox room for all conversation updates */
  inbox: () => 'inbox:admin',

  /** Live location broadcast room for authorized participants of an event */
  liveLocation: (eventId: string) => `live-location:${eventId}`,

  /** Seat reservation real-time update room for an event */
  seat: (eventId: string) => `seat:${eventId}`,

  /** Operations & Admin room for real-time presence monitoring */
  presenceAdmins: () => 'presence:admins',
} as const;

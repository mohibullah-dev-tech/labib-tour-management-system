import type { UserRole } from '@/constants/index.js';

export interface SocketUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface SocketData {
  user: SocketUser;
  joinedRooms: Set<string>;
}

export type SocketCallback<T = unknown> = (response: {
  success: boolean;
  data?: T;
  error?: {
    code:
      | 'UNAUTHORIZED'
      | 'FORBIDDEN'
      | 'NOT_FOUND'
      | 'VALIDATION_ERROR'
      | 'RATE_LIMITED'
      | 'CONFLICT'
      | 'SERVER_ERROR';
    message: string;
  };
}) => void;

// ==========================================
// Seat Lock Payloads
// ==========================================
export interface SeatLockedPayload {
  eventId: string;
  seats: string[];
  lockedBy: string; // userId or anonymized label
  expiresAt: string;
}

export interface SeatReleasedPayload {
  eventId: string;
  seats: string[];
}

export interface SeatExpiredPayload {
  eventId: string;
  seats: string[];
}

export interface SeatBookedPayload {
  eventId: string;
  seats: string[];
  bookingId?: string;
}

// ==========================================
// Live Location Payloads
// ==========================================
export interface LocationStartPayload {
  eventId: string;
  initialCoords?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    heading?: number | null;
    speed?: number | null;
  };
  timestamp?: number;
}

export interface LocationUpdatePayload {
  eventId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
}

export interface LocationStopPayload {
  eventId: string;
  reason?: 'host_stopped' | 'tour_ended' | 'emergency';
  timestamp?: number;
}

export interface ServerLocationUpdatePayload {
  eventId: string;
  hostId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number | null;
  speed?: number | null;
  status: 'active' | 'inactive' | 'stopped';
  timestamp: string;
}

// ==========================================
// Notification Payloads
// ==========================================
export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  eventId?: string;
  bookingId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

// ==========================================
// Messaging / Chat Payloads
// ==========================================
export interface SendMessagePayload {
  conversationId: string;
  content: string;
  attachments?: Array<{
    name: string;
    url: string;
    mimeType: string;
    sizeBytes?: number;
  }>;
}

export interface MessagePayload {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  attachments?: Array<{
    name: string;
    url: string;
    mimeType: string;
    sizeBytes?: number;
  }>;
  status: 'sent' | 'delivered' | 'seen' | 'failed';
  createdAt: string;
}

export interface EventAnnouncementPayload {
  id: string;
  eventId: string;
  senderId: string;
  title: string;
  message: string;
  createdAt: string;
}

// ==========================================
// Client-to-Server Events
// ==========================================
export interface ClientToServerEvents {
  // Event Room management
  'event:join': (payload: { eventId: string }, callback?: SocketCallback) => void;
  'event:leave': (payload: { eventId: string }, callback?: SocketCallback) => void;

  // Live Location
  'location:start': (payload: LocationStartPayload, callback?: SocketCallback) => void;
  'location:update': (payload: LocationUpdatePayload, callback?: SocketCallback) => void;
  'location:stop': (payload: LocationStopPayload, callback?: SocketCallback) => void;

  // Notifications
  'notification:read': (payload: { id: string }, callback?: SocketCallback) => void;
  'notification:read-all': (callback?: SocketCallback) => void;

  // Messaging
  'conversation:join': (payload: { conversationId: string }, callback?: SocketCallback) => void;
  'conversation:leave': (payload: { conversationId: string }, callback?: SocketCallback) => void;
  'message:send': (
    payload: SendMessagePayload,
    callback?: SocketCallback<{ messageId: string }>,
  ) => void;
  'message:delivered': (payload: { conversationId: string; messageId: string }) => void;
  'message:seen': (payload: { conversationId: string; messageId: string }) => void;
  'message:typing': (payload: { conversationId: string }) => void;
  'message:stop-typing': (payload: { conversationId: string }) => void;
}

// ==========================================
// Server-to-Client Events
// ==========================================
export interface ServerToClientEvents {
  // Live Location
  'location:started': (payload: { eventId: string; hostId: string }) => void;
  'location:update': (payload: ServerLocationUpdatePayload) => void;
  'location:stopped': (payload: { eventId: string; hostId: string; reason?: string }) => void;

  // Seat Locking
  'seat:locked': (payload: SeatLockedPayload) => void;
  'seat:released': (payload: SeatReleasedPayload) => void;
  'seat:expired': (payload: SeatExpiredPayload) => void;
  'seat:booked': (payload: SeatBookedPayload) => void;

  // Notifications
  'notification:new': (payload: NotificationPayload) => void;
  'notification:read': (payload: { id: string }) => void;
  'notification:read-all': () => void;

  // Messaging
  'message:new': (payload: MessagePayload) => void;
  'message:delivered': (payload: { conversationId: string; messageId: string }) => void;
  'message:seen': (payload: { conversationId: string; messageId: string }) => void;
  'message:typing': (payload: { conversationId: string; userId: string; userName: string }) => void;
  'message:stop-typing': (payload: { conversationId: string; userId: string }) => void;

  // Events & Announcements
  'event:announcement': (payload: EventAnnouncementPayload) => void;
  'event:updated': (payload: { eventId: string; type?: string }) => void;

  // General errors
  error: (payload: { code: string; message: string }) => void;
}

export type InterServerEvents = Record<string, never>;

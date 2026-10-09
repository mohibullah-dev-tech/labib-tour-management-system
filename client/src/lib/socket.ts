/**
 * Socket.IO Real-Time Client Singleton & React Hooks
 * Labib Tour Management System (LTMS) — Phase 16
 *
 * Provides authenticated, auto-reconnecting real-time socket connection
 * with TanStack Query integration, room management, and reactive hooks.
 */

import { useEffect, useState, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { env } from '@/config/env';
import { getAccessToken } from '@/features/auth/services/token-manager';

// ==========================================
// Strongly Typed Payloads
// ==========================================

export interface SeatLockedPayload {
  eventId: string;
  seats: string[];
  lockedBy: string;
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

export type SocketCallback<T = unknown> = (response: {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}) => void;

// ==========================================
// Client & Server Socket Events
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

  // Announcements & Updates
  'event:announcement': (payload: EventAnnouncementPayload) => void;
  'event:updated': (payload: { eventId: string; type?: string }) => void;

  error: (payload: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  // Rooms
  'event:join': (payload: { eventId: string }, callback?: SocketCallback) => void;
  'event:leave': (payload: { eventId: string }, callback?: SocketCallback) => void;
  'conversation:join': (payload: { conversationId: string }, callback?: SocketCallback) => void;
  'conversation:leave': (payload: { conversationId: string }, callback?: SocketCallback) => void;

  // Live Location
  'location:start': (
    payload: {
      eventId: string;
      initialCoords?: {
        latitude: number;
        longitude: number;
        accuracy?: number;
        heading?: number | null;
        speed?: number | null;
      };
      timestamp?: number;
    },
    callback?: SocketCallback,
  ) => void;
  'location:update': (
    payload: {
      eventId: string;
      latitude: number;
      longitude: number;
      accuracy?: number;
      heading?: number | null;
      speed?: number | null;
      timestamp?: number;
    },
    callback?: SocketCallback,
  ) => void;
  'location:stop': (
    payload: {
      eventId: string;
      reason?: 'host_stopped' | 'tour_ended' | 'emergency';
      timestamp?: number;
    },
    callback?: SocketCallback,
  ) => void;

  // Notifications
  'notification:read': (payload: { id: string }, callback?: SocketCallback) => void;
  'notification:read-all': (callback?: SocketCallback) => void;

  // Messaging
  'message:send': (
    payload: {
      conversationId: string;
      content: string;
      attachments?: Array<{
        name: string;
        url: string;
        mimeType: string;
        sizeBytes?: number;
      }>;
    },
    callback?: SocketCallback<{ messageId: string }>,
  ) => void;
  'message:delivered': (payload: { conversationId: string; messageId: string }) => void;
  'message:seen': (payload: { conversationId: string; messageId: string }) => void;
  'message:typing': (payload: { conversationId: string }) => void;
  'message:stop-typing': (payload: { conversationId: string }) => void;
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: TypedSocket | null = null;

/**
 * Returns or creates the singleton Socket.IO instance.
 * Automatically equips the current access token and reconnection backoff.
 */
export function getSocket(): TypedSocket {
  if (!socketInstance) {
    const socketUrl = env.socketUrl || 'http://localhost:5000';

    socketInstance = io(socketUrl, {
      auth: (cb) => {
        cb({ token: getAccessToken() || '' });
      },
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    socketInstance.on('connect', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.info('[Socket.IO] Connected successfully:', socketInstance?.id);
      }
    });

    socketInstance.on('disconnect', (reason) => {
      if (process.env.NODE_ENV !== 'production') {
        console.info('[Socket.IO] Disconnected:', reason);
      }
    });

    socketInstance.on('connect_error', (err) => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Socket.IO] Connection error:', err.message);
      }
    });
  }

  return socketInstance;
}

/**
 * Explicitly connects the socket (e.g. after user logs in).
 */
export function connectSocket(): TypedSocket {
  const socket = getSocket();
  const token = getAccessToken();

  // If already connected or connecting
  if (token) {
    socket.auth = { token };
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

/**
 * Disconnects the socket (e.g. on user logout).
 */
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

/**
 * React hook to access socket state and instance.
 */
export function useSocket() {
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    return socketInstance?.connected ?? false;
  });

  useEffect(() => {
    const socket = getSocket();
    const token = getAccessToken();

    if (token && !socket.connected) {
      socket.connect();
    }

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return { socket: getSocket(), isConnected };
}

/**
 * React hook to listen to a specific server-to-client event.
 */
export function useSocketEvent<K extends keyof ServerToClientEvents>(
  event: K,
  handler: ServerToClientEvents[K],
  deps: unknown[] = [],
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = getSocket();

    const listener = (...args: unknown[]) => {
      // @ts-expect-error Type safe spread invocation
      handlerRef.current(...args);
    };

    // @ts-expect-error Type safe event listener binding
    socket.on(event, listener);

    return () => {
      // @ts-expect-error Type safe event listener unbinding
      socket.off(event, listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, ...deps]);
}

/**
 * React hook to join an event room and clean up on unmount.
 */
export function useEventRoom(eventId?: string) {
  useEffect(() => {
    if (!eventId) return;
    const socket = getSocket();

    const joinRoom = () => {
      socket.emit('event:join', { eventId });
    };

    if (socket.connected) {
      joinRoom();
    }

    socket.on('connect', joinRoom);

    return () => {
      socket.off('connect', joinRoom);
      if (socket.connected) {
        socket.emit('event:leave', { eventId });
      }
    };
  }, [eventId]);
}

/**
 * React hook to join a conversation room and clean up on unmount.
 */
export function useConversationRoom(conversationId?: string) {
  useEffect(() => {
    if (!conversationId) return;
    const socket = getSocket();

    const joinRoom = () => {
      socket.emit('conversation:join', { conversationId });
    };

    if (socket.connected) {
      joinRoom();
    }

    socket.on('connect', joinRoom);

    return () => {
      socket.off('connect', joinRoom);
      if (socket.connected) {
        socket.emit('conversation:leave', { conversationId });
      }
    };
  }, [conversationId]);
}

import type { RealtimeEventMap, RealtimeEventName, RealtimeHandler } from '../types/realtime.types';
import { getSocket } from '@/lib/socket';

const listeners = new Map<RealtimeEventName, Set<(payload: never) => void>>();
let connected = false;
let socketCleanupFns: Array<() => void> = [];

/**
 * Real-time event bus bridging the application UI to authenticated Socket.IO events.
 */
export const realtimeService = {
  connect() {
    if (connected) return;
    connected = true;
    const socket = getSocket();

    const onNotificationNew = (payload: unknown) => {
      this.publish('notification:new', payload as RealtimeEventMap['notification:new']);
    };
    const onNotificationRead = (payload: unknown) => {
      this.publish('notification:read', payload as RealtimeEventMap['notification:read']);
    };
    const onNotificationReadAll = () => {
      this.publish('notification:read-all', undefined as RealtimeEventMap['notification:read-all']);
    };
    const onMessageNew = (payload: unknown) => {
      this.publish('message:new', payload as RealtimeEventMap['message:new']);
    };
    const onMessageDelivered = (payload: unknown) => {
      this.publish('message:delivered', payload as RealtimeEventMap['message:delivered']);
    };
    const onMessageSeen = (payload: unknown) => {
      this.publish('message:seen', payload as RealtimeEventMap['message:seen']);
    };
    const onMessageTyping = (payload: unknown) => {
      this.publish('message:typing', payload as RealtimeEventMap['message:typing']);
    };
    const onMessageStopTyping = (payload: unknown) => {
      this.publish('message:stop-typing', payload as RealtimeEventMap['message:stop-typing']);
    };
    const onEventAnnouncement = (payload: unknown) => {
      this.publish('event:announcement', payload as RealtimeEventMap['event:announcement']);
    };
    const onEventUpdated = (payload: unknown) => {
      this.publish('event:updated', payload as RealtimeEventMap['event:updated']);
    };

    socket.on('notification:new', onNotificationNew);
    socket.on('notification:read', onNotificationRead);
    socket.on('notification:read-all', onNotificationReadAll);
    socket.on('message:new', onMessageNew);
    socket.on('message:delivered', onMessageDelivered);
    socket.on('message:seen', onMessageSeen);
    socket.on('message:typing', onMessageTyping);
    socket.on('message:stop-typing', onMessageStopTyping);
    socket.on('event:announcement', onEventAnnouncement);
    socket.on('event:updated', onEventUpdated);

    socketCleanupFns = [
      () => socket.off('notification:new', onNotificationNew),
      () => socket.off('notification:read', onNotificationRead),
      () => socket.off('notification:read-all', onNotificationReadAll),
      () => socket.off('message:new', onMessageNew),
      () => socket.off('message:delivered', onMessageDelivered),
      () => socket.off('message:seen', onMessageSeen),
      () => socket.off('message:typing', onMessageTyping),
      () => socket.off('message:stop-typing', onMessageStopTyping),
      () => socket.off('event:announcement', onEventAnnouncement),
      () => socket.off('event:updated', onEventUpdated),
    ];
  },

  disconnect() {
    connected = false;
    socketCleanupFns.forEach((fn) => fn());
    socketCleanupFns = [];
    listeners.clear();
  },

  isConnected() {
    return connected;
  },

  subscribe<K extends RealtimeEventName>(event: K, handler: RealtimeHandler<K>) {
    const set = listeners.get(event) ?? new Set();
    set.add(handler as (payload: never) => void);
    listeners.set(event, set);
    return () => this.unsubscribe(event, handler);
  },

  unsubscribe<K extends RealtimeEventName>(event: K, handler: RealtimeHandler<K>) {
    listeners.get(event)?.delete(handler as (payload: never) => void);
  },

  publish<K extends RealtimeEventName>(event: K, payload: RealtimeEventMap[K]) {
    listeners.get(event)?.forEach((handler) => handler(payload as never));
  },
};

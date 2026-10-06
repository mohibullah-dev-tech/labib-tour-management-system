import type { RealtimeEventMap, RealtimeEventName, RealtimeHandler } from '../types/realtime.types';

const listeners = new Map<RealtimeEventName, Set<(payload: never) => void>>();
let connected = false;

/** Replace this mock transport with Socket.IO later without changing feature components. */
export const realtimeService = {
  connect() {
    connected = true;
  },
  disconnect() {
    connected = false;
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
    if (!connected) return;
    listeners.get(event)?.forEach((handler) => handler(payload as never));
  },
};

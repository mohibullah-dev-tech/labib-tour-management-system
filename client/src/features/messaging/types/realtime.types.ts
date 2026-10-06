import type { Conversation, EventAnnouncement, Message } from './index';

export interface RealtimeEventMap {
  'notification:new': { id: string };
  'notification:read': { id: string };
  'notification:read-all': undefined;
  'message:new': Message;
  'message:read': { conversationId: string; messageId: string };
  'message:typing': { conversationId: string; userId: string; userName: string };
  'message:stop-typing': { conversationId: string; userId: string };
  'message:delivered': { conversationId: string; messageId: string };
  'message:seen': { conversationId: string; messageId: string };
  'event:announcement': EventAnnouncement;
  'event:joined': { eventId: string; conversation: Conversation };
  'event:updated': { eventId: string };
}

export type RealtimeEventName = keyof RealtimeEventMap;
export type RealtimeHandler<K extends RealtimeEventName> = (payload: RealtimeEventMap[K]) => void;

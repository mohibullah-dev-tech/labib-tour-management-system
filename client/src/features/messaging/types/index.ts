export type MessageRole = 'guest' | 'host' | 'admin';
export type ConversationType = 'guest-host' | 'event' | 'admin';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';

export interface ConversationParticipant {
  id: string;
  name: string;
  role: MessageRole;
  avatarUrl?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: MessageRole;
  content: string;
  createdAt: string;
  status: MessageStatus;
  attachments?: MessageAttachment[];
}

export interface Conversation {
  id: string;
  eventId?: string;
  eventName?: string;
  type: ConversationType;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  messages: Message[];
}

export interface EventAnnouncement {
  id: string;
  eventId: string;
  title: string;
  message: string;
  senderName: string;
  createdAt: string;
  recipients: string;
}

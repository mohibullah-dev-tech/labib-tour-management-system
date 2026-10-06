import type { Conversation, EventAnnouncement, Message, MessageRole } from '../types';
import {
  MOCK_ANNOUNCEMENTS,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGE_EVENTS,
} from '../data/mock-messaging';
import { notificationService } from '@/features/notifications/services/notification.service';

const pause = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));
let conversations = MOCK_CONVERSATIONS.map((item) => ({ ...item, messages: [...item.messages] }));
let announcements = [...MOCK_ANNOUNCEMENTS];

export const messageService = {
  async getConversations(role: MessageRole): Promise<Conversation[]> {
    await pause();
    // Backend must enforce guest.booking.eventId === conversation.eventId and host assignedEventIds.
    // Admin access must also be checked against explicit event permissions; these mock filters are UI only.
    return conversations.filter((conversation) => {
      if (role === 'admin') return true;
      if (role === 'host') return conversation.participants.some((p) => p.role === 'host');
      return conversation.participants.some((p) => p.role === 'guest' && p.id === 'gst-1');
    });
  },
  async getConversation(id: string): Promise<Conversation | null> {
    await pause(100);
    return conversations.find((conversation) => conversation.id === id) ?? null;
  },
  async sendMessage(input: {
    conversationId: string;
    content: string;
    senderId: string;
    senderName: string;
    senderRole: MessageRole;
  }): Promise<Message> {
    await pause(250);
    const conversation = conversations.find((item) => item.id === input.conversationId);
    if (!conversation) throw new Error('Conversation not found');
    if (!input.content.trim()) throw new Error('Message cannot be empty');
    const message: Message = {
      id: `message-${Date.now()}`,
      conversationId: input.conversationId,
      senderId: input.senderId,
      senderName: input.senderName,
      senderRole: input.senderRole,
      content: input.content.trim(),
      createdAt: new Date().toISOString(),
      status: 'sent',
    };
    conversations = conversations.map((item) =>
      item.id === input.conversationId
        ? {
            ...item,
            messages: [...item.messages, message],
            lastMessage: message,
            updatedAt: message.createdAt,
          }
        : item,
    );
    return message;
  },
  async markConversationAsRead(id: string): Promise<void> {
    await pause(80);
    conversations = conversations.map((item) =>
      item.id === id ? { ...item, unreadCount: 0 } : item,
    );
  },
  async getEventAnnouncements(eventId?: string): Promise<EventAnnouncement[]> {
    await pause(120);
    return announcements.filter((item) => !eventId || item.eventId === eventId);
  },
  async sendAnnouncement(
    input: Omit<EventAnnouncement, 'id' | 'createdAt' | 'senderName'> & { senderName: string },
  ): Promise<EventAnnouncement> {
    await pause(220);
    // Backend must verify the current host is assigned to eventId, or the admin has event permission.
    if (!MOCK_MESSAGE_EVENTS.some((event) => event.id === input.eventId))
      throw new Error('Event not found');
    const announcement: EventAnnouncement = {
      ...input,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    announcements = [announcement, ...announcements];
    await notificationService.createAnnouncementNotification({
      eventId: announcement.eventId,
      title: announcement.title,
      message: announcement.message,
    });
    return announcement;
  },
};

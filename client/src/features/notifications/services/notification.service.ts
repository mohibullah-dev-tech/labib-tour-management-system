import { MOCK_APP_NOTIFICATIONS } from '../data/mock-notifications';
import type { AppNotification } from '../types';

const wait = (ms = 140) => new Promise((resolve) => setTimeout(resolve, ms));
let state = [...MOCK_APP_NOTIFICATIONS];

export const notificationService = {
  async getNotifications(userId = 'gst-1'): Promise<AppNotification[]> {
    await wait();
    return state.filter((item) => item.userId === userId);
  },
  async markAsRead(id: string): Promise<void> {
    await wait(70);
    state = state.map((item) => (item.id === id ? { ...item, isRead: true } : item));
  },
  async markAllAsRead(userId = 'gst-1'): Promise<void> {
    await wait(100);
    state = state.map((item) => (item.userId === userId ? { ...item, isRead: true } : item));
  },
  async dismiss(id: string): Promise<void> {
    await wait(70);
    state = state.filter((item) => item.id !== id);
  },
  async createAnnouncementNotification(input: {
    eventId: string;
    title: string;
    message: string;
  }): Promise<AppNotification> {
    await wait(40);
    const item: AppNotification = {
      id: `n-ann-${Date.now()}`,
      userId: 'gst-1',
      type: 'announcement',
      title: input.title,
      message: input.message,
      eventId: input.eventId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    state = [item, ...state];
    return item;
  },
};

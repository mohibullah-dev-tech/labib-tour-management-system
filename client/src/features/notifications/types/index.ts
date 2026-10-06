export type NotificationType =
  'booking' | 'payment' | 'tour' | 'reminder' | 'location' | 'message' | 'system' | 'announcement';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  eventId?: string;
  bookingId?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export type NotificationFilter = 'all' | 'unread' | 'booking' | 'tour' | 'message' | 'system';

import type { Conversation, EventAnnouncement, Message } from '../types';
import { MOCK_ASSIGNED_EVENTS } from '@/features/host/data/mock-events';
import { MOCK_HOST_GUESTS } from '@/features/host/data/mock-guests';

const now = Date.now();
const time = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();
const host = { id: 'u-host-1', name: 'Rahim Ahmed', role: 'host' as const };
const admin = { id: 'u-admin-1', name: 'Central Operations', role: 'admin' as const };
const guests = MOCK_HOST_GUESTS.slice(0, 4);
const sajek = MOCK_ASSIGNED_EVENTS[0];
const cox = MOCK_ASSIGNED_EVENTS[1];

function makeMessage(
  id: string,
  conversationId: string,
  sender: { id: string; name: string; role: 'guest' | 'host' | 'admin' },
  content: string,
  minutesAgo: number,
  status: Message['status'] = 'seen',
): Message {
  return {
    id,
    conversationId,
    senderId: sender.id,
    senderName: sender.name,
    senderRole: sender.role,
    content,
    createdAt: time(minutesAgo),
    status,
  };
}

const farhana = guests[0];
const tanvir = guests[1];
const nusrat = guests[2];
const arif = guests[3];

const extraConversations: Conversation[] = [
  { guest: nusrat, event: cox, text: 'Can you confirm the pickup point for tomorrow?' },
  { guest: arif, event: sajek, text: 'Thank you, we have boarded.' },
].map(({ guest, event, text }, index): Conversation => {
  const id = `conv-${event.id}-${guest.id}`;
  const message = makeMessage(
    `m-extra-${index}`,
    id,
    { id: guest.id, name: guest.fullName, role: 'guest' },
    text,
    60 + index * 20,
    'delivered',
  );
  const conversation: Conversation = {
    id,
    eventId: event.id,
    eventName: event.destination,
    type: 'guest-host' as const,
    participants: [host, { id: guest.id, name: guest.fullName, role: 'guest' as const }],
    lastMessage: message,
    unreadCount: index === 0 ? 1 : 0,
    updatedAt: message.createdAt,
    messages: [message],
  };
  return conversation;
});

const baseConversations: Conversation[] = [
  {
    id: 'conv-sajek-farhana',
    eventId: sajek.id,
    eventName: 'Sajek Valley Tour',
    type: 'guest-host',
    participants: [host, { id: farhana.id, name: farhana.fullName, role: 'guest' }],
    unreadCount: 1,
    updatedAt: time(4),
    messages: [
      makeMessage(
        'm-sf-1',
        'conv-sajek-farhana',
        { id: farhana.id, name: farhana.fullName, role: 'guest' },
        'Where should we board?',
        35,
      ),
      makeMessage(
        'm-sf-2',
        'conv-sajek-farhana',
        host,
        'Please meet me at Sayedabad counter 4. I will share the exact pin shortly.',
        28,
      ),
      makeMessage(
        'm-sf-3',
        'conv-sajek-farhana',
        { id: farhana.id, name: farhana.fullName, role: 'guest' },
        'We are near counter 4 now. Is departure still on time?',
        4,
        'delivered',
      ),
    ],
  },
  {
    id: 'conv-sajek-tanvir',
    eventId: sajek.id,
    eventName: 'Sajek Valley Tour',
    type: 'guest-host',
    participants: [host, { id: tanvir.id, name: tanvir.fullName, role: 'guest' }],
    unreadCount: 0,
    updatedAt: time(23),
    messages: [
      makeMessage(
        'm-st-1',
        'conv-sajek-tanvir',
        { id: tanvir.id, name: tanvir.fullName, role: 'guest' },
        'Does the coach have space for one extra backpack?',
        31,
      ),
      makeMessage(
        'm-st-2',
        'conv-sajek-tanvir',
        host,
        'Yes, the luggage bay has room. Keep valuables with you in the cabin.',
        23,
      ),
    ],
  },
  {
    id: 'conv-admin-rahim',
    eventId: sajek.id,
    eventName: 'Sajek Valley Tour',
    type: 'admin',
    participants: [host, admin],
    unreadCount: 1,
    updatedAt: time(12),
    messages: [
      makeMessage(
        'm-ar-1',
        'conv-admin-rahim',
        admin,
        'Please confirm the guest roll-call before departure.',
        40,
      ),
      makeMessage(
        'm-ar-2',
        'conv-admin-rahim',
        host,
        '22 passengers checked in; the remaining guests are on their way.',
        12,
        'delivered',
      ),
    ],
  },
  ...extraConversations,
];

export const MOCK_CONVERSATIONS: Conversation[] = baseConversations.map((conversation) => ({
  ...conversation,
  lastMessage: conversation.messages[conversation.messages.length - 1],
}));

export const MOCK_ANNOUNCEMENTS: EventAnnouncement[] = [
  {
    id: 'ann-sajek-1',
    eventId: sajek.id,
    title: 'Departure update',
    message: 'Please arrive at Sayedabad counter 4 by 9:15 PM. The coach departs at 10:00 PM.',
    senderName: 'Rahim Ahmed',
    createdAt: time(90),
    recipients: 'All guests',
  },
];

export const MOCK_MESSAGE_EVENTS = MOCK_ASSIGNED_EVENTS;

export const USER_ROLES = ['guest', 'host', 'admin', 'super_admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const TOUR_TYPES = ['day', 'relax', 'premium', 'custom'] as const;
export type TourType = (typeof TOUR_TYPES)[number];

export const EVENT_STATUSES = [
  'draft',
  'published',
  'booking_open',
  'booking_closed',
  'ongoing',
  'completed',
  'cancelled',
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const SEAT_STATUSES = ['available', 'locked', 'booked', 'reserved', 'blocked'] as const;
export type SeatStatus = (typeof SEAT_STATUSES)[number];

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'] as const;
export const BOOKING_PAYMENT_STATUSES = ['unpaid', 'partial', 'paid', 'refunded'] as const;
export const PAYMENT_METHODS = ['cash', 'bank', 'mobile_banking', 'other'] as const;
export const BOOKING_TYPES = ['single', 'couple', 'premium', 'vip'] as const;
export const REVIEW_STATUSES = ['pending', 'approved', 'rejected'] as const;
export const NOTIFICATION_TYPES = [
  'booking',
  'payment',
  'event_update',
  'reminder',
  'promotion',
  'system',
  'message',
] as const;
export const CONVERSATION_TYPES = ['guest-host', 'event', 'admin', 'support'] as const;
export const MESSAGE_STATUSES = ['sent', 'delivered', 'seen', 'failed', 'pending'] as const;
export const LIVE_LOCATION_STATUSES = ['inactive', 'active', 'stopped'] as const;
export const PACKAGE_TIERS = ['single', 'couple', 'premium', 'vip'] as const;
export const DEFAULT_MINIMUM_ADVANCE_PERCENT = 30;

export const COMMUNICATION_CHANNELS = [
  'website',
  'whatsapp',
  'facebook',
  'instagram',
  'telegram',
  'internal',
] as const;
export type CommunicationChannel = (typeof COMMUNICATION_CHANNELS)[number];

export const CONVERSATION_STATUSES = ['open', 'pending', 'resolved', 'closed'] as const;
export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

export const CONVERSATION_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type ConversationPriority = (typeof CONVERSATION_PRIORITIES)[number];

export const HANDLING_MODES = ['ai', 'human'] as const;
export type HandlingMode = (typeof HANDLING_MODES)[number];

export const SENDER_TYPES = ['customer', 'staff', 'ai', 'system'] as const;
export type SenderType = (typeof SENDER_TYPES)[number];

export const PASSENGER_SEAT_NUMBERS = [
  ...'ABCDEFGHIJ'.split('').flatMap((row) => [1, 2, 3, 4].map((position) => `${row}${position}`)),
  ...[1, 2, 3, 4, 5].map((position) => `K${position}`),
];

export interface PassengerSeatLayoutItem {
  seatNumber: string;
  row: string;
  position: number;
  blocksAisle: boolean;
}

export function createStandardPassengerSeatLayout(): PassengerSeatLayoutItem[] {
  return PASSENGER_SEAT_NUMBERS.map((seatNumber) => ({
    seatNumber,
    row: seatNumber.slice(0, 1),
    position: Number(seatNumber.slice(1)),
    blocksAisle: seatNumber === 'K3',
  }));
}

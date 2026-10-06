import type { Role } from '@/features/auth/types/role';

export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'partial' | 'due' | 'refunded';
export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket' | 'Card' | 'Bank Transfer';

export interface HostContact {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  avatarUrl?: string;
  rating?: number;
}

export interface BusDetails {
  busNumber: string;
  name: string;
  acType: 'AC' | 'Non-AC';
}

export interface GuestInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  pickupLocation: string;
}

export interface GuestBooking {
  id: string; // e.g. "LTMS-BK-9481"
  tourId: string;
  tourName: string;
  destination: string;
  coverImage: string;
  departureDate: string; // ISO
  returnDate: string; // ISO
  duration: string; // "3 Days / 2 Nights"
  packageTier: 'single' | 'couple' | 'premium' | 'vip';
  packageName: string;
  seatNumbers: string[]; // ["A3"]
  guestCount: number;
  totalAmount: number;
  receivedAmount: number;
  dueAmount: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  guestInfo: GuestInfo;
  busInfo: BusDetails;
  hostInfo: HostContact;
  meetingPoint: string;
  reportingTime: string;
  departureTime: string;
  emergencyContact: string;
  hasReview: boolean;
  userRating?: number;
  createdAt: string; // ISO
  timeline?: {
    day: number;
    title: string;
    description: string;
    time?: string;
  }[];
}

export interface GuestPayment {
  id: string; // "TXN-83921"
  bookingId: string;
  destination: string;
  amount: number;
  date: string; // ISO
  method: PaymentMethod;
  transactionId: string;
  status: 'success' | 'pending' | 'failed';
}

export interface GuestReview {
  id: string;
  bookingId: string;
  destination: string;
  tourDate: string;
  rating: number; // 1 - 5
  comment: string;
  photos?: string[];
  reviewerName?: string;
  reviewerAvatar?: string;
  createdAt: string; // ISO
  isApproved: boolean;
}

export type NotificationType =
  | 'booking_confirmed'
  | 'payment_received'
  | 'seat_confirmed'
  | 'tour_reminder'
  | 'host_assigned'
  | 'schedule_changed'
  | 'booking_cancelled';

export interface GuestNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO
  isRead: boolean;
  bookingId?: string;
}

export interface GuestProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl?: string;
  emergencyContact: string;
  preferredPickupLocation: string;
  memberSince: string;
  totalToursCompleted: number;
  totalReviewsGiven: number;
  rewardPoints: number;
  role: Role;
}

export type GuestDashboardTab =
  | 'overview'
  | 'bookings'
  | 'upcoming'
  | 'past-tours'
  | 'tickets'
  | 'payments'
  | 'reviews'
  | 'profile'
  | 'support';

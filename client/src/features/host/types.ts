import type { Role } from '@/features/auth/types/role';
import type { BusDetails } from '@/features/guest/types';

export type EventLifecycleStatus =
  'scheduled' | 'preparing' | 'boarding' | 'started' | 'in-progress' | 'completed' | 'cancelled';

export type CheckInStatus = 'not-checked-in' | 'checked-in' | 'absent' | 'cancelled';

export type HostBusSeatStatus = 'available' | 'booked' | 'checked-in' | 'reserved' | 'selected';

export interface HostProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  avatarUrl: string;
  experience: string; // e.g. "5 Years Lead Guide"
  bio: string;
  languages: string[];
  emergencyContact: string;
  totalToursGuided: number;
  assignedEventCount: number;
  rating: number;
  role: Role;
}

export interface HostGuest {
  id: string; // Booking or Guest ID
  bookingId: string;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  packageName: string;
  packageTier: 'single' | 'couple' | 'premium' | 'vip';
  seatNumbers: string[]; // e.g. ["A1", "A2"]
  personCount: number;
  pickupPoint: string;
  paymentStatus: 'paid' | 'partial' | 'due';
  receivedAmount: number;
  totalAmount: number;
  dueAmount: number;
  emergencyContact: string;
  specialNotes?: string;
  checkInStatus: CheckInStatus;
  checkedInAt?: string; // ISO
}

export interface TimelineMilestone {
  id: string;
  time: string; // e.g. "10:00 PM"
  title: string; // e.g. "Sayedabad Bus Terminal Departure"
  location: string; // e.g. "Dhaka"
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  reachedAt?: string; // ISO
  estimatedArrival?: string;
}

export interface AssignedBusInfo extends BusDetails {
  driverName: string;
  driverPhone: string;
  helperName: string;
  helperPhone: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
}

export interface AssignedEvent {
  id: string; // e.g. "EVT-SAJEK-0806"
  tourId: string;
  tourName: string;
  destination: string;
  coverImage: string;
  departureDate: string; // ISO
  returnDate: string; // ISO
  departureTime: string; // "10:00 PM"
  departureLocation: string; // "Sayedabad Bus Terminal, Dhaka"
  duration: string; // "3 Days / 2 Nights"
  bus: AssignedBusInfo;
  hostId: string;
  hostName: string;
  hostPhone: string;
  guestCount: number;
  status: EventLifecycleStatus;
  timeline: TimelineMilestone[];
  emergencyContact: string;
  isToday: boolean;
  meetingPoint: string;
  reportingTime: string; // "09:30 PM"
  notes?: string;
}

export type LocationSharingStatus = 'inactive' | 'active' | 'paused';

export interface HostLocationData {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  speedKmh: number;
  headingDegrees: number;
  lastUpdated: string; // ISO
  sharingStatus: LocationSharingStatus;
  addressPlaceholder: string; // e.g. "Dhaka-Chittagong Highway, near Cumilla Bypass"
  batteryLevel?: number; // e.g. 85%
}

/**
 * Reusable data contract prepared for future guest-facing tracking endpoint:
 * GET /api/events/:eventId/location
 */
export interface GuestFacingLocationResponse {
  eventId: string;
  tourName: string;
  destination: string;
  hostName: string;
  busNumber: string;
  sharingStatus: LocationSharingStatus;
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
    lastUpdated: string;
  } | null;
  progressPercent: number;
  currentMilestone: string;
  nextMilestone: string;
  estimatedArrivalAtNext: string;
}

export interface HostMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'host' | 'guest' | 'admin';
  text: string;
  timestamp: string; // ISO
  isRead: boolean;
}

export interface HostConversation {
  id: string;
  type: 'guest' | 'admin' | 'support';
  participantName: string;
  participantAvatar?: string;
  participantPhone?: string;
  participantRole: string; // "Lead Traveler - Seat A1" or "Operations Dispatch"
  tourName?: string;
  lastMessage: string;
  lastMessageTime: string; // ISO
  unreadCount: number;
  messages: HostMessage[];
}

export type HostNotificationType =
  | 'guest_booking'
  | 'booking_cancellation'
  | 'schedule_change'
  | 'admin_announcement'
  | 'guest_message'
  | 'location_reminder';

export interface HostNotification {
  id: string;
  type: HostNotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO
  isRead: boolean;
  eventId?: string;
  guestId?: string;
  priority?: 'normal' | 'high' | 'urgent';
}

export type HostDashboardTab =
  | 'overview'
  | 'events'
  | 'today'
  | 'guests'
  | 'seats'
  | 'timeline'
  | 'location'
  | 'messages'
  | 'notifications'
  | 'profile'
  | 'support';

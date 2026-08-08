import type { TourCategory } from '@/features/tours/types';

/**
 * Booking data model. Every interface here is shaped to match what the
 * future Booking API will return/accept — this phase implements the
 * full flow against typed mock data (data/*.ts), so connecting a real
 * backend later means swapping the data source, not rewriting any step.
 */

export type BookingStep = 'event' | 'package' | 'bus' | 'seat' | 'details' | 'summary' | 'success';

export const BOOKING_STEPS: { key: BookingStep; label: string }[] = [
  { key: 'event', label: 'Event' },
  { key: 'package', label: 'Package' },
  { key: 'bus', label: 'Bus' },
  { key: 'seat', label: 'Seat' },
  { key: 'details', label: 'Details' },
  { key: 'summary', label: 'Summary' },
];

export type EventStatus = 'open' | 'filling-fast' | 'sold-out' | 'closed';

export type BookingPackageTier = 'single' | 'couple' | 'premium' | 'vip';

export interface BookingPackageOption {
  id: string;
  tier: BookingPackageTier;
  name: string;
  pricePerPersonBDT: number;
  description: string;
  inclusions: string[];
}

export type SeatStatus = 'available' | 'booked' | 'locked' | 'reserved' | 'female-reserved';

export interface Seat {
  id: string; // e.g. "A1"
  status: SeatStatus;
}

export interface SeatRow {
  row: string; // "A".."J" (4 seats each), "K" (5-seat back row)
  seats: Seat[];
}

export interface Bus {
  id: string;
  name: string;
  busNumber: string;
  acType: 'AC' | 'Non-AC';
  totalSeats: number;
  availableSeats: number;
  rows: SeatRow[];
}

/**
 * One event = one bus (business rule) — `busId` always resolves to
 * exactly one Bus in data/buses.ts, never a list to choose between.
 */
export interface BookingEvent {
  id: string;
  tourId: string;
  tourName: string;
  tourCategory: TourCategory;
  destination: string;
  coverImage: string;
  departureDate: string; // ISO
  durationDays: number;
  durationNights: number;
  busId: string;
  startingPriceBDT: number;
  availableSeats: number;
  totalSeats: number;
  status: EventStatus;
  packages: BookingPackageOption[];
}

export interface GuestFormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  pickupLocation: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  specialNotes: string;
}

export const EMPTY_GUEST_FORM: GuestFormData = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  pickupLocation: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  specialNotes: '',
};

export interface PricingBreakdown {
  guestCount: number;
  pricePerPerson: number;
  subtotal: number;
  discount: number;
  total: number;
  minimumAdvance: number;
  receivedAmount: number;
  dueAmount: number;
}

import type { LucideIcon } from 'lucide-react';
import type { TourCategory } from '@/features/tours/types';

/**
 * Admin data model. These types establish the shape of every admin
 * entity — Tour Templates, Events, Buses, Hosts, Bookings, Guests,
 * Reviews, Gallery items, Settings — even though this phase only builds
 * full CRUD UI for the Dashboard Overview. Each type here doubles as the
 * "Future Database Collections" reference (see docs/ADMIN_DASHBOARD.md):
 * a backend collection/table should mirror the fields below closely.
 */

// ---------------------------------------------------------------------
// Dashboard Overview
// ---------------------------------------------------------------------

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  /** Placeholder trend indicator — real value once historical data exists to compare against. */
  change?: { value: string; direction: 'up' | 'down' };
}

export interface ChartSeriesPoint {
  label: string;
  value: number;
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'payment' | 'review' | 'guest' | 'event';
  message: string;
  timestamp: string; // ISO
}

// ---------------------------------------------------------------------
// Tour Template Management
// ---------------------------------------------------------------------

export type TemplateStatus = 'published' | 'draft' | 'archived';

export interface TourTemplate {
  id: string;
  name: string;
  destination: string;
  category: TourCategory;
  durationDays: number;
  durationNights: number;
  status: TemplateStatus;
  coverImage: string;
  foodMenuCount: number;
  includesCount: number;
  excludesCount: number;
  placesCount: number;
  routeStopCount: number;
  galleryCount: number;
  updatedAt: string; // ISO
}

// ---------------------------------------------------------------------
// Tour Event Management
// ---------------------------------------------------------------------

export type AdminEventStatus =
  'draft' | 'booking-open' | 'booking-closed' | 'completed' | 'cancelled';

export interface TourEventAdmin {
  id: string;
  templateId: string;
  templateName: string;
  destination: string;
  departureDate: string; // ISO
  busId: string;
  busName: string;
  hostId: string;
  hostName: string;
  capacity: number;
  bookedSeats: number;
  bookingOpensAt: string; // ISO
  bookingClosesAt: string; // ISO
  status: AdminEventStatus;
}

// ---------------------------------------------------------------------
// Bus Management
// ---------------------------------------------------------------------

export type BusStatus = 'active' | 'maintenance' | 'inactive';

export interface BusAdmin {
  id: string;
  busNumber: string;
  busType: string;
  acType: 'AC' | 'Non-AC';
  seatCapacity: number;
  driverName: string;
  driverPhone: string;
  helperName: string;
  status: BusStatus;
}

// ---------------------------------------------------------------------
// Host Management
// ---------------------------------------------------------------------

export type HostAvailability = 'available' | 'assigned' | 'unavailable';

export interface HostAdmin {
  id: string;
  name: string;
  photo: string;
  phone: string;
  whatsapp: string;
  experienceYears: number;
  assignedEventCount: number;
  availability: HostAvailability;
}

// ---------------------------------------------------------------------
// Booking Management
// ---------------------------------------------------------------------

export type AdminBookingStatus = 'pending' | 'approved' | 'cancelled' | 'completed';
export type AdminPaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface BookingAdmin {
  id: string;
  bookingCode: string;
  guestName: string;
  guestPhone: string;
  eventId: string;
  eventName: string;
  seatIds: string[];
  packageName: string;
  totalAmountBDT: number;
  receivedAmountBDT: number;
  bookingStatus: AdminBookingStatus;
  paymentStatus: AdminPaymentStatus;
  createdAt: string; // ISO
}

// ---------------------------------------------------------------------
// Guest Management
// ---------------------------------------------------------------------

export interface GuestAdmin {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalToursCompleted: number;
  upcomingTourCount: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

// ---------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------

export type ReviewModerationStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewAdmin {
  id: string;
  guestName: string;
  tourName: string;
  rating: number;
  comment: string;
  status: ReviewModerationStatus;
  isFeatured: boolean;
  submittedAt: string; // ISO
}

// ---------------------------------------------------------------------
// Gallery Management
// ---------------------------------------------------------------------

export interface GalleryItemAdmin {
  id: string;
  image: string;
  destination: string;
  isFeatured: boolean;
  uploadedAt: string; // ISO
}

// ---------------------------------------------------------------------
// Settings (Business Rules + Company Info)
// ---------------------------------------------------------------------

export interface MinimumAdvanceSettings {
  day: number;
  relax: number;
  premium: number;
  seasonal: number;
}

export interface CompanySettings {
  companyName: string;
  logoUrl: string;
  faviconUrl: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  socialLinks: { platform: string; url: string }[];
  minimumAdvance: MinimumAdvanceSettings;
}

// ---------------------------------------------------------------------
// Website Content
// ---------------------------------------------------------------------

export interface WebsiteFaqEntry {
  id: string;
  question: string;
  answer: string;
}

export interface WebsiteContentSettings {
  heroHeadline: string;
  heroSubheadline: string;
  heroBackgroundImage: string;
  statGuests: string;
  statTours: string;
  statDestinations: string;
  statRating: string;
  faq: WebsiteFaqEntry[];
  aboutTitle: string;
  aboutBody: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  footerDescription: string;
  footerCopyright: string;
}

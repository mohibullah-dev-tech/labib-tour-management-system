import type {
  GuestBooking,
  GuestPayment,
  GuestProfile,
  GuestReview,
  GuestNotification,
} from '@/features/guest/types';
import { MOCK_GUEST_PROFILE } from '@/features/guest/data/mock-guest';
import { MOCK_GUEST_BOOKINGS } from '@/features/guest/data/mock-bookings';
import { MOCK_GUEST_PAYMENTS } from '@/features/guest/data/mock-payments';
import { MOCK_GUEST_NOTIFICATIONS } from '@/features/guest/data/mock-notifications';
import { MOCK_GUEST_REVIEWS } from '@/features/guest/data/mock-reviews';

/**
 * Standard backend API endpoints contract for future backend integration.
 */
export const GUEST_ENDPOINTS = {
  myBookings: '/api/v1/bookings/my',
  bookingById: (id: string) => `/api/v1/bookings/${id}`,
  upcomingTour: '/api/v1/tours/upcoming',
  myPayments: '/api/v1/payments/my',
  notifications: '/api/v1/notifications',
  markNotificationRead: (id: string) => `/api/v1/notifications/${id}/read`,
  markAllNotificationsRead: '/api/v1/notifications/read-all',
  profile: '/api/v1/profile',
  reviews: '/api/v1/reviews',
  cancelBooking: (id: string) => `/api/v1/bookings/${id}/cancel`,
} as const;

const MOCK_DELAY_MS = 250;
function delay(ms = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// In-memory clones for local session manipulation
let bookingsState: GuestBooking[] = [...MOCK_GUEST_BOOKINGS];
const paymentsState: GuestPayment[] = [...MOCK_GUEST_PAYMENTS];
let notificationsState: GuestNotification[] = [...MOCK_GUEST_NOTIFICATIONS];
let reviewsState: GuestReview[] = [...MOCK_GUEST_REVIEWS];
let profileState: GuestProfile = { ...MOCK_GUEST_PROFILE };

export const guestService = {
  /**
   * GET /api/v1/bookings/my
   */
  async getMyBookings(): Promise<GuestBooking[]> {
    await delay();
    return [...bookingsState];
  },

  /**
   * GET /api/v1/bookings/:id
   */
  async getBookingById(id: string): Promise<GuestBooking | null> {
    await delay();
    const found = bookingsState.find((b) => b.id === id);
    return found ? { ...found } : null;
  },

  /**
   * GET /api/v1/tours/upcoming
   * Returns earliest upcoming confirmed tour
   */
  async getUpcomingTour(): Promise<GuestBooking | null> {
    await delay();
    const upcoming = bookingsState
      .filter((b) => b.bookingStatus === 'confirmed' && new Date(b.departureDate) > new Date())
      .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime());
    return upcoming[0] ? { ...upcoming[0] } : null;
  },

  /**
   * GET /api/v1/payments/my
   */
  async getMyPayments(): Promise<GuestPayment[]> {
    await delay();
    return [...paymentsState];
  },

  /**
   * GET /api/v1/notifications
   */
  async getNotifications(): Promise<GuestNotification[]> {
    await delay();
    return [...notificationsState];
  },

  /**
   * PATCH /api/v1/notifications/:id/read
   */
  async markNotificationAsRead(id: string): Promise<void> {
    await delay(100);
    notificationsState = notificationsState.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  },

  /**
   * PATCH /api/v1/notifications/read-all
   */
  async markAllNotificationsAsRead(): Promise<void> {
    await delay(150);
    notificationsState = notificationsState.map((n) => ({ ...n, isRead: true }));
  },

  /**
   * GET /api/v1/profile
   */
  async getProfile(): Promise<GuestProfile> {
    await delay();
    return { ...profileState };
  },

  /**
   * PATCH /api/v1/profile
   */
  async updateProfile(patch: Partial<GuestProfile>): Promise<GuestProfile> {
    await delay(350);
    profileState = { ...profileState, ...patch };
    return { ...profileState };
  },

  /**
   * GET /api/v1/reviews
   */
  async getReviews(): Promise<GuestReview[]> {
    await delay();
    return [...reviewsState];
  },

  /**
   * POST /api/v1/reviews
   */
  async submitReview(
    data: Omit<GuestReview, 'id' | 'createdAt' | 'isApproved'>,
  ): Promise<GuestReview> {
    await delay(400);
    const newReview: GuestReview = {
      ...data,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isApproved: true,
    };
    reviewsState = [newReview, ...reviewsState];

    // Mark the booking as reviewed
    bookingsState = bookingsState.map((b) =>
      b.id === data.bookingId ? { ...b, hasReview: true, userRating: data.rating } : b,
    );

    return newReview;
  },

  /**
   * POST /api/v1/bookings/:id/cancel
   */
  async cancelBooking(id: string, reason?: string): Promise<GuestBooking> {
    await delay(300);
    void reason;
    const booking = bookingsState.find((b) => b.id === id);
    if (!booking) throw new Error('Booking not found');
    const updated: GuestBooking = {
      ...booking,
      bookingStatus: 'cancelled',
    };
    bookingsState = bookingsState.map((b) => (b.id === id ? updated : b));
    return updated;
  },
};

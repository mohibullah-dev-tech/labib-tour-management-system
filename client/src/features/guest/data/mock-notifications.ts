import type { GuestNotification } from '@/features/guest/types';

export const MOCK_GUEST_NOTIFICATIONS: GuestNotification[] = [
  {
    id: 'notif-1',
    type: 'tour_reminder',
    title: 'Tour Reminder: Sajek Valley in 5 Days!',
    message:
      'Get ready for your journey to Sajek Valley. Please report to Abdullahpur counter by 09:30 PM.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: false,
    bookingId: 'LTMS-BK-8941',
  },
  {
    id: 'notif-2',
    type: 'host_assigned',
    title: 'Tour Host Assigned',
    message:
      'Rahim Uddin has been assigned as your lead tour guide for Sajek Valley. Feel free to contact via WhatsApp.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: false,
    bookingId: 'LTMS-BK-8941',
  },
  {
    id: 'notif-3',
    type: 'payment_received',
    title: 'Payment Received: ৳7,000',
    message: "Partial payment of ৳7,000 for Cox's Bazar tour received successfully via Nagad.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    bookingId: 'LTMS-BK-9102',
  },
  {
    id: 'notif-4',
    type: 'seat_confirmed',
    title: 'Seat Selection Confirmed',
    message: 'Your seats A3 and A4 have been locked and confirmed for the Sajek Valley AC Bus.',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    bookingId: 'LTMS-BK-8941',
  },
  {
    id: 'notif-5',
    type: 'booking_confirmed',
    title: 'Booking Confirmed!',
    message:
      'Your booking LTMS-BK-8941 for Sajek Valley has been confirmed. You can now download your digital ticket.',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    bookingId: 'LTMS-BK-8941',
  },
  {
    id: 'notif-6',
    type: 'schedule_changed',
    title: 'Departure Timing Updated',
    message:
      "Reporting time for Cox's Bazar has been finalized to 10:30 PM due to highway traffic regulations.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    bookingId: 'LTMS-BK-9102',
  },
];

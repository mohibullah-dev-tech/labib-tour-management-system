import type { HostNotification } from '@/features/host/types';

export const MOCK_HOST_NOTIFICATIONS: HostNotification[] = [
  {
    id: 'hnotif-1',
    type: 'location_reminder',
    title: 'Activate Live Location Sharing',
    message:
      'Departure time is approaching in 45 minutes for Sajek Valley. Please enable location sharing for boarding passengers.',
    timestamp: '2026-10-06T15:15:00Z',
    isRead: false,
    priority: 'urgent',
    eventId: 'EVT-SAJEK-0806',
  },
  {
    id: 'hnotif-2',
    type: 'guest_message',
    title: 'New Message from Farhana Akter',
    message: '"We are near Sayedabad counter 4. Is the bus departure on time?"',
    timestamp: '2026-10-06T15:45:00Z',
    isRead: false,
    priority: 'normal',
    guestId: 'gst-1',
  },
  {
    id: 'hnotif-3',
    type: 'schedule_change',
    title: 'Army Escort Schedule Updated',
    message:
      'Baghaihat military checkpoint convoy will depart at 10:30 AM tomorrow instead of 10:00 AM.',
    timestamp: '2026-10-06T14:15:00Z',
    isRead: false,
    priority: 'high',
    eventId: 'EVT-SAJEK-0806',
  },
  {
    id: 'hnotif-4',
    type: 'guest_booking',
    title: 'Late Booking Confirmed: Seats H1, H2',
    message:
      'Ashiqur Rahman confirmed booking LTMS-BK-9496 with full payment. Passenger boarding from Arambagh.',
    timestamp: '2026-10-06T13:20:00Z',
    isRead: true,
    priority: 'normal',
    eventId: 'EVT-SAJEK-0806',
  },
  {
    id: 'hnotif-5',
    type: 'admin_announcement',
    title: 'Monsoon Kit Distribution Required',
    message:
      'Operations has provided 35 rain ponchos and heavy-duty backpack covers in the luggage compartment of LABIB-01.',
    timestamp: '2026-10-06T11:00:00Z',
    isRead: true,
    priority: 'normal',
  },
  {
    id: 'hnotif-6',
    type: 'booking_cancellation',
    title: 'Booking Cancelled: Seats K4, K5',
    message:
      'Booking LTMS-BK-9475 was cancelled by central admin due to guest medical emergency. Seats released.',
    timestamp: '2026-10-06T09:30:00Z',
    isRead: true,
    priority: 'normal',
    eventId: 'EVT-SAJEK-0806',
  },
];

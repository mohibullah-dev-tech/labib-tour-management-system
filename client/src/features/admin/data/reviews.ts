import type { ReviewAdmin } from '@/features/admin/types';

export const ADMIN_REVIEWS: ReviewAdmin[] = [
  {
    id: 'arev-1',
    guestName: 'Farhana Akter',
    tourName: 'Sajek Valley Tour',
    rating: 5,
    comment: 'Flawlessly organized — comfortable bus, great host, and the resort view was unreal.',
    status: 'approved',
    isFeatured: true,
    submittedAt: '2026-06-14T10:00:00+06:00',
  },
  {
    id: 'arev-2',
    guestName: 'Imran Kabir',
    tourName: 'Sajek Valley Tour',
    rating: 5,
    comment: 'The Premium package was worth every taka. Private jeep saved so much time.',
    status: 'approved',
    isFeatured: false,
    submittedAt: '2026-05-04T09:30:00+06:00',
  },
  {
    id: 'arev-3',
    guestName: 'Nusrat Jahan',
    tourName: "Cox's Bazar Beach Tour",
    rating: 4,
    comment:
      'Great value for the price. Return bus was a bit delayed, but the team kept us updated.',
    status: 'pending',
    isFeatured: false,
    submittedAt: '2026-08-08T08:10:00+06:00',
  },
  {
    id: 'arev-4',
    guestName: 'Anonymous Guest',
    tourName: 'Bandarban Hill Trekking',
    rating: 2,
    comment: 'This review contains promotional links unrelated to the trip.',
    status: 'rejected',
    isFeatured: false,
    submittedAt: '2026-08-01T12:00:00+06:00',
  },
  {
    id: 'arev-5',
    guestName: 'Rakibul Islam',
    tourName: 'Tanguar Haor Boat Tour',
    rating: 5,
    comment:
      'Second time booking with Labib Tour. The sunrise boat trip alone was worth the journey.',
    status: 'pending',
    isFeatured: false,
    submittedAt: '2026-08-07T19:45:00+06:00',
  },
];

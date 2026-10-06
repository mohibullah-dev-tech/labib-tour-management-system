import type { GuestReview } from '@/features/guest/types';

export const MOCK_GUEST_REVIEWS: GuestReview[] = [
  {
    id: 'rev-1',
    bookingId: 'LTMS-BK-7320',
    destination: 'Sreemangal, Sylhet',
    tourDate: 'August 2026',
    rating: 5,
    comment:
      'Amazing management by Labib Tours! The eco-resort was peaceful, food was delicious, and host Rahim bhai made sure everyone was safe and entertained.',
    photos: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80',
    ],
    createdAt: '2026-08-06T10:00:00Z',
    isApproved: true,
  },
];

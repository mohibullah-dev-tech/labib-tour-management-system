export interface GuestReview {
  id: string;
  name: string;
  location: string;
  avatarSeed: string;
  rating: number;
  comment: string;
  tour: string;
}

export const GUEST_REVIEWS: GuestReview[] = [
  {
    id: 'rev-1',
    name: 'Farhana Akter',
    location: 'Dhaka',
    avatarSeed: 'farhana',
    rating: 5,
    comment:
      'The Sajek trip was flawlessly organized — comfortable bus, great host, and the resort view was unreal. Booking again for Bandarban.',
    tour: 'Sajek Valley Tour',
  },
  {
    id: 'rev-2',
    name: 'Tanvir Ahmed',
    location: 'Chattogram',
    avatarSeed: 'tanvir',
    rating: 5,
    comment:
      'Our guide knew every trail in Bandarban by heart. Felt completely safe even on the harder treks. Highly recommend for group trips.',
    tour: 'Bandarban Hill Trekking',
  },
  {
    id: 'rev-3',
    name: 'Nusrat Jahan',
    location: 'Sylhet',
    avatarSeed: 'nusrat',
    rating: 4,
    comment:
      "Cox's Bazar package was great value for the price. Only the return bus was a bit delayed, but the team kept us updated throughout.",
    tour: "Cox's Bazar Weekend Getaway",
  },
  {
    id: 'rev-4',
    name: 'Rakibul Islam',
    location: 'Rajshahi',
    avatarSeed: 'rakibul',
    rating: 5,
    comment:
      'Second time booking with Labib Tour. The Tanguar Haor boat trip at sunrise alone was worth the whole journey.',
    tour: 'Tanguar Haor Boat Tour',
  },
];

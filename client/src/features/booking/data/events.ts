import type { BookingEvent, BookingPackageOption } from '@/features/booking/types';

const img = (seed: string) => `https://picsum.photos/seed/${seed}/700/500`;

/** Generates the standard 4-tier package lineup, priced off each event's base price. */
function buildPackages(basePrice: number): BookingPackageOption[] {
  return [
    {
      id: 'pkg-single',
      tier: 'single',
      name: 'Single Package',
      pricePerPersonBDT: basePrice,
      description: 'Solo travelers, shared accommodation.',
      inclusions: ['Bus fare', 'Shared room', 'Breakfast', 'Guide'],
    },
    {
      id: 'pkg-couple',
      tier: 'couple',
      name: 'Couple Package',
      pricePerPersonBDT: Math.round(basePrice * 0.92),
      description: 'Private room for two, priced per person.',
      inclusions: ['Bus fare', 'Private room', 'All meals', 'Guide'],
    },
    {
      id: 'pkg-premium',
      tier: 'premium',
      name: 'Premium Package',
      pricePerPersonBDT: Math.round(basePrice * 1.45),
      description: 'Upgraded accommodation with private transfers.',
      inclusions: [
        'AC bus fare',
        'Upgraded room',
        'All meals',
        'Private transfer',
        'Dedicated guide',
      ],
    },
    {
      id: 'pkg-vip',
      tier: 'vip',
      name: 'VIP Package',
      pricePerPersonBDT: Math.round(basePrice * 2.1),
      description: 'Best available room, priority service throughout.',
      inclusions: [
        'AC bus fare',
        'Best available room',
        'All meals',
        'Private vehicle',
        'Priority check-in',
        '24/7 dedicated support',
      ],
    },
  ];
}

/**
 * Placeholder events — each references a real busId from data/buses.ts
 * (one event = one bus) and a tourId matching the Tours module where the
 * destination overlaps, so a future backend can join the two naturally.
 */
export const BOOKING_EVENTS: BookingEvent[] = [
  {
    id: 'evt-sajek-sep',
    tourId: 'sajek-valley',
    tourName: 'Sajek Valley Tour',
    tourCategory: 'premium',
    destination: 'Sajek Valley',
    coverImage: img('ltms-booking-sajek'),
    departureDate: '2026-09-18',
    durationDays: 3,
    durationNights: 2,
    busId: 'bus-sajek-01',
    startingPriceBDT: 4500,
    availableSeats: 31,
    totalSeats: 45,
    status: 'open',
    packages: buildPackages(4500),
  },
  {
    id: 'evt-coxsbazar-sep',
    tourId: 'coxs-bazar',
    tourName: "Cox's Bazar Beach Tour",
    tourCategory: 'relax',
    destination: "Cox's Bazar",
    coverImage: img('ltms-booking-coxsbazar'),
    departureDate: '2026-09-25',
    durationDays: 4,
    durationNights: 3,
    busId: 'bus-coxsbazar-01',
    startingPriceBDT: 6000,
    availableSeats: 31,
    totalSeats: 45,
    status: 'filling-fast',
    packages: buildPackages(6000),
  },
  {
    id: 'evt-bandarban-oct',
    tourId: 'bandarban',
    tourName: 'Bandarban Hill Trekking',
    tourCategory: 'premium',
    destination: 'Bandarban',
    coverImage: img('ltms-booking-bandarban'),
    departureDate: '2026-10-09',
    durationDays: 4,
    durationNights: 3,
    busId: 'bus-bandarban-01',
    startingPriceBDT: 5800,
    availableSeats: 31,
    totalSeats: 45,
    status: 'filling-fast',
    packages: buildPackages(5800),
  },
  {
    id: 'evt-sylhet-oct',
    tourId: 'sylhet',
    tourName: 'Sylhet City & Nature Tour',
    tourCategory: 'relax',
    destination: 'Sylhet',
    coverImage: img('ltms-booking-sylhet'),
    departureDate: '2026-10-16',
    durationDays: 3,
    durationNights: 2,
    busId: 'bus-sylhet-01',
    startingPriceBDT: 5200,
    availableSeats: 31,
    totalSeats: 45,
    status: 'open',
    packages: buildPackages(5200),
  },
];

export function getEventById(eventId: string): BookingEvent | undefined {
  return BOOKING_EVENTS.find((e) => e.id === eventId);
}

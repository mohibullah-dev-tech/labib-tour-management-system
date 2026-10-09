export interface UpcomingEvent {
  id: string;
  title: string;
  destination: string;
  date: string; // ISO date — formatted for display at the component layer, not here
  priceBDT: number;
  totalSeats: number;
  availableSeats: number;
  durationDays: number;
  busType: string;
  image: string;
  slug?: string;
  packages?: string[];
  isDemo?: boolean;
}

const img = (seed: string) => `https://picsum.photos/seed/${seed}/700/500`;

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: 'evt-sajek-eid',
    title: 'Sajek Valley Eid Special Tour',
    destination: 'Sajek Valley',
    date: '2026-10-24',
    priceBDT: 4800,
    totalSeats: 45,
    availableSeats: 12,
    durationDays: 3,
    busType: 'Scania AC Coach',
    image: img('ltms-event-sajek'),
    slug: 'sajek-valley-relax',
    packages: ['Single', 'Couple', 'Premium'],
    isDemo: true,
  },
  {
    id: 'evt-coxsbazar-weekend',
    title: "Cox's Bazar Weekend Getaway",
    destination: "Cox's Bazar",
    date: '2026-10-31',
    priceBDT: 6200,
    totalSeats: 45,
    availableSeats: 27,
    durationDays: 3,
    busType: 'Hyundai AC Coach',
    image: img('ltms-event-coxsbazar'),
    slug: 'coxs-bazar-beach-retreat',
    packages: ['Couple', 'Family', 'VIP'],
    isDemo: true,
  },
  {
    id: 'evt-bandarban-trek',
    title: 'Bandarban Hill Trekking Adventure',
    destination: 'Bandarban',
    date: '2026-11-07',
    priceBDT: 5800,
    totalSeats: 45,
    availableSeats: 6,
    durationDays: 4,
    busType: 'Hino 1J AC Coach',
    image: img('ltms-event-bandarban'),
    slug: 'bandarban-hill-trails',
    packages: ['Single', 'Adventure'],
    isDemo: true,
  },
  {
    id: 'evt-sylhet-tea',
    title: 'Sylhet Tea Garden & Waterfall Trip',
    destination: 'Sylhet',
    date: '2026-11-14',
    priceBDT: 5300,
    totalSeats: 45,
    availableSeats: 34,
    durationDays: 3,
    busType: 'Scania AC Coach',
    image: img('ltms-event-sylhet'),
    slug: 'sylhet-nature-escape',
    packages: ['Single', 'Couple'],
    isDemo: true,
  },
];

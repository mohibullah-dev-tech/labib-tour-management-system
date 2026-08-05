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
}

const img = (seed: string) => `https://picsum.photos/seed/${seed}/700/500`;

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: 'evt-sajek-eid',
    title: 'Sajek Valley Eid Special Tour',
    destination: 'Sajek Valley',
    date: '2026-09-18',
    priceBDT: 4800,
    totalSeats: 40,
    availableSeats: 12,
    durationDays: 3,
    busType: 'AC Coaster',
    image: img('ltms-event-sajek'),
  },
  {
    id: 'evt-coxsbazar-weekend',
    title: "Cox's Bazar Weekend Getaway",
    destination: "Cox's Bazar",
    date: '2026-09-25',
    priceBDT: 6200,
    totalSeats: 45,
    availableSeats: 27,
    durationDays: 3,
    busType: 'Non-AC Bus',
    image: img('ltms-event-coxsbazar'),
  },
  {
    id: 'evt-bandarban-trek',
    title: 'Bandarban Hill Trekking Adventure',
    destination: 'Bandarban',
    date: '2026-10-09',
    priceBDT: 5800,
    totalSeats: 30,
    availableSeats: 6,
    durationDays: 4,
    busType: 'AC Coaster',
    image: img('ltms-event-bandarban'),
  },
  {
    id: 'evt-sylhet-tea',
    title: 'Sylhet Tea Garden & Waterfall Trip',
    destination: 'Sylhet',
    date: '2026-10-16',
    priceBDT: 5300,
    totalSeats: 40,
    availableSeats: 40,
    durationDays: 3,
    busType: 'AC Coaster',
    image: img('ltms-event-sylhet'),
  },
];

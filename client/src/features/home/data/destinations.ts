/**
 * Placeholder destination data — shape mirrors what the future Tours API
 * will return, so swapping this static array for a TanStack Query hook
 * (`useDestinations()`) later requires no changes to any component that
 * consumes it, only to where the data comes from.
 */
export interface Destination {
  id: string;
  slug: string;
  name: string;
  region: string;
  image: string;
  shortDescription: string;
  startingPriceBDT: number;
  durationDays: number;
  rating: number;
}

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

export const DESTINATIONS: Destination[] = [
  {
    id: 'sajek',
    slug: 'sajek-valley',
    name: 'Sajek Valley',
    region: 'Rangamati',
    image: img('ltms-sajek'),
    shortDescription: 'Sea of clouds rolling over hilltop resorts — the "Queen of Hills".',
    startingPriceBDT: 4500,
    durationDays: 3,
    rating: 4.8,
  },
  {
    id: 'sylhet',
    slug: 'sylhet',
    name: 'Sylhet',
    region: 'Sylhet Division',
    image: img('ltms-sylhet'),
    shortDescription: 'Emerald tea hills, waterfalls, and Ratargul\u2019s swamp forest.',
    startingPriceBDT: 5200,
    durationDays: 3,
    rating: 4.7,
  },
  {
    id: 'sreemangal',
    slug: 'sreemangal',
    name: 'Sreemangal',
    region: 'Moulvibazar',
    image: img('ltms-sreemangal'),
    shortDescription: 'The tea capital of Bangladesh — endless manicured tea gardens.',
    startingPriceBDT: 4200,
    durationDays: 2,
    rating: 4.6,
  },
  {
    id: 'coxsbazar',
    slug: 'coxs-bazar',
    name: "Cox's Bazar",
    region: 'Chattogram Division',
    image: img('ltms-coxsbazar'),
    shortDescription: "The world's longest natural sea beach, golden at sunset.",
    startingPriceBDT: 6000,
    durationDays: 4,
    rating: 4.9,
  },
  {
    id: 'bandarban',
    slug: 'bandarban',
    name: 'Bandarban',
    region: 'Chattogram Hill Tracts',
    image: img('ltms-bandarban'),
    shortDescription: 'Nilgiri peaks, Nafakhum falls, and remote hill-tribe villages.',
    startingPriceBDT: 5500,
    durationDays: 4,
    rating: 4.8,
  },
  {
    id: 'tanguar-haor',
    slug: 'tanguar-haor',
    name: 'Tanguar Haor',
    region: 'Sunamganj',
    image: img('ltms-tanguar'),
    shortDescription: 'A vast wetland of open water and floating villages by boat.',
    startingPriceBDT: 4800,
    durationDays: 2,
    rating: 4.7,
  },
  {
    id: 'sitakunda',
    slug: 'sitakunda',
    name: 'Sitakunda',
    region: 'Chattogram',
    image: img('ltms-sitakunda'),
    shortDescription: 'Sea, hills, and the Chandranath temple trail in one day trip.',
    startingPriceBDT: 3200,
    durationDays: 1,
    rating: 4.5,
  },
  {
    id: 'rangamati',
    slug: 'rangamati',
    name: 'Rangamati',
    region: 'Chattogram Hill Tracts',
    image: img('ltms-rangamati'),
    shortDescription: 'Kaptai Lake, hanging bridges, and indigenous Chakma culture.',
    startingPriceBDT: 4700,
    durationDays: 3,
    rating: 4.6,
  },
];

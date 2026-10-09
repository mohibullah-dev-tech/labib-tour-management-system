export interface GalleryImage {
  id: string;
  image: string;
  alt: string;
  category: 'Mountain' | 'Sea' | 'Waterfall' | 'Tea Garden' | 'Haor' | 'Sunset';
  location: string;
}

const img = (seed: string, w: number, h: number) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const GALLERY_CATEGORIES = [
  'All',
  'Mountain',
  'Sea',
  'Waterfall',
  'Tea Garden',
  'Haor',
  'Sunset',
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'g1',
    image: img('ltms-gallery-mountain', 900, 700),
    alt: 'Misty hills and peaks of Bandarban',
    category: 'Mountain',
    location: 'Bandarban, Chattogram',
  },
  {
    id: 'g2',
    image: img('ltms-gallery-sea', 900, 700),
    alt: "Rolling waves on the golden sand of Cox's Bazar",
    category: 'Sea',
    location: "Cox's Bazar",
  },
  {
    id: 'g3',
    image: img('ltms-gallery-waterfall', 900, 700),
    alt: 'Remakri and Nafakhum cascading waterfalls',
    category: 'Waterfall',
    location: 'Thanchi, Bandarban',
  },
  {
    id: 'g4',
    image: img('ltms-gallery-tea', 900, 700),
    alt: 'Emerald terraced tea gardens in Sreemangal',
    category: 'Tea Garden',
    location: 'Sreemangal, Sylhet',
  },
  {
    id: 'g5',
    image: img('ltms-gallery-haor', 900, 700),
    alt: 'Traditional wooden boats on crystal water at Tanguar Haor',
    category: 'Haor',
    location: 'Sunamganj, Sylhet',
  },
  {
    id: 'g6',
    image: img('ltms-gallery-sunset', 900, 700),
    alt: 'Golden hour sunset over Sajek Valley hills',
    category: 'Sunset',
    location: 'Sajek Valley, Rangamati',
  },
  {
    id: 'g7',
    image: img('ltms-gallery-saint-martin', 900, 700),
    alt: 'Coral reefs and coconut groves of Saint Martin Island',
    category: 'Sea',
    location: 'Saint Martin Island',
  },
  {
    id: 'g8',
    image: img('ltms-gallery-jaflong', 900, 700),
    alt: 'Piyain river stones and Meghalaya mountain backdrop',
    category: 'Mountain',
    location: 'Jaflong, Sylhet',
  },
];

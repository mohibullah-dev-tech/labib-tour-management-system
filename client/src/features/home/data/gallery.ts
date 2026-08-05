export interface GalleryImage {
  id: string;
  image: string;
  alt: string;
  category: 'Mountain' | 'Sea' | 'Waterfall' | 'Tea Garden' | 'Haor' | 'Sunset';
}

const img = (seed: string, w: number, h: number) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'g1',
    image: img('ltms-gallery-mountain', 800, 1000),
    alt: 'Misty hills of Bandarban',
    category: 'Mountain',
  },
  {
    id: 'g2',
    image: img('ltms-gallery-sea', 800, 600),
    alt: "Waves at Cox's Bazar",
    category: 'Sea',
  },
  {
    id: 'g3',
    image: img('ltms-gallery-waterfall', 800, 1100),
    alt: 'Nafakhum waterfall',
    category: 'Waterfall',
  },
  {
    id: 'g4',
    image: img('ltms-gallery-tea', 800, 700),
    alt: 'Tea garden rows in Sreemangal',
    category: 'Tea Garden',
  },
  {
    id: 'g5',
    image: img('ltms-gallery-haor', 800, 900),
    alt: 'Open water at Tanguar Haor',
    category: 'Haor',
  },
  {
    id: 'g6',
    image: img('ltms-gallery-sunset', 800, 650),
    alt: 'Sunset over the hills',
    category: 'Sunset',
  },
];

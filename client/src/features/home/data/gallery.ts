export interface GalleryImage {
  id: string;
  image: string;
  alt: string;
  category: 'Mountain' | 'Sea' | 'Waterfall' | 'Tea Garden' | 'Haor' | 'Sunset';
  location: string;
}

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
  // ===================== MOUNTAIN =====================
  {
    id: 'g-mt-1',
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    alt: 'Misty green mountain peaks and morning clouds of Sajek Valley',
    category: 'Mountain',
    location: 'Sajek Valley, Rangamati',
  },
  {
    id: 'g-mt-2',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    alt: 'Floating sea of clouds surrounding Nilgiri hill tops',
    category: 'Mountain',
    location: 'Nilgiri, Bandarban',
  },
  {
    id: 'g-mt-3',
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    alt: 'Winding mountain pass through Bandarban high hills',
    category: 'Mountain',
    location: 'Chimbuk Hill, Bandarban',
  },
  {
    id: 'g-mt-4',
    image:
      'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1200&q=80',
    alt: 'Rocky trekking trail to Keokradong mountain peak',
    category: 'Mountain',
    location: 'Keokradong, Bandarban',
  },
  {
    id: 'g-mt-5',
    image:
      'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1200&q=80',
    alt: 'Panoramic summit vista and cloud camp at Marayan Thong',
    category: 'Mountain',
    location: 'Marayan Thong, Alikadam',
  },
  {
    id: 'g-mt-6',
    image:
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
    alt: 'Natural high-altitude Boga Lake surrounded by lush mountains',
    category: 'Mountain',
    location: 'Boga Lake, Ruma',
  },

  // ===================== SEA =====================
  {
    id: 'g-sea-1',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    alt: "Vast golden sandy beach and rolling ocean waves of Cox's Bazar",
    category: 'Sea',
    location: "Laboni Beach, Cox's Bazar",
  },
  {
    id: 'g-sea-2',
    image:
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    alt: 'Crystal turquoise water and coconut grove of Saint Martin Island',
    category: 'Sea',
    location: 'Saint Martin Island',
  },
  {
    id: 'g-sea-3',
    image:
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=80',
    alt: 'Natural coral stone boulders and breaking surf at Inani Beach',
    category: 'Sea',
    location: 'Inani Beach, Cox’s Bazar',
  },
  {
    id: 'g-sea-4',
    image:
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=80',
    alt: 'Scenic coastal marine drive along the blue Bay of Bengal',
    category: 'Sea',
    location: 'Marine Drive, Cox’s Bazar',
  },
  {
    id: 'g-sea-5',
    image:
      'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=80',
    alt: 'Pristine live coral reef and clear waters of Chera Dwip',
    category: 'Sea',
    location: 'Chera Dwip, Saint Martin',
  },
  {
    id: 'g-sea-6',
    image:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80',
    alt: 'Expansive tranquil shoreline and gentle tides of Kuakata',
    category: 'Sea',
    location: 'Kuakata Sea Beach',
  },

  // ===================== WATERFALL =====================
  {
    id: 'g-wf-1',
    image:
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
    alt: 'Roaring cascades and spray of Nafakhum Waterfall',
    category: 'Waterfall',
    location: 'Nafakhum, Thanchi',
  },
  {
    id: 'g-wf-2',
    image:
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
    alt: 'Deep canyon turquoise rock pools at Amiakhum Waterfall',
    category: 'Waterfall',
    location: 'Amiakhum, Bandarban',
  },
  {
    id: 'g-wf-3',
    image:
      'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200&q=80',
    alt: 'Magnificent cascading tiers of Jadipai Waterfall',
    category: 'Waterfall',
    location: 'Jadipai, Ruma',
  },
  {
    id: 'g-wf-4',
    image:
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    alt: 'Remote rainforest plunge of Hum Hum Waterfall',
    category: 'Waterfall',
    location: 'Hum Hum, Moulvibazar',
  },
  {
    id: 'g-wf-5',
    image:
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
    alt: 'Hidden forest falls and rock canyon at Tinap Saitar',
    category: 'Waterfall',
    location: 'Tinap Saitar, Roangchhari',
  },
  {
    id: 'g-wf-6',
    image:
      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=80',
    alt: 'Dramatic 200-foot plunge of Madhabkunda Waterfall',
    category: 'Waterfall',
    location: 'Madhabkunda, Barlekha',
  },

  // ===================== TEA GARDEN =====================
  {
    id: 'g-tg-1',
    image:
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
    alt: 'Endless rolling emerald hills of Sreemangal tea estates',
    category: 'Tea Garden',
    location: 'Sreemangal, Sylhet',
  },
  {
    id: 'g-tg-2',
    image:
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80',
    alt: 'Fresh green tea canopy and tender morning tea leaves',
    category: 'Tea Garden',
    location: 'Finlay Tea Garden, Moulvibazar',
  },
  {
    id: 'g-tg-3',
    image:
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
    alt: 'Winding cycling pathway through historic tea gardens',
    category: 'Tea Garden',
    location: 'Malnicherra, Sylhet',
  },
  {
    id: 'g-tg-4',
    image:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    alt: 'Morning mist floating over terraced tea gardens',
    category: 'Tea Garden',
    location: 'Lakkatura Tea Estate, Sylhet',
  },
  {
    id: 'g-tg-5',
    image:
      'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1200&q=80',
    alt: 'Lotus-filled Madhabpur Lake bordered by green tea hills',
    category: 'Tea Garden',
    location: 'Madhabpur Lake, Kamalganj',
  },
  {
    id: 'g-tg-6',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    alt: 'Dense canopy and shade trees of Lawachara tea boundary',
    category: 'Tea Garden',
    location: 'Lawachara, Sreemangal',
  },

  // ===================== HAOR =====================
  {
    id: 'g-hr-1',
    image:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    alt: 'Traditional wooden boats cruising calm blue waters of Tanguar Haor',
    category: 'Haor',
    location: 'Tanguar Haor, Sunamganj',
  },
  {
    id: 'g-hr-2',
    image:
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80',
    alt: 'Vast freshwater wetland basin under clear open skies',
    category: 'Haor',
    location: 'Tahirpur, Sunamganj',
  },
  {
    id: 'g-hr-3',
    image:
      'https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&w=1200&q=80',
    alt: 'Tranquil boat journey across expansive Nikli Haor',
    category: 'Haor',
    location: 'Nikli Haor, Kishoreganj',
  },
  {
    id: 'g-hr-4',
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    alt: 'Vast water landscape and sanctuary at Hakaluki Haor',
    category: 'Haor',
    location: 'Hakaluki Haor, Moulvibazar',
  },
  {
    id: 'g-hr-5',
    image:
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80',
    alt: 'Scenic red blooms at Shimul Bagan near Jadukata river',
    category: 'Haor',
    location: 'Shimul Bagan, Sunamganj',
  },
  {
    id: 'g-hr-6',
    image:
      'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=1200&q=80',
    alt: 'Premium traditional houseboat glides across peaceful haor waves',
    category: 'Haor',
    location: 'Sunamganj Wetland',
  },

  // ===================== SUNSET =====================
  {
    id: 'g-ss-1',
    image:
      'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=80',
    alt: 'Golden sun setting behind mountain layers of Sajek Valley',
    category: 'Sunset',
    location: 'Konglak Para, Sajek Valley',
  },
  {
    id: 'g-ss-2',
    image:
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    alt: 'Unobstructed crimson sunset sinking into the Bay at Kuakata',
    category: 'Sunset',
    location: 'Kuakata Sunset Point',
  },
  {
    id: 'g-ss-3',
    image:
      'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=1200&q=80',
    alt: 'Tropical coconut palm silhouettes against purple sunset',
    category: 'Sunset',
    location: 'West Beach, Saint Martin',
  },
  {
    id: 'g-ss-4',
    image:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    alt: 'Golden hour reflections on mirror calm wetland waters',
    category: 'Sunset',
    location: 'Tanguar Haor, Sunamganj',
  },
  {
    id: 'g-ss-5',
    image:
      'https://images.unsplash.com/photo-1498036882173-b41c28a82b80?auto=format&fit=crop&w=1200&q=80',
    alt: 'Dramatic dusk sky above the clouds from Nilgiri peak',
    category: 'Sunset',
    location: 'Nilgiri Hill Resort, Bandarban',
  },
  {
    id: 'g-ss-6',
    image:
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
    alt: "Dusk glow and sea breeze over Cox's Bazar coastline",
    category: 'Sunset',
    location: "Laboni Point, Cox's Bazar",
  },
];

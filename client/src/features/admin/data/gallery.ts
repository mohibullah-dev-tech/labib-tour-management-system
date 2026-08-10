import type { GalleryItemAdmin } from '@/features/admin/types';

const img = (seed: string) => `https://picsum.photos/seed/${seed}/500/500`;

export const ADMIN_GALLERY: GalleryItemAdmin[] = [
  {
    id: 'agal-1',
    image: img('agal-sajek-1'),
    destination: 'Sajek Valley',
    isFeatured: true,
    uploadedAt: '2026-07-20T10:00:00+06:00',
  },
  {
    id: 'agal-2',
    image: img('agal-sajek-2'),
    destination: 'Sajek Valley',
    isFeatured: false,
    uploadedAt: '2026-07-20T10:05:00+06:00',
  },
  {
    id: 'agal-3',
    image: img('agal-cxb-1'),
    destination: "Cox's Bazar",
    isFeatured: true,
    uploadedAt: '2026-07-15T14:00:00+06:00',
  },
  {
    id: 'agal-4',
    image: img('agal-bandarban-1'),
    destination: 'Bandarban',
    isFeatured: false,
    uploadedAt: '2026-07-10T09:20:00+06:00',
  },
  {
    id: 'agal-5',
    image: img('agal-sylhet-1'),
    destination: 'Sylhet',
    isFeatured: false,
    uploadedAt: '2026-07-05T16:30:00+06:00',
  },
  {
    id: 'agal-6',
    image: img('agal-sreemangal-1'),
    destination: 'Sreemangal',
    isFeatured: true,
    uploadedAt: '2026-06-28T11:15:00+06:00',
  },
  {
    id: 'agal-7',
    image: img('agal-rangamati-1'),
    destination: 'Rangamati',
    isFeatured: false,
    uploadedAt: '2026-06-20T08:45:00+06:00',
  },
  {
    id: 'agal-8',
    image: img('agal-cxb-2'),
    destination: "Cox's Bazar",
    isFeatured: false,
    uploadedAt: '2026-06-15T13:10:00+06:00',
  },
];

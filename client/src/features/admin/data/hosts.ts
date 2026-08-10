import type { HostAdmin } from '@/features/admin/types';

const img = (seed: string) => `https://picsum.photos/seed/${seed}/200/200`;

export const ADMIN_HOSTS: HostAdmin[] = [
  {
    id: 'ahost-1',
    name: 'Rahim Uddin',
    photo: img('ahost-rahim'),
    phone: '+8801711000010',
    whatsapp: 'https://wa.me/8801711000010',
    experienceYears: 6,
    assignedEventCount: 2,
    availability: 'assigned',
  },
  {
    id: 'ahost-2',
    name: 'Kamrul Hasan',
    photo: img('ahost-kamrul'),
    phone: '+8801711000011',
    whatsapp: 'https://wa.me/8801711000011',
    experienceYears: 8,
    assignedEventCount: 2,
    availability: 'assigned',
  },
  {
    id: 'ahost-3',
    name: 'Nazmul Haque',
    photo: img('ahost-nazmul'),
    phone: '+8801711000012',
    whatsapp: 'https://wa.me/8801711000012',
    experienceYears: 3,
    assignedEventCount: 1,
    availability: 'available',
  },
  {
    id: 'ahost-4',
    name: 'Sabbir Ahmed',
    photo: img('ahost-sabbir'),
    phone: '+8801711000013',
    whatsapp: 'https://wa.me/8801711000013',
    experienceYears: 5,
    assignedEventCount: 0,
    availability: 'available',
  },
  {
    id: 'ahost-5',
    name: 'Mizanur Rahman',
    photo: img('ahost-mizanur'),
    phone: '+8801711000014',
    whatsapp: 'https://wa.me/8801711000014',
    experienceYears: 4,
    assignedEventCount: 0,
    availability: 'unavailable',
  },
];

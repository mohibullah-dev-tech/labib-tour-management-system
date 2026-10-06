import type { TimelineMilestone } from '@/features/host/types';

export const MOCK_TOUR_TIMELINE: TimelineMilestone[] = [
  {
    id: 'mile-1',
    time: '10:00 PM',
    title: 'Dhaka Sayedabad Departure',
    location: 'Sayedabad Bus Terminal, Dhaka',
    description:
      'Roll call, luggage loading into LABIB-01 cargo bay, water bottle distribution, and highway departure.',
    status: 'completed',
    reachedAt: '2026-10-06T16:00:00Z',
  },
  {
    id: 'mile-2',
    time: '04:30 AM',
    title: 'Cumilla Highway Break',
    location: 'Noorjahan Highway Restaurant, Cumilla',
    description:
      '30-minute refreshment and restroom break. Fuel top-up and tire pressure inspection.',
    status: 'current',
    reachedAt: '2026-10-06T22:30:00Z',
  },
  {
    id: 'mile-3',
    time: '07:00 AM',
    title: 'Breakfast at Khagrachari',
    location: 'System Restaurant, Khagrachari Town',
    description:
      'Traditional paratha, egg, and tea breakfast. Transfer luggage to 4x4 open-hood Chander Gari (Jeep).',
    status: 'upcoming',
    estimatedArrival: 'Tomorrow 07:00 AM',
  },
  {
    id: 'mile-4',
    time: '09:30 AM',
    title: 'Military Escort Checkpoint',
    location: 'Baghaihat Army Camp, CHT',
    description:
      'National ID verification, security clearance logging, and armed convoy formation heading up to Sajek ridge.',
    status: 'upcoming',
    estimatedArrival: 'Tomorrow 09:30 AM',
  },
  {
    id: 'mile-5',
    time: '12:30 PM',
    title: 'Sajek Valley Arrival & Resort Check-in',
    location: 'Ruilui Para Eco Cottages, Sajek',
    description:
      'Room keys handover, welcome fresh lime juice, unpacking, and traditional Pahari lunch.',
    status: 'upcoming',
    estimatedArrival: 'Tomorrow 12:30 PM',
  },
  {
    id: 'mile-6',
    time: '04:30 PM',
    title: 'Lusai Village & Konglak Para Trek',
    location: 'Konglak Peak (Highest point of Sajek)',
    description:
      'Guided hiking trek to Konglak summit, Lusai ethnic community interaction, and indigenous bamboo tea.',
    status: 'upcoming',
    estimatedArrival: 'Tomorrow 04:30 PM',
  },
  {
    id: 'mile-7',
    time: '06:00 PM',
    title: 'Helipad Sunset Gathering & BBQ Night',
    location: 'Sajek Main Helipad',
    description:
      'Panoramic 360-degree sunset over the cloud blankets followed by campfire chicken BBQ and acoustic music.',
    status: 'upcoming',
    estimatedArrival: 'Tomorrow 06:00 PM',
  },
];

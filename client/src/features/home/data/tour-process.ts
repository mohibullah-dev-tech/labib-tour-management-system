import type { LucideIcon } from 'lucide-react';
import { Compass, TicketCheck, Bus, PartyPopper, Camera } from 'lucide-react';

export interface TourProcessStep {
  id: string;
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const TOUR_PROCESS_STEPS: TourProcessStep[] = [
  {
    id: 'choose',
    step: 1,
    icon: Compass,
    title: 'Choose Tour',
    description: 'Browse destinations and upcoming events to find your next trip.',
  },
  {
    id: 'book',
    step: 2,
    icon: TicketCheck,
    title: 'Book Seat',
    description: 'Reserve your seat online with a simple, secure booking flow.',
  },
  {
    id: 'travel',
    step: 3,
    icon: Bus,
    title: 'Travel',
    description: 'Meet your host, board your bus, and start the journey.',
  },
  {
    id: 'enjoy',
    step: 4,
    icon: PartyPopper,
    title: 'Enjoy',
    description: 'Explore the destination with expert local guides by your side.',
  },
  {
    id: 'share',
    step: 5,
    icon: Camera,
    title: 'Share Memories',
    description: 'Take home the photos, stories, and friendships from the trip.',
  },
];

import type { LucideIcon } from 'lucide-react';
import { Users, MapPin, Compass, Star } from 'lucide-react';

export interface TravelStat {
  id: string;
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
}

export const TRAVEL_STATS: TravelStat[] = [
  { id: 'guests', icon: Users, value: 8500, suffix: '+', label: 'Happy Guests' },
  { id: 'tours', icon: Compass, value: 320, suffix: '+', label: 'Tours Completed' },
  { id: 'destinations', icon: MapPin, value: 24, suffix: '+', label: 'Destinations' },
  { id: 'rating', icon: Star, value: 4.8, suffix: '/5', label: 'Average Rating' },
];

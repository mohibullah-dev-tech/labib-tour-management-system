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
  { id: 'guests', icon: Users, value: 8500, suffix: '+', label: 'সন্তুষ্ট পর্যটক' },
  { id: 'tours', icon: Compass, value: 320, suffix: '+', label: 'সফল ট্যুর সম্পন্ন' },
  { id: 'destinations', icon: MapPin, value: 24, suffix: '+', label: 'জনপ্রিয় গন্তব্য' },
  { id: 'rating', icon: Star, value: 4.8, suffix: '/৫', label: 'গড় অতিথি রেটিং' },
];

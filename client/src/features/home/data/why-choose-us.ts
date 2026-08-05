import type { LucideIcon } from 'lucide-react';
import { Users2, MapPinned, BadgeDollarSign, ShieldCheck, Headset, Smile } from 'lucide-react';

export interface WhyChooseUsItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const WHY_CHOOSE_US: WhyChooseUsItem[] = [
  {
    id: 'hosts',
    icon: Users2,
    title: 'Experienced Hosts',
    description:
      'Every tour travels with a dedicated host who knows the route, the stops, and the stories.',
  },
  {
    id: 'guides',
    icon: MapPinned,
    title: 'Professional Guides',
    description:
      'Local guides at every destination who know the trails, the culture, and the hidden spots.',
  },
  {
    id: 'price',
    icon: BadgeDollarSign,
    title: 'Affordable Price',
    description:
      'Transparent, all-inclusive pricing — no surprise costs once you\u2019re on the road.',
  },
  {
    id: 'safety',
    icon: ShieldCheck,
    title: 'Safe Journey',
    description:
      'Licensed drivers, well-maintained vehicles, and safety briefings before every trip.',
  },
  {
    id: 'support',
    icon: Headset,
    title: '24/7 Support',
    description:
      'A support line that\u2019s actually answered — before, during, and after your journey.',
  },
  {
    id: 'guests',
    icon: Smile,
    title: 'Thousands of Happy Guests',
    description:
      'Thousands of travelers across Bangladesh have explored with us and come back for more.',
  },
];

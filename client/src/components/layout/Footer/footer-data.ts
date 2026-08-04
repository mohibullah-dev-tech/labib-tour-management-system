import type { LucideIcon } from 'lucide-react';
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

export interface SocialLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Placeholder destination list — replaced by real data once the Tours
 *  feature/API exists. Kept here (not hardcoded in Footer.tsx) so it's
 *  a single obvious place to wire up real data later. */
export const POPULAR_DESTINATIONS = [
  { label: "Cox's Bazar", path: '/tours' },
  { label: 'Sundarbans', path: '/tours' },
  { label: 'Sylhet', path: '/tours' },
  { label: 'Bandarban', path: '/tours' },
  { label: 'Saint Martin', path: '/tours' },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'Twitter / X', href: 'https://twitter.com', icon: Twitter },
  { label: 'YouTube', href: 'https://youtube.com', icon: Youtube },
];

export const EMERGENCY_CONTACT = {
  phone: '+880 1XXX-XXXXXX',
  email: 'support@labibtours.com',
};

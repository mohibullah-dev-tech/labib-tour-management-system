import type { LucideIcon } from 'lucide-react';
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

export interface SocialLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const POPULAR_DESTINATIONS = [
  { label: 'কক্সবাজার', path: '/tours' },
  { label: 'সুন্দরবন', path: '/tours' },
  { label: 'সিলেট', path: '/tours' },
  { label: 'বান্দরবান', path: '/tours' },
  { label: 'সেন্টমার্টিন', path: '/tours' },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'Twitter / X', href: 'https://twitter.com', icon: Twitter },
  { label: 'YouTube', href: 'https://youtube.com', icon: Youtube },
];

export const EMERGENCY_CONTACT = {
  phone: '+৮৮০ ১৭০০-০০০০০০',
  email: 'support@labibtours.com',
};

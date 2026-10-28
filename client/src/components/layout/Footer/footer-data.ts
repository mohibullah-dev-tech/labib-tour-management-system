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
  { label: 'Facebook', href: 'https://www.facebook.com/labibtourgroup/', icon: Facebook },
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'Twitter / X', href: 'https://twitter.com', icon: Twitter },
  { label: 'YouTube', href: 'https://youtube.com', icon: Youtube },
];

export const EMERGENCY_CONTACT = {
  phones: [
    { number: '01602113987', raw: '+8801602113987', label: 'লাইন ১' },
    { number: '01991009767', raw: '+8801991009767', label: 'লাইন ২' },
    { number: '01848474663', raw: '+8801848474663', label: 'লাইন ৩' },
  ],
  phone: '01602113987',
  email: 'support@labibtours.com',
};

export interface NavItem {
  label: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Tours', path: '/tours' },
  { label: 'Upcoming Events', path: '/#upcoming-events' },
  { label: 'Gallery', path: '/#gallery' },
  { label: 'Reviews', path: '/#reviews' },
  { label: 'About', path: '/#about' },
  { label: 'Contact', path: '/#contact' },
];

export const LEGAL_ITEMS: NavItem[] = [
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Terms & Conditions', path: '/terms' },
];

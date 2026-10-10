export interface NavItem {
  label: string;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'হোম', path: '/' },
  { label: 'ট্যুরসমূহ', path: '/tours' },
  { label: 'আসন্ন ইভেন্ট', path: '/#upcoming-events' },
  { label: 'গ্যালারি', path: '/#gallery' },
  { label: 'রিভিউ', path: '/#reviews' },
  { label: 'আমাদের সম্পর্কে', path: '/#about' },
  { label: 'যোগাযোগ', path: '/#contact' },
];

export const LEGAL_ITEMS: NavItem[] = [
  { label: 'গোপনীয়তা নীতি', path: '/privacy-policy' },
  { label: 'শর্তাবলী', path: '/terms' },
];

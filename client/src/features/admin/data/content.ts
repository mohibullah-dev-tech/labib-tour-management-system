import type { WebsiteContentSettings } from '@/features/admin/types';

/** Default website content — matches the exact fields the public Home page and FAQ sections already render, so this becomes their live source once wired to an API. */
export const DEFAULT_WEBSITE_CONTENT: WebsiteContentSettings = {
  heroHeadline: "Discover Bangladesh's Untold Beauty",
  heroSubheadline:
    'From cloud-wrapped hills to golden beaches — curated group tours, experienced hosts, and journeys designed to be remembered.',
  heroBackgroundImage: '/images/hero-banner.jpg',
  statGuests: '8500',
  statTours: '320',
  statDestinations: '24',
  statRating: '4.8',
  faq: [
    {
      id: 'cfaq-1',
      question: 'How do I book a tour with Labib Tour?',
      answer:
        'Choose a tour or upcoming event, select your seats, and confirm your booking with a partial advance payment.',
    },
    {
      id: 'cfaq-2',
      question: 'What payment methods are accepted?',
      answer: 'We accept bKash, Nagad, Rocket, and direct bank transfer.',
    },
  ],
  aboutTitle: 'About Labib Tour',
  aboutBody:
    'Labib Tour Management is a Bangladesh-based travel company organizing curated group tours since 2019.',
  contactAddress: 'House 12, Road 5, Dhanmondi, Dhaka 1209, Bangladesh',
  contactPhone: '+8801700000000',
  contactEmail: 'support@labibtours.com',
  footerDescription:
    'Labib Tour Management System — curated tours and unforgettable travel experiences, planned end to end.',
  footerCopyright: 'Labib Tour Management System. All rights reserved.',
};

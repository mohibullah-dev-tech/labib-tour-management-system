export interface UpcomingEvent {
  id: string;
  title: string;
  destination: string;
  date: string;
  priceBDT: number;
  totalSeats: number;
  availableSeats: number;
  durationDays: number;
  busType: string;
  image: string;
  slug?: string;
  packages?: string[];
  isDemo?: boolean;
}

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: 'evt-sajek-eid',
    title: 'সাজেক ভ্যালি ঈদ স্পেশাল ট্যুর',
    destination: 'সাজেক ভ্যালি',
    date: '2026-10-24',
    priceBDT: 4800,
    totalSeats: 45,
    availableSeats: 12,
    durationDays: 3,
    busType: 'স্ক্যানিয়া এসি কোচ',
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    slug: 'sajek-valley-relax',
    packages: ['সিঙ্গেল', 'কাপল', 'প্রিমিয়াম'],
    isDemo: true,
  },
  {
    id: 'evt-coxsbazar-weekend',
    title: 'কক্সবাজার উইকএন্ড রিল্যাক্স ট্যুর',
    destination: 'কক্সবাজার',
    date: '2026-10-31',
    priceBDT: 6200,
    totalSeats: 45,
    availableSeats: 27,
    durationDays: 3,
    busType: 'হুন্দাই এসি কোচ',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    slug: 'coxs-bazar-beach-retreat',
    packages: ['কাপল', 'ফ্যামিলি', 'ভিআইপি'],
    isDemo: true,
  },
  {
    id: 'evt-bandarban-trek',
    title: 'বান্দরবান হিল ট্র্যাকিং ও ক্লাউড ক্যাম্প',
    destination: 'বান্দরবান',
    date: '2026-11-07',
    priceBDT: 5800,
    totalSeats: 45,
    availableSeats: 6,
    durationDays: 4,
    busType: 'হিনো ১জে এসি কোচ',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    slug: 'bandarban-hill-trails',
    packages: ['সিঙ্গেল', 'অ্যাডভেঞ্চার'],
    isDemo: true,
  },
  {
    id: 'evt-sylhet-tea',
    title: 'সিলেট চা বাগান, জাফলং ও ঝর্ণা ভ্রমণ',
    destination: 'সিলেট',
    date: '2026-11-14',
    priceBDT: 5300,
    totalSeats: 45,
    availableSeats: 34,
    durationDays: 3,
    busType: 'স্ক্যানিয়া এসি কোচ',
    image:
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
    slug: 'sylhet-nature-escape',
    packages: ['সিঙ্গেল', 'কাপল'],
    isDemo: true,
  },
];

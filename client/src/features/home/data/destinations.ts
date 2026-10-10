export interface Destination {
  id: string;
  slug: string;
  name: string;
  region: string;
  image: string;
  shortDescription: string;
  startingPriceBDT: number;
  durationDays: number;
  rating: number;
}

export const DESTINATIONS: Destination[] = [
  {
    id: 'sajek',
    slug: 'sajek-valley',
    name: 'সাজেক ভ্যালি',
    region: 'রাঙ্গামাটি',
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'মেঘের রাজ্য ও পাহাড়ের রানী — কংলাক পাহাড় ও রিসোর্ট ভিউ।',
    startingPriceBDT: 4500,
    durationDays: 3,
    rating: 4.8,
  },
  {
    id: 'sylhet',
    slug: 'sylhet',
    name: 'সিলেট',
    region: 'সিলেট বিভাগ',
    image:
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'সবুজ চা বাগান, জাফলং ও রাতারগুলের সোয়াম্প ফরেস্ট ভ্রমণ।',
    startingPriceBDT: 5200,
    durationDays: 3,
    rating: 4.7,
  },
  {
    id: 'sreemangal',
    slug: 'sreemangal',
    name: 'শ্রীমঙ্গল',
    region: 'মৌলভীবাজার',
    image:
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'চা-কন্যার শহর — দিগন্তজোড়া সবুজ বাগান ও লাউয়াছড়া বন।',
    startingPriceBDT: 4200,
    durationDays: 2,
    rating: 4.6,
  },
  {
    id: 'coxsbazar',
    slug: 'coxs-bazar',
    name: 'কক্সবাজার',
    region: 'চট্টগ্রাম বিভাগ',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'বিশ্বের দীর্ঘতম প্রাকৃতিক সমুদ্র সৈকত ও মনোরম সূর্যাস্ত।',
    startingPriceBDT: 6000,
    durationDays: 4,
    rating: 4.9,
  },
  {
    id: 'bandarban',
    slug: 'bandarban',
    name: 'বান্দরবান',
    region: 'পার্বত্য চট্টগ্রাম',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'নীলগিরির মেঘ, নাফাখুম জলপ্রপাত ও রোমাঞ্চকর পাহাড়ি ট্রেইল।',
    startingPriceBDT: 5500,
    durationDays: 4,
    rating: 4.8,
  },
  {
    id: 'tanguar-haor',
    slug: 'tanguar-haor',
    name: 'টাঙ্গুয়ার হাওর',
    region: 'সুনামগঞ্জ',
    image:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'স্বচ্ছ নীল জলরাশি, প্রিমিয়াম হাউসবোট ও পাখির কলকাকলি।',
    startingPriceBDT: 4800,
    durationDays: 2,
    rating: 4.7,
  },
  {
    id: 'sitakunda',
    slug: 'sitakunda',
    name: 'সীতাকুণ্ড',
    region: 'চট্টগ্রাম',
    image:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'পাহাড় ও সমুদ্রের মিতালী এবং চন্দ্রনাথ পাহাড়ের রোমাঞ্চকর ট্রেইল।',
    startingPriceBDT: 3200,
    durationDays: 1,
    rating: 4.5,
  },
  {
    id: 'rangamati',
    slug: 'rangamati',
    name: 'রাঙ্গামাটি',
    region: 'পার্বত্য চট্টগ্রাম',
    image:
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
    shortDescription: 'কাপ্তাই হ্রদ, ঝুলন্ত সেতু ও আদিবাসী সংস্কৃতির রূপময় শহর।',
    startingPriceBDT: 4700,
    durationDays: 3,
    rating: 4.6,
  },
];

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
    title: 'অভিজ্ঞ ট্যুর হোস্ট',
    description:
      'প্রতিটি ট্যুরে থাকে নিবেদিত ও অভিজ্ঞ হোস্ট, যিনি পুরো রুট, স্টপ ও আকর্ষণীয় গল্পগুলো সুন্দরভাবে পরিচালনা করেন।',
  },
  {
    id: 'guides',
    icon: MapPinned,
    title: 'দক্ষ স্থানীয় গাইড',
    description:
      'প্রতিটি গন্তব্যে লোকাল অভিজ্ঞ গাইড, যারা স্থানীয় সংস্কৃতি, পাহাড়ি ট্রেইল ও রোমাঞ্চকর সব স্পট চেনেন।',
  },
  {
    id: 'price',
    icon: BadgeDollarSign,
    title: 'সাশ্রয়ী ও স্বচ্ছ প্যাকেজ',
    description:
      'সম্পূর্ণ স্বচ্ছ ও অল-ইনক্লুসিভ প্যাকেজ মূল্য — ভ্রমণে বের হওয়ার পর কোনো গোপন বা বাড়তি খরচ নেই।',
  },
  {
    id: 'safety',
    icon: ShieldCheck,
    title: 'নিরাপদ ভ্রমণ ও আরামদায়ক এসি বাস',
    description:
      'লাইসেন্সধারী অভিজ্ঞ ড্রাইভার, সুসজ্জিত বিলাসবহুল এসি বাস এবং প্রতিটি যাত্রার পূর্বে নিরাপত্তা নির্দেশনা।',
  },
  {
    id: 'support',
    icon: Headset,
    title: '২৪/৭ সার্বক্ষণিক সাপোর্ট',
    description:
      'ভ্রমণের আগে, ভ্রমণের সময় এবং ভ্রমণ শেষে সার্বক্ষণিক গ্রাহক সেবা ও সরাসরি সহায়তা নিশ্চিত করা হয়।',
  },
  {
    id: 'guests',
    icon: Smile,
    title: 'হাজারো সন্তুষ্ট পর্যটক',
    description:
      'সারাদেশ থেকে হাজার হাজার ভ্রমনপিপাসু আমাদের সাথে নিরাপদে ঘুরেছেন এবং আবারও ভ্রমণে যোগ দিচ্ছেন।',
  },
];

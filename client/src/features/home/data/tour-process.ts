import type { LucideIcon } from 'lucide-react';
import { Compass, TicketCheck, Bus, PartyPopper, Camera } from 'lucide-react';

export interface TourProcessStep {
  id: string;
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const TOUR_PROCESS_STEPS: TourProcessStep[] = [
  {
    id: 'choose',
    step: 1,
    icon: Compass,
    title: 'ট্যুর পছন্দ করুন',
    description: 'জনপ্রিয় গন্তব্য ও নির্দিষ্ট তারিখের আসন্ন ইভেন্ট ব্রাউজ করে ট্যুর নির্বাচন করুন।',
  },
  {
    id: 'book',
    step: 2,
    icon: TicketCheck,
    title: 'আসন নিশ্চিত করুন',
    description: 'সহজ ও নিরাপদ বুকিং প্রক্রিয়ায় অনলাইনে পছন্দের আসন নির্বাচন করে কনফার্ম করুন।',
  },
  {
    id: 'travel',
    step: 3,
    icon: Bus,
    title: 'যাত্রা শুরু করুন',
    description: 'বোর্ডিং পয়েন্টে হোস্টের সাথে সাক্ষাৎ করে বিলাসবহুল এসি বাসে আরামদায়ক যাত্রা শুরু করুন।',
  },
  {
    id: 'enjoy',
    step: 4,
    icon: PartyPopper,
    title: 'ভ্রমণ উপভোগ করুন',
    description: 'দক্ষ লোকাল গাইডের সাথে প্রতিটি দর্শনীয় স্থান ঘুরে চমৎকার সময় কাটান।',
  },
  {
    id: 'share',
    step: 5,
    icon: Camera,
    title: 'স্মৃতি শেয়ার করুন',
    description: 'ক্যামেরাবন্দী স্মরণীয় মুহূর্ত, নতুন বন্ধুদের গল্প ও চমৎকার স্মৃতি নিয়ে ঘরে ফিরুন।',
  },
];

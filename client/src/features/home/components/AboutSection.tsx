import { motion } from 'framer-motion';
import { Compass, Bus, ShieldCheck, Radio, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { Button } from '@/components/ui/button';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

const HIGHLIGHTS = [
  {
    icon: Compass,
    title: 'অভিজ্ঞ ট্যুর হোস্ট',
    description:
      'প্রতিটি ট্যুর পরিচালিত হয় দক্ষ ও দায়িত্বশীল ট্রিপ লিডারদের দ্বারা, যারা যাত্রীদের নিরাপত্তা ও ভ্রমণ আনন্দ নিশ্চিত করেন।',
  },
  {
    icon: Bus,
    title: 'বিলাসবহুল এসি বাস ও লাইভ সিট সিলেকশন',
    description:
      'স্ক্যানিয়া ও হিনো বিলাসবহুল এসি কোচে রিয়েল-টাইম সিট লকিং সিস্টেম—আপনার পছন্দের আসনটি শতভাগ নিশ্চিত।',
  },
  {
    icon: Radio,
    title: 'লাইভ ট্যুর ও জিপিএস ট্র্যাকিং',
    description:
      'যাত্রাপথে বাসের রিয়েল-টাইম লোকেশন ট্র্যাকিং ও তাৎক্ষণিক ঘোষণা যাতে আপনি ও আপনার পরিবার নিশ্চিন্ত থাকতে পারেন।',
  },
  {
    icon: ShieldCheck,
    title: 'স্বচ্ছ ও নিরাপদ বুকিং ব্যবস্থা',
    description:
      'তাৎক্ষণিক ডিজিটাল পিডিএফ টিকেট কনফার্মেশন এবং আমাদের ধানমন্ডি সেন্ট্রাল অফিস থেকে সরাসরি সাপোর্ট।',
  },
];

const METRICS = [
  { value: '৮,৫০০+', label: 'সন্তুষ্ট পর্যটক' },
  { value: '৩২০+', label: 'সফল ট্যুর সম্পন্ন' },
  { value: '২৪+', label: 'মনোরম গন্তব্য' },
  { value: '২০১৯', label: 'প্রতিষ্ঠার বছর' },
];

function AboutSection() {
  return (
    <Section id="about" aria-labelledby="about-heading" className="scroll-mt-20">
      <SectionTitle
        id="about-heading"
        eyebrow="আমাদের গল্প ও লক্ষ্য"
        title="লাবিব ট্যুর সম্পর্কে জানুন"
        description="২০১৯ সাল থেকে বাংলাদেশের প্রতিটি প্রান্তে আধুনিক, নিরাপদ এবং নিখুঁত গ্রুপ ট্যুর আয়োজন করে আসছি।"
      />

      <div className="mt-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        {/* Left Column: Narrative */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="space-y-6 lg:col-span-6"
        >
          <div className="space-y-4">
            <h3 className="font-display text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              স্মরণীয় ভ্রমণের সুপরিকল্পিত আয়োজন।
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              লাবিব ট্যুর ম্যানেজমেন্ট ২০১৯ সালে যাত্রা শুরু করে একটি স্পষ্ট লক্ষ্য নিয়ে: বাংলাদেশে ভ্রমণের সকল জটিলতা ও ক্লান্তি দূর করে আরামদায়ক, নিরাপদ ও সুসংগঠিত গ্রুপ ট্যুর উপহার দেওয়া।
            </p>
            <p className="text-muted-foreground text-base leading-relaxed">
              ঢাকার ধানমন্ডিতে প্রধান কার্যালয় নিয়ে আমরা প্রতিটি ট্যুর প্ল্যান তৈরি করি শুরু থেকে শেষ পর্যন্ত—বিলাসবহুল এসি বাস রিজার্ভেশন, সেরা ইকো-রিসোর্ট নিশ্চিতকরণ এবং প্রতিটি ট্রিপে অভিজ্ঞ হোস্টের উপস্থিতি। আপনি সাজেকের মেঘের রাজ্যে যান বা টাঙ্গুয়ার হাওরের শান্ত জলে ভাসেন, লজিস্টিকসের সব দায়িত্ব আমাদের।
            </p>
          </div>

          <div className="border-border/80 bg-muted/30 rounded-xl border p-5">
            <h4 className="text-foreground text-sm font-semibold">আমাদের ভ্রমণ নীতিমালা</h4>
            <ul className="mt-3 space-y-2.5">
              {[
                'ঢাকা থেকে নির্দিষ্ট সময়ে নিখুঁতভাবে বাস ছাড়া ও ড্রপ সেবা',
                'পূর্ব-যাচাইকৃত মানসম্পন্ন হোটেল, কটেজ এবং পাহাড়ের ইকো-রিসোর্ট',
                'পরিবহন, থাকা ও খাওয়া অন্তর্ভুক্ত সম্পূর্ণ স্বচ্ছ প্যাকেজ মূল্য',
                'ট্যুর হোস্টের মাধ্যমে যাত্রাপথে সার্বক্ষণিক সহায়তা ও ২৪/৭ হেল্পলাইন',
              ].map((item) => (
                <li
                  key={item}
                  className="text-muted-foreground flex items-start gap-2.5 text-xs sm:text-sm"
                >
                  <CheckCircle className="text-primary mt-0.5 size-4 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button asChild>
              <a href="#upcoming-events">
                আসন্ন ট্যুরসমূহ দেখুন
                <ArrowRight className="ml-2 size-4" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#contact">
                <MapPin className="mr-2 size-4" />
                অফিসে যোগাযোগ করুন
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Right Column: Operational Pillars Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6"
        >
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                className="border-border bg-card hover:border-primary/50 group flex flex-col justify-between rounded-xl border p-6 shadow-xs transition-all duration-300 hover:shadow-md"
              >
                <div>
                  <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-4 flex size-11 items-center justify-center rounded-lg transition-colors">
                    <Icon className="size-5" />
                  </div>
                  <h4 className="text-foreground font-display text-base font-semibold">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Trust & Track Record Metrics */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="border-border bg-card mt-16 grid grid-cols-2 gap-6 rounded-2xl border p-6 text-center shadow-xs sm:grid-cols-4 md:p-8"
      >
        {METRICS.map((metric) => (
          <div key={metric.label} className="space-y-1">
            <p className="font-display text-primary text-3xl font-extrabold tracking-tight sm:text-4xl">
              {metric.value}
            </p>
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase sm:text-sm">
              {metric.label}
            </p>
          </div>
        ))}
      </motion.div>
    </Section>
  );
}

export { AboutSection };

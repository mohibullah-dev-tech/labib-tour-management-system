import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShieldCheck, MessageSquareHeart, Compass, Sparkles } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/axios';
import {
  ReviewCard,
  type DisplayReview,
} from '@/features/home/components/ReviewsPreview/ReviewCard';
import { staggerContainer, fadeIn } from '@/lib/animations/variants';

interface BackendReview {
  _id: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt?: string;
  userId?: {
    _id?: string;
    name?: string;
    avatar?: string;
  };
  eventId?: {
    _id?: string;
    title?: string;
  };
}

function ReviewsPreview() {
  const { data: reviews = [], isLoading } = useQuery<DisplayReview[]>({
    queryKey: ['public-reviews'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: BackendReview[] }>('/reviews');
        const list = res.data?.data || [];
        return list.map((item) => ({
          id: item._id,
          name: item.userId?.name || 'Verified Traveler',
          avatar: item.userId?.avatar,
          rating: item.rating,
          comment: item.comment || item.title || 'Great tour experience!',
          tourTitle: item.eventId?.title || 'Tour Member',
          date: item.createdAt,
        }));
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Section id="reviews" aria-labelledby="reviews-heading" className="bg-muted/40 scroll-mt-20">
      <SectionTitle
        id="reviews-heading"
        eyebrow="পর্যটকদের অভিজ্ঞতা"
        title="আমাদের অতিথিরা যা বলেন"
        description="লাবিব ট্যুরের সাথে বাংলাদেশ ভ্রমণকারী সন্তুষ্ট পর্যটকদের বাস্তব অনুভূতি ও অভিজ্ঞতা।"
      />

      {isLoading ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border-border bg-card flex flex-col justify-between rounded-xl border p-6 shadow-xs"
            >
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-14 w-full" />
              </div>
              <div className="mt-6 flex items-center gap-3 border-t pt-4">
                <Skeleton className="size-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </motion.div>
      ) : (
        /* Honest, welcoming empty state when no verified reviews exist in DB yet */
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="border-border bg-card/60 mt-10 rounded-2xl border p-8 text-center shadow-xs md:p-12"
        >
          <div className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-2xl">
            <MessageSquareHeart className="size-7" />
          </div>

          <h3 className="font-display text-foreground mt-5 text-xl font-bold md:text-2xl">
            যাচাইকৃত অতিথি রিভিউ শীঘ্রই প্রকাশিত হচ্ছে
          </h3>

          <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-sm leading-relaxed">
            লাবিব ট্যুরের প্রতিটি রিভিউ শুধুমাত্র সেইসব পর্যটকদের দ্বারা রচিত যারা আমাদের সাথে ভ্রমণ সম্পন্ন করেছেন। আসন্ন ট্যুর দলগুলো ফিরে আসার সাথে সাথে তাদের অভিজ্ঞতা ও রেটিং এখানে সরাসরি প্রকাশিত হবে।
          </p>

          {/* Trust commitments */}
          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
            <div className="border-border/60 bg-background/80 flex items-start gap-3 rounded-lg border p-3.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              <div>
                <p className="text-foreground text-xs font-semibold">১০০% যাচাইকৃত</p>
                <p className="text-muted-foreground text-[11px]">
                  শুধুমাত্র আসল বুকিংকারী রিভিউ দিতে পারেন
                </p>
              </div>
            </div>

            <div className="border-border/60 bg-background/80 flex items-start gap-3 rounded-lg border p-3.5">
              <Sparkles className="text-accent-500 mt-0.5 size-4 shrink-0" />
              <div>
                <p className="text-foreground text-xs font-semibold">স্বচ্ছ মতামত</p>
                <p className="text-muted-foreground text-[11px]">
                  হোস্ট এবং ট্যুরের নিরপেক্ষ রেটিং
                </p>
              </div>
            </div>

            <div className="border-border/60 bg-background/80 flex items-start gap-3 rounded-lg border p-3.5">
              <Compass className="text-primary mt-0.5 size-4 shrink-0" />
              <div>
                <p className="text-foreground text-xs font-semibold">বাস্তব গন্তব্য</p>
                <p className="text-muted-foreground text-[11px]">
                  রুট ও থাকার ব্যবস্থা সম্পর্কে সঠিক তথ্য
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button asChild>
              <a href="#upcoming-events">আমাদের সাথে ভ্রমণের আনন্দ নিন</a>
            </Button>
          </div>
        </motion.div>
      )}
    </Section>
  );
}

export { ReviewsPreview };

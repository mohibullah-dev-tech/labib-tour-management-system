import { motion } from 'framer-motion';
import { Section } from '@/components/layout/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { ReviewCard } from '@/features/home/components/ReviewsPreview/ReviewCard';
import { GUEST_REVIEWS } from '@/features/home/data/reviews';
import { staggerContainer } from '@/lib/animations/variants';

function ReviewsPreview() {
  return (
    <Section aria-labelledby="reviews-heading" className="bg-muted/40">
      <SectionTitle
        id="reviews-heading"
        eyebrow="Guest Stories"
        title="What Our Guests Say"
        description="Real experiences from travelers who explored Bangladesh with us."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="laptop:grid-cols-4 mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2"
      >
        {GUEST_REVIEWS.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </motion.div>
    </Section>
  );
}

export { ReviewsPreview };

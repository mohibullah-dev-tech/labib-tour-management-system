import { motion } from 'framer-motion';
import { Section } from '@/components/layout/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { DestinationCard } from '@/features/home/components/PopularDestinations/DestinationCard';
import { DESTINATIONS } from '@/features/home/data/destinations';
import { staggerContainer } from '@/lib/animations/variants';

/**
 * Renders the static DESTINATIONS array today. Swapping to real data is a
 * one-line change at the call site — `DESTINATIONS` becomes
 * `useDestinations().data` from a TanStack Query hook — since this
 * component only cares about receiving a `Destination[]`, not where it
 * came from.
 */
function PopularDestinations() {
  return (
    <Section aria-labelledby="popular-destinations-heading">
      <SectionTitle
        id="popular-destinations-heading"
        eyebrow="Explore Bangladesh"
        title="Popular Destinations"
        description="Hand-picked destinations across the hills, beaches, and wetlands of Bangladesh."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="laptop:grid-cols-3 desktop:grid-cols-4 mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2"
      >
        {DESTINATIONS.map((destination) => (
          <DestinationCard key={destination.id} destination={destination} />
        ))}
      </motion.div>
    </Section>
  );
}

export { PopularDestinations };

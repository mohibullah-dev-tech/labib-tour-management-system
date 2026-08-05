import { motion } from 'framer-motion';
import { Section } from '@/components/layout/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { EventCard } from '@/features/home/components/UpcomingEvents/EventCard';
import { UPCOMING_EVENTS } from '@/features/home/data/events';
import { staggerContainer } from '@/lib/animations/variants';

function UpcomingEvents() {
  return (
    <Section aria-labelledby="upcoming-events-heading" className="bg-muted/40">
      <SectionTitle
        id="upcoming-events-heading"
        eyebrow="Don't Miss Out"
        title="Upcoming Events"
        description="Fixed-date group tours with limited seats — book early before they fill up."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="laptop:grid-cols-2 mt-10 grid grid-cols-1 gap-6"
      >
        {UPCOMING_EVENTS.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </motion.div>
    </Section>
  );
}

export { UpcomingEvents };

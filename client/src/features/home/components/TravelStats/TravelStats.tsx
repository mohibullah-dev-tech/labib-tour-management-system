import { motion } from 'framer-motion';
import { Section } from '@/components/layout/Section';
import { AnimatedCounter } from '@/features/home/components/TravelStats/AnimatedCounter';
import { TRAVEL_STATS } from '@/features/home/data/stats';
import { staggerContainer, fadeInUp } from '@/lib/animations/variants';

function TravelStats() {
  return (
    <Section aria-label="Travel statistics" className="bg-primary text-primary-foreground">
      <motion.dl
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="laptop:grid-cols-4 grid grid-cols-2 gap-8"
      >
        {TRAVEL_STATS.map(({ id, icon: Icon, value, suffix, label }) => (
          <motion.div
            key={id}
            variants={fadeInUp}
            className="flex flex-col items-center gap-2 text-center"
          >
            <Icon className="text-primary-foreground/80 size-7" aria-hidden="true" />
            <dd className="font-display laptop:text-4xl text-3xl font-semibold tracking-tight">
              <AnimatedCounter
                value={value}
                suffix={suffix}
                decimals={Number.isInteger(value) ? 0 : 1}
              />
            </dd>
            <dt className="text-primary-foreground/80 text-sm">{label}</dt>
          </motion.div>
        ))}
      </motion.dl>
    </Section>
  );
}

export { TravelStats };

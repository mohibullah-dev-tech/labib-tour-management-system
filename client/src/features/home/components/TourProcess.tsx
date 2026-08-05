import { motion } from 'framer-motion';
import { Section } from '@/components/layout/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { TOUR_PROCESS_STEPS } from '@/features/home/data/tour-process';
import { staggerContainer, fadeInUp } from '@/lib/animations/variants';

function TourProcess() {
  return (
    <Section aria-labelledby="tour-process-heading">
      <SectionTitle
        id="tour-process-heading"
        eyebrow="How It Works"
        title="Your Journey, Five Simple Steps"
        align="center"
        className="mx-auto"
      />

      <motion.ol
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="laptop:grid-cols-5 relative mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2"
      >
        {TOUR_PROCESS_STEPS.map(({ id, step, icon: Icon, title, description }, index) => (
          <motion.li
            key={id}
            variants={fadeInUp}
            className="relative flex flex-col items-center gap-3 text-center"
          >
            {/* Connecting line between steps on laptop+ (decorative only) */}
            {index < TOUR_PROCESS_STEPS.length - 1 && (
              <div
                aria-hidden="true"
                className="bg-border laptop:block absolute top-7 left-1/2 hidden h-px w-full -translate-y-1/2"
              />
            )}
            <div className="bg-primary text-primary-foreground relative z-10 flex size-14 items-center justify-center rounded-full shadow-md">
              <Icon className="size-6" aria-hidden="true" />
            </div>
            <span className="text-primary text-xs font-semibold tracking-wide uppercase">
              Step {step}
            </span>
            <h3 className="font-display text-foreground text-base font-semibold">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
          </motion.li>
        ))}
      </motion.ol>
    </Section>
  );
}

export { TourProcess };

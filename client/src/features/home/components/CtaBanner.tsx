import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Section } from '@/components/layout/Section';
import { Button } from '@/components/ui/button';
import { fadeInUp } from '@/lib/animations/variants';

/**
 * Large closing banner before FAQ/Newsletter — a deliberate second CTA
 * moment distinct from the Hero's, for visitors who scrolled the whole
 * page without converting at the top.
 */
function CtaBanner() {
  return (
    <Section aria-labelledby="cta-heading" contained={false}>
      <div className="bg-primary text-primary-foreground laptop:mx-8 laptop:py-20 ultrawide:mx-auto ultrawide:max-w-[1800px] mx-4 overflow-hidden rounded-xl px-6 py-16 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeInUp}
          className="mx-auto flex max-w-2xl flex-col items-center gap-6"
        >
          <h2
            id="cta-heading"
            className="font-display laptop:text-4xl text-3xl font-semibold tracking-tight"
          >
            Book Your Next Adventure Today
          </h2>
          <p className="text-primary-foreground/85">
            Seats fill up fast on our most popular routes — reserve yours before the next group
            departs.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/tours">Book a Tour</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-primary-foreground border-white/40 bg-transparent hover:bg-white/10"
              asChild
            >
              <Link to="/contact">Talk to Us</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

export { CtaBanner };

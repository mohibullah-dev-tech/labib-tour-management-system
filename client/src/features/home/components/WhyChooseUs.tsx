import { motion } from 'framer-motion';
import { Section } from '@/components/layout/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { WHY_CHOOSE_US } from '@/features/home/data/why-choose-us';
import { staggerContainer, fadeInUp } from '@/lib/animations/variants';

function WhyChooseUs() {
  return (
    <Section aria-labelledby="why-choose-us-heading">
      <SectionTitle
        id="why-choose-us-heading"
        eyebrow="কেন আমাদের সাথে ভ্রমণ করবেন"
        title="কেন বেছে নেবেন লাবিব ট্যুর"
        description="যেসব সুবিধার কারণে হাজারো পর্যটক বারবার আমাদের সাথেই ভ্রমণ করেন।"
      />

      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="laptop:grid-cols-3 mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2"
      >
        {WHY_CHOOSE_US.map(({ id, icon: Icon, title, description }) => (
          <motion.li
            key={id}
            variants={fadeInUp}
            className="border-border bg-card flex flex-col gap-4 rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="bg-primary-50 text-primary dark:bg-primary-950 flex size-12 items-center justify-center rounded-full">
              <Icon className="size-6" aria-hidden="true" />
            </div>
            <h3 className="font-display text-foreground text-base font-semibold">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
          </motion.li>
        ))}
      </motion.ul>
    </Section>
  );
}

export { WhyChooseUs };

import { motion } from 'framer-motion';
import { Section } from '@/components/layout/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQ_ITEMS } from '@/features/home/data/faq';
import { fadeInUp } from '@/lib/animations/variants';

function FaqPreview() {
  return (
    <Section aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl">
        <SectionTitle
          id="faq-heading"
          eyebrow="Questions & Answers"
          title="Frequently Asked Questions"
          align="center"
          className="mx-auto"
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeInUp}
          className="mt-10"
        >
          <Accordion type="single" collapsible>
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </Section>
  );
}

export { FaqPreview };

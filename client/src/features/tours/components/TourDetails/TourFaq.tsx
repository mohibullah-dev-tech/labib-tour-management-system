import type { TourFaqItem } from '@/features/tours/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export interface TourFaqProps {
  faq?: TourFaqItem[];
}

function TourFaq({ faq }: TourFaqProps) {
  if (!faq?.length) return null;

  return (
    <Accordion type="single" collapsible>
      {faq.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export { TourFaq };

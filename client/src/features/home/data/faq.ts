export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-booking',
    question: 'How do I book a tour with Labib Tour?',
    answer:
      'Choose a tour or upcoming event, select your seats, and confirm your booking with a partial advance payment. You\u2019ll receive a confirmation with your seat number, bus details, and departure point.',
  },
  {
    id: 'faq-payment',
    question: 'What payment methods are accepted?',
    answer:
      'We accept bKash, Nagad, Rocket, and direct bank transfer. Full payment details are shared once your booking is confirmed.',
  },
  {
    id: 'faq-cancellation',
    question: 'What is the cancellation policy?',
    answer:
      'Cancellations made at least 7 days before departure are eligible for a partial refund. Please see the specific tour\u2019s terms for exact cutoff dates and fees.',
  },
  {
    id: 'faq-group',
    question: 'Do you offer group or corporate discounts?',
    answer:
      'Yes — groups of 10 or more, and corporate bookings, are eligible for custom pricing. Contact our support team for a tailored quote.',
  },
  {
    id: 'faq-safety',
    question: 'How is guest safety handled during the trip?',
    answer:
      'Every tour travels with an experienced host and a licensed driver, and we maintain 24/7 support contact throughout the journey for any emergency.',
  },
];

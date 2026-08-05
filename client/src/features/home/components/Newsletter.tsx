import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Section } from '@/components/layout/Section';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { fadeInUp } from '@/lib/animations/variants';

/**
 * UI only — no subscription API exists yet. Submitting shows a toast
 * acknowledging the address instead of silently doing nothing, so the
 * interaction feels complete even before the backend endpoint exists.
 * Swap the `handleSubmit` body for a real mutation once the Newsletter
 * feature/API is built.
 */
function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    toast.success("You're on the list!", { description: `We'll send travel updates to ${email}.` });
    setEmail('');
  };

  return (
    <Section aria-labelledby="newsletter-heading" className="bg-muted/40">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeInUp}
        className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center"
      >
        <div className="bg-primary-50 text-primary dark:bg-primary-950 flex size-12 items-center justify-center rounded-full">
          <Mail className="size-6" aria-hidden="true" />
        </div>
        <h2
          id="newsletter-heading"
          className="font-display text-foreground laptop:text-3xl text-2xl font-semibold"
        >
          Get Travel Deals in Your Inbox
        </h2>
        <p className="text-muted-foreground">
          New destinations, early access to events, and seasonal discounts — no spam.
        </p>

        <form onSubmit={handleSubmit} className="mt-2 flex w-full flex-col gap-3 sm:flex-row">
          <Label htmlFor="newsletter-email" className="sr-only">
            Email address
          </Label>
          <Input
            id="newsletter-email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Subscribe</Button>
        </form>
      </motion.div>
    </Section>
  );
}

export { Newsletter };

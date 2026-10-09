import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/axios';
import { fadeInUp } from '@/lib/animations/variants';

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name (at least 2 characters)'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(6, 'Please enter a valid phone number')
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  subject: z.string().trim().min(3, 'Please specify the subject or tour you are asking about'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters long'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSubmitSuccess(false);

    try {
      await apiClient.post('/contact', values);
      setSubmitSuccess(true);
      reset();
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { error?: { message?: string } } };
        message?: string;
      };
      setErrorMessage(
        errorObj.response?.data?.error?.message ||
          errorObj.message ||
          'Failed to send message. Please try again or reach out directly via phone or WhatsApp.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section id="contact" aria-labelledby="contact-heading" className="bg-muted/40 scroll-mt-20">
      <SectionTitle
        id="contact-heading"
        eyebrow="We Are Here To Help"
        title="Contact & Tour Inquiries"
        description="Have a question about an upcoming departure, customized group package, or seat booking? Get in touch with our team."
      />

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left Column: Direct Contact Info & Office Details */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="space-y-6 lg:col-span-5"
        >
          <div className="border-border bg-card rounded-2xl border p-6 shadow-xs">
            <h3 className="font-display text-foreground text-xl font-bold">
              Labib Tour Headquarters
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Visit our central operations office or get in touch through any of our direct
              channels.
            </p>

            <div className="mt-6 space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <p className="text-foreground text-xs font-semibold">Head Office</p>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    House 12, Road 5, Dhanmondi, Dhaka 1209, Bangladesh
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3.5">
                <div className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Phone className="size-4" />
                </div>
                <div>
                  <p className="text-foreground text-xs font-semibold">Call & Support</p>
                  <a
                    href="tel:+8801700000000"
                    className="text-foreground hover:text-primary mt-0.5 block text-sm font-medium transition-colors"
                  >
                    +880 1700-000000
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Mail className="size-4" />
                </div>
                <div>
                  <p className="text-foreground text-xs font-semibold">Email Us</p>
                  <a
                    href="mailto:support@labibtours.com"
                    className="text-foreground hover:text-primary mt-0.5 block text-sm font-medium transition-colors"
                  >
                    support@labibtours.com
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3.5">
                <div className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Clock className="size-4" />
                </div>
                <div>
                  <p className="text-foreground text-xs font-semibold">Office Hours</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Saturday – Thursday: 9:00 AM – 8:00 PM
                  </p>
                  <p className="text-muted-foreground text-xs">Friday: 2:00 PM – 8:00 PM</p>
                  <p className="text-primary mt-1 text-[11px] font-medium">
                    Average response time: &lt; 2 hours
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions (WhatsApp & Facebook) */}
            <div className="border-border mt-6 border-t pt-5">
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Instant Chat & Social
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-1.5 text-xs hover:border-emerald-500 hover:text-emerald-600"
                >
                  <a
                    href="https://wa.me/8801700000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with Labib Tour on WhatsApp"
                  >
                    <MessageSquare className="size-3.5 text-emerald-500" />
                    WhatsApp Direct
                    <ExternalLink className="size-3 opacity-60" />
                  </a>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-1.5 text-xs hover:border-blue-500 hover:text-blue-600"
                >
                  <a
                    href="https://facebook.com/labibtours"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit Labib Tour on Facebook"
                  >
                    <span>Facebook Community</span>
                    <ExternalLink className="size-3 opacity-60" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Inquiry Form */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="lg:col-span-7"
        >
          <div className="border-border bg-card rounded-2xl border p-6 shadow-xs sm:p-8">
            <h3 className="font-display text-foreground text-xl font-bold">Send Us an Inquiry</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Fill in your details and tour preferences. Our reservation coordinators will get back
              to you promptly.
            </p>

            {submitSuccess && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-200"
              >
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="text-sm">
                  <p className="font-semibold">Message sent successfully!</p>
                  <p className="mt-0.5 text-xs opacity-90">
                    Thank you for reaching out. A Labib Tour coordinator has received your inquiry
                    and will reply within office hours.
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="border-destructive/30 bg-destructive/10 text-destructive mt-6 flex items-start gap-3 rounded-xl border p-4"
              >
                <AlertCircle className="mt-0.5 size-5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold">Failed to send message</p>
                  <p className="mt-0.5 text-xs opacity-90">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-name"
                    placeholder="e.g. Tanvir Ahmed"
                    invalid={Boolean(errors.name)}
                    {...register('name')}
                  />
                  {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="e.g. tanvir@example.com"
                    invalid={Boolean(errors.email)}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="contact-phone">Phone Number (Optional)</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="e.g. +880 1712-345678"
                    invalid={Boolean(errors.phone)}
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-destructive text-xs">{errors.phone.message}</p>
                  )}
                </div>

                {/* Subject / Tour Interested */}
                <div className="space-y-1.5">
                  <Label htmlFor="contact-subject">
                    Subject / Tour <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-subject"
                    placeholder="e.g. Bandarban Tour / Custom Group"
                    invalid={Boolean(errors.subject)}
                    {...register('subject')}
                  />
                  {errors.subject && (
                    <p className="text-destructive text-xs">{errors.subject.message}</p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <Label htmlFor="contact-message">
                  Your Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="contact-message"
                  rows={4}
                  placeholder="Tell us about your travel dates, group size, or questions..."
                  invalid={Boolean(errors.message)}
                  {...register('message')}
                />
                {errors.message && (
                  <p className="text-destructive text-xs">{errors.message.message}</p>
                )}
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? (
                    'Sending Message...'
                  ) : (
                    <>
                      <Send className="mr-2 size-4" />
                      Submit Inquiry
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

export { ContactSection };

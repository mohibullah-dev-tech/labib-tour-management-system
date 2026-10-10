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
  name: z.string().trim().min(2, 'দয়া করে আপনার পূর্ণ নাম লিখুন (কমপক্ষে ২ অক্ষর)'),
  email: z.string().trim().email('দয়া করে একটি সঠিক ইমেইল ঠিকানা দিন'),
  phone: z
    .string()
    .trim()
    .min(6, 'সঠিক ফোন নম্বর প্রদান করুন')
    .max(20, 'ফোন নম্বরটি অতিরিক্ত দীর্ঘ')
    .optional()
    .or(z.literal('')),
  subject: z.string().trim().min(3, 'দয়া করে বিষয় বা ট্যুরের নাম উল্লেখ করুন'),
  message: z.string().trim().min(10, 'বার্তাটি কমপক্ষে ১০ অক্ষরের হতে হবে'),
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
          'বার্তা পাঠাতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন বা সরাসরি ফোন/হোয়াটসঅ্যাপে যোগাযোগ করুন।',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section id="contact" aria-labelledby="contact-heading" className="bg-muted/40 scroll-mt-20">
      <SectionTitle
        id="contact-heading"
        eyebrow="আমরা সবসময় আপনার পাশে আছি"
        title="যোগাযোগ ও ট্যুর অনুসন্ধান"
        description="আসন্ন ট্যুরের তথ্য, কাস্টমাইজড গ্রুপ প্যাকেজ বা সিট বুকিং সংক্রান্ত যেকোনো তথ্যের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।"
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
              লাবিব ট্যুর প্রধান কার্যালয়
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              আমাদের কেন্দ্রীয় অফিসে সরাসরি আসুন অথবা যেকোনো মাধ্যমে যোগাযোগ করুন।
            </p>

            <div className="mt-6 space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <p className="text-foreground text-xs font-semibold">হেড অফিস</p>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    বাড়ি ১২, রোড ৫, ধানমন্ডি, ঢাকা ১২০৯, বাংলাদেশ
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3.5">
                <div className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Phone className="size-4" />
                </div>
                <div>
                  <p className="text-foreground text-xs font-semibold">কল ও কাস্টমার কেয়ার</p>
                  <a
                    href="tel:+8801700000000"
                    className="text-foreground hover:text-primary mt-0.5 block text-sm font-medium transition-colors"
                  >
                    +৮৮০ ১৭০০-০০০০০০
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg">
                  <Mail className="size-4" />
                </div>
                <div>
                  <p className="text-foreground text-xs font-semibold">ইমেইল করুন</p>
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
                  <p className="text-foreground text-xs font-semibold">অফিস সময়সূচি</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    শনিবার – বৃহস্পতিবার: সকাল ৯:০০ – রাত ৮:০০
                  </p>
                  <p className="text-muted-foreground text-xs">শুক্রবার: দুপুর ২:০০ – রাত ৮:০০</p>
                  <p className="text-primary mt-1 text-[11px] font-medium">
                    গড় রেসপন্স সময়: ২ ঘণ্টার মধ্যে
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions (WhatsApp & Facebook) */}
            <div className="border-border mt-6 border-t pt-5">
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                সোশ্যাল মিডিয়া ও চ্যাট
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
                    হোয়াটসঅ্যাপে চ্যাট করুন
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
                    <span>ফেসবুক পেজ</span>
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
            <h3 className="font-display text-foreground text-xl font-bold">আমাদের বার্তা পাঠান</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              আপনার বিবরণ ও পছন্দের ট্যুরের তথ্য পূরণ করুন। আমাদের টিম দ্রুত আপনার সাথে যোগাযোগ করবে।
            </p>

            {submitSuccess && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-200"
              >
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="text-sm">
                  <p className="font-semibold">আপনার বার্তা সফলভাবে পাঠানো হয়েছে!</p>
                  <p className="mt-0.5 text-xs opacity-90">
                    যোগাযোগের জন্য ধন্যবাদ। আমাদের প্রতিনিধি আপনার বার্তা পেয়েছেন এবং দ্রুত যোগাযোগ করবেন।
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
                  <p className="font-semibold">বার্তা পাঠানো ব্যর্থ হয়েছে</p>
                  <p className="mt-0.5 text-xs opacity-90">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">
                    আপনার পুরো নাম <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-name"
                    placeholder="যেমন: তানভীর আহমেদ"
                    invalid={Boolean(errors.name)}
                    {...register('name')}
                  />
                  {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email">
                    ইমেইল ঠিকানা <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="যেমন: tanvir@example.com"
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
                  <Label htmlFor="contact-phone">মোবাইল নম্বর (ঐচ্ছিক)</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="যেমন: ০১৭০০-০০০০০০"
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
                    বিষয় / ট্যুরের নাম <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact-subject"
                    placeholder="যেমন: সাজেক ভ্যালি ট্যুর / গ্রুপ প্যাকেজ"
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
                  আপনার বার্তা বা প্রশ্ন <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="contact-message"
                  rows={4}
                  placeholder="ভ্রমণের তারিখ, সদস্য সংখ্যা বা আপনার যেকোনো জিজ্ঞাসা লিখুন..."
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
                    'বার্তা পাঠানো হচ্ছে...'
                  ) : (
                    <>
                      <Send className="mr-2 size-4" />
                      বার্তা পাঠান
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

import { useState } from 'react';
import { MessageCircle, Phone, LifeBuoy, AlertOctagon, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const WHATSAPP_SUPPORT_URL = 'https://wa.me/8801000000000';
const EMERGENCY_HOTLINE = '+880 1700-000000';

const FAQ_ITEMS = [
  {
    q: 'How and when do I report for my tour departure?',
    a: 'You must arrive at your selected pickup point at least 30 minutes prior to the scheduled departure time. Your lead tour host will contact you via WhatsApp/Phone 2-3 hours before departure with exact bus bay details.',
  },
  {
    q: 'What should I carry for Sajek Valley, Bandarban & Hill Tracts?',
    a: 'Original National ID card (or Passport/Birth Certificate) is mandatory for military check-posts. Please bring comfortable hiking shoes, light rain jacket, mosquito repellent, power bank, and cash (ATMs are scarce in remote hill tracts).',
  },
  {
    q: 'What is the refund and cancellation policy?',
    a: 'Cancellations requested 7+ days before departure are eligible for an 80% refund. Cancellations made 3-6 days before receive a 50% refund. Cancellations within 48 hours of departure are non-refundable due to pre-booked hotel and bus seats.',
  },
  {
    q: 'Can I change my pickup location after booking?',
    a: 'Yes, you can update your preferred pickup location up to 24 hours before departure by editing your profile or contacting your assigned tour host directly.',
  },
  {
    q: 'What happens in case of extreme weather or road blockades?',
    a: 'Passenger safety is our highest priority. In case of government advisories, landslides, or severe cyclonic warnings, tours are rescheduled with zero penalty fees, or full credit vouchers are provided.',
  },
];

export function SupportCard() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please enter both subject and message.');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSubject('');
      setMessage('');
      toast.success('Support message sent successfully!', {
        description: 'Our customer support representative will get back to you within 2 hours.',
      });
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top 3 Support Channels */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* WhatsApp Support */}
        <Card className="border-border bg-card shadow-xs transition-all hover:shadow-md">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
            <div className="flex items-start gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <MessageCircle className="size-6" />
              </div>
              <div>
                <h4 className="text-foreground text-sm font-semibold sm:text-base">
                  WhatsApp Support
                </h4>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Instant live response from our tour operations team.
                </p>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <a href={WHATSAPP_SUPPORT_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* 24/7 Telephone Hotline */}
        <Card className="border-border bg-card shadow-xs transition-all hover:shadow-md">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
            <div className="flex items-start gap-3.5">
              <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                <Phone className="size-6" />
              </div>
              <div>
                <h4 className="text-foreground text-sm font-semibold sm:text-base">
                  Telephone Support
                </h4>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Available daily from 08:00 AM to 11:00 PM.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="w-full gap-2">
              <a href={`tel:${EMERGENCY_HOTLINE}`}>
                <Phone className="size-4" />
                <span>Call Hotline</span>
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Emergency Dispatch */}
        <Card className="border-border bg-card shadow-xs transition-all hover:shadow-md">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
            <div className="flex items-start gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertOctagon className="size-6" />
              </div>
              <div>
                <h4 className="text-foreground text-sm font-semibold sm:text-base">
                  Emergency Contact
                </h4>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  24/7 roadside assistance &amp; tour safety squad.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="destructive" className="w-full gap-2">
              <a href={`tel:${EMERGENCY_HOTLINE}`}>
                <AlertOctagon className="size-4" />
                <span>Call SOS Dispatch</span>
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Support Ticket / Message Form */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
              <LifeBuoy className="size-4" />
              <span>Help Desk</span>
            </div>
            <CardTitle className="text-xl">Message Tour Support</CardTitle>
            <CardDescription className="text-xs">
              Have a question about your booking, payment verification, or tour itinerary? Send us a
              direct message.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleMessageSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="support-subject" className="text-xs font-semibold">
                  Inquiry Subject
                </Label>
                <Input
                  id="support-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Change pickup location or dietary requirement"
                  className="text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="support-message" className="text-xs font-semibold">
                  Message Details
                </Label>
                <Textarea
                  id="support-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry with booking ID if applicable..."
                  rows={4}
                  className="resize-none text-sm"
                  required
                />
              </div>

              <Button
                type="submit"
                size="sm"
                isLoading={isSending}
                className="w-full gap-2 self-start sm:w-auto"
              >
                <Send className="size-3.5" />
                <span>Send Message</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tour FAQs */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader>
            <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
              <CheckCircle2 className="size-4" />
              <span>Frequently Asked Questions</span>
            </div>
            <CardTitle className="text-xl">Guest Travel FAQ</CardTitle>
            <CardDescription className="text-xs">
              Quick answers to common questions about luggage, check-in, and safety.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="hover:text-primary text-left text-xs font-medium sm:text-sm">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-xs leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

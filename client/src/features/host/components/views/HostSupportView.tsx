import { Phone, MessageCircle, AlertOctagon, ShieldAlert, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface HostSupportViewProps {
  onOpenReportProblem: () => void;
}

const ADMIN_PHONE = '+880 1700-000001';
const ADMIN_WHATSAPP_URL = 'https://wa.me/8801700000001';
const EMERGENCY_SOS_PHONE = '+880 1700-000009';

const GUIDE_FAQS = [
  {
    q: 'What should I do if a guest misses the Sayedabad departure time?',
    a: 'Immediately attempt 2 phone calls. If unreachable 10 minutes past reporting time, coordinate with the driver to verify luggage status. En-route guests can board at Arambagh or Abdullahpur stops if coordinated in advance with Central Dispatch.',
  },
  {
    q: 'What is the standard protocol for the Baghaihat military convoy gate?',
    a: 'Arrive at Baghaihat Army Camp by 09:30 AM. Present the approved LTMS passenger manifest and National ID photocopies at the escort counter. Armed escort convoy leaves promptly at 10:30 AM. No private vehicle is allowed to proceed without convoy.',
  },
  {
    q: 'How do I handle a mechanical bus breakdown on the highway?',
    a: 'Ensure vehicle is pulled over safely on highway shoulder with hazard lights and safety triangle placed 50 meters back. Notify passengers calmly, call the Fleet Support hotline, and file an instant incident dispatch using the "Report Problem" tool above.',
  },
  {
    q: 'How are guest medical issues or altitude/motion sickness managed?',
    a: 'Every LTMS coach carries an authorized First Aid kit under the helper seat containing oral rehydration salts, dimenhydrinate (anti-emetic), bandages, and antiseptic. For severe cases, halt at the nearest Upazila Health Complex.',
  },
  {
    q: 'Can a guest pay their remaining due balance in cash to the host?',
    a: 'Yes. Hosts are authorized to collect cash dues before boarding. You must issue the physical paper receipt slip and verify payment status in the app manifest.',
  },
];

export function HostSupportView({ onOpenReportProblem }: HostSupportViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-display text-foreground text-lg font-bold sm:text-xl">
          Tour Leader Field Support &amp; Emergency Escalation
        </h3>
        <p className="text-muted-foreground mt-0.5 text-xs">
          24/7 direct communication with operations dispatch, fleet management, and emergency
          response teams.
        </p>
      </div>

      {/* Emergency Hotline & Direct Admin Contact Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Card 1: Emergency SOS Hotline */}
        <Card className="flex flex-col justify-between gap-4 border-rose-500/30 bg-rose-500/5 p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold tracking-wider text-rose-600 uppercase">
                Urgent Priority
              </span>
              <h4 className="text-foreground text-sm font-bold">24/7 Field SOS Hotline</h4>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Accidents, security incidents, or severe medical emergencies.
              </p>
            </div>
          </div>

          <Button
            asChild
            size="sm"
            className="h-9 w-full gap-2 bg-rose-600 font-bold text-white hover:bg-rose-700"
          >
            <a href={`tel:${EMERGENCY_SOS_PHONE}`}>
              <Phone className="size-4" />
              <span>Call SOS: {EMERGENCY_SOS_PHONE}</span>
            </a>
          </Button>
        </Card>

        {/* Card 2: Operations Admin Phone */}
        <Card className="border-border bg-card flex flex-col justify-between gap-4 p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Phone className="size-5" />
            </div>
            <div>
              <span className="text-primary block text-[10px] font-bold tracking-wider uppercase">
                Central Operations
              </span>
              <h4 className="text-foreground text-sm font-bold">Call Admin Desk</h4>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Route delays, passenger rescheduling, and manifest questions.
              </p>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 w-full gap-2 text-xs font-semibold"
          >
            <a href={`tel:${ADMIN_PHONE}`}>
              <Phone className="text-primary size-3.5" />
              <span>Call Admin: {ADMIN_PHONE}</span>
            </a>
          </Button>
        </Card>

        {/* Card 3: WhatsApp Dispatch */}
        <Card className="border-border bg-card flex flex-col justify-between gap-4 p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <MessageCircle className="size-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                Instant Chat
              </span>
              <h4 className="text-foreground text-sm font-bold">WhatsApp Admin Support</h4>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Send vehicle photos, fuel receipts, and checkpoint slips.
              </p>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 w-full gap-2 border-emerald-500/30 text-xs font-semibold text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
          >
            <a href={ADMIN_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-3.5 text-emerald-600" />
              <span>Chat on WhatsApp</span>
            </a>
          </Button>
        </Card>
      </div>

      {/* Report Problem Action Banner */}
      <Card className="border-border from-card to-muted/40 flex flex-col justify-between gap-4 bg-gradient-to-r p-5 shadow-xs sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="bg-destructive/10 text-destructive flex size-10 shrink-0 items-center justify-center rounded-xl">
            <AlertOctagon className="size-5" />
          </div>
          <div>
            <h4 className="text-foreground text-sm font-bold">
              Need to Report a Coach Breakdown or Road Hazard?
            </h4>
            <p className="text-muted-foreground mt-0.5 max-w-xl text-xs">
              Log an official field incident report. Operations staff and nearby support mechanics
              are immediately notified.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="destructive"
          className="shrink-0 gap-2 self-start text-xs font-bold sm:self-center"
          onClick={onOpenReportProblem}
        >
          <AlertOctagon className="size-4" />
          <span>Report Problem</span>
        </Button>
      </Card>

      {/* Tour Leader Field FAQ Accordion */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-2">
          <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <HelpCircle className="size-4" />
            <span>Field Guide Knowledgebase</span>
          </div>
          <CardTitle className="text-base">
            Standard Operating Procedures &amp; Field FAQs
          </CardTitle>
          <CardDescription className="text-xs">
            Official guidelines for military escorts, emergency response, and passenger handling.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <Accordion type="single" collapsible className="w-full">
            {GUIDE_FAQS.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border/60">
                <AccordionTrigger className="text-foreground py-3 text-xs font-semibold hover:no-underline">
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
  );
}

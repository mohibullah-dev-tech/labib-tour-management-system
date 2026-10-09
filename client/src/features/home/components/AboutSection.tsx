import { motion } from 'framer-motion';
import { Compass, Bus, ShieldCheck, Radio, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { Section } from '@/components/layout/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { Button } from '@/components/ui/button';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

const HIGHLIGHTS = [
  {
    icon: Compass,
    title: 'Experienced Tour Hosts',
    description:
      'Every journey is led by trained, professional trip leads who oversee logistics, passenger safety, and local experiences.',
  },
  {
    icon: Bus,
    title: 'AC Fleet & Live Seat Selection',
    description:
      'Air-conditioned Scania and Hino coaches with real-time seat locking so you always get the exact seat you picked.',
  },
  {
    icon: Radio,
    title: 'Live Tour & GPS Tracking',
    description:
      'Real-time bus tracking and broadcast announcements keep travelers and families informed throughout the journey.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent & Safe Booking',
    description:
      'Instant digital PDF confirmation slips, verified booking records, and direct support from our Dhanmondi central office.',
  },
];

const METRICS = [
  { value: '8,500+', label: 'Happy Travelers' },
  { value: '320+', label: 'Successful Tours' },
  { value: '24', label: 'Scenic Destinations' },
  { value: '2019', label: 'Founded in Dhaka' },
];

function AboutSection() {
  return (
    <Section id="about" aria-labelledby="about-heading" className="scroll-mt-20">
      <SectionTitle
        id="about-heading"
        eyebrow="Our Story & Mission"
        title="About Labib Tour"
        description="Pioneering modern, safe, and thoughtfully curated group travel across Bangladesh since 2019."
      />

      <div className="mt-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        {/* Left Column: Narrative */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="space-y-6 lg:col-span-6"
        >
          <div className="space-y-4">
            <h3 className="font-display text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Curated journeys designed to be remembered.
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              Labib Tour Management was founded in 2019 with a straightforward mission: to eliminate
              the stress of traveling in Bangladesh and replace it with reliable, well-coordinated,
              and comfortable group expeditions.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed">
              Headquartered at Dhanmondi, Dhaka, we design every itinerary from the ground up — from
              reserving premium AC coaches and securing handpicked hillside eco-resorts to
              stationing experienced tour hosts on every trip. Whether you are trekking the peaks of
              Bandarban or sailing the calm waters of Tanguar Haor, our team handles all logistics
              so you can focus entirely on the journey.
            </p>
          </div>

          <div className="border-border/80 bg-muted/30 rounded-xl border p-5">
            <h4 className="text-foreground text-sm font-semibold">Our Travel Standards</h4>
            <ul className="mt-3 space-y-2.5">
              {[
                'Strict bus departure schedules with timely boarding from Dhaka hubs',
                'Pre-vetted boutique hotels, lakeside cottages, and hillside resorts',
                'Transparent pricing with clear inclusion of transport, stay, and meals',
                '24/7 dedicated support and in-trip assistance from your host',
              ].map((item) => (
                <li
                  key={item}
                  className="text-muted-foreground flex items-start gap-2.5 text-xs sm:text-sm"
                >
                  <CheckCircle className="text-primary mt-0.5 size-4 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button asChild>
              <a href="#upcoming-events">
                View Upcoming Tours
                <ArrowRight className="ml-2 size-4" />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#contact">
                <MapPin className="mr-2 size-4" />
                Contact Our Office
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Right Column: Operational Pillars Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-6"
        >
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                className="border-border bg-card hover:border-primary/50 group flex flex-col justify-between rounded-xl border p-6 shadow-xs transition-all duration-300 hover:shadow-md"
              >
                <div>
                  <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-4 flex size-11 items-center justify-center rounded-lg transition-colors">
                    <Icon className="size-5" />
                  </div>
                  <h4 className="text-foreground font-display text-base font-semibold">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed sm:text-sm">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Trust & Track Record Metrics */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="border-border bg-card mt-16 grid grid-cols-2 gap-6 rounded-2xl border p-6 text-center shadow-xs sm:grid-cols-4 md:p-8"
      >
        {METRICS.map((metric) => (
          <div key={metric.label} className="space-y-1">
            <p className="font-display text-primary text-3xl font-extrabold tracking-tight sm:text-4xl">
              {metric.value}
            </p>
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase sm:text-sm">
              {metric.label}
            </p>
          </div>
        ))}
      </motion.div>
    </Section>
  );
}

export { AboutSection };

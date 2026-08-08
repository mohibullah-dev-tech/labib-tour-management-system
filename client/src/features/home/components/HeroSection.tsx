import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/Container';
import { SearchTourWidget } from '@/features/home/components/SearchTourWidget';
import { AnimatedCounter } from '@/features/home/components/TravelStats/AnimatedCounter';
import { fadeInUp, fadeIn } from '@/lib/animations/variants';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const HERO_IMAGE = 'https://picsum.photos/seed/ltms-hero-bandarban/1920/1080';

const HERO_MINI_STATS = [
  { id: 'guests', value: 8500, suffix: '+', label: 'Happy Guests' },
  { id: 'destinations', value: 24, suffix: '+', label: 'Destinations' },
  { id: 'rating', value: 4.8, suffix: '/5', label: 'Guest Rating' },
];

/**
 * Full-viewport cinematic hero. `-mt-16` pulls the section up by exactly
 * the Navbar's height (`h-16`) so the background image starts at the
 * very top of the viewport, behind the sticky-but-transparent Navbar —
 * PublicLayout sets `transparentNavbar` for this route via the route
 * `handle` (see router/index.tsx), not a prop passed from here.
 */
function HeroSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative -mt-16 flex min-h-dvh flex-col justify-end overflow-hidden">
      {/* Background image — eager + high priority: this IS the LCP element, must never lazy-load. */}
      <img
        src={HERO_IMAGE}
        alt="Misty green hills of Bandarban, Bangladesh"
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/20" />

      <Container className="laptop:pb-16 laptop:pt-48 relative z-10 flex flex-col gap-8 pt-40 pb-24">
        <motion.div
          initial={reducedMotion ? false : 'hidden'}
          animate="visible"
          variants={fadeInUp}
          className="flex max-w-2xl flex-col gap-5"
        >
          <span className="w-fit rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white uppercase backdrop-blur">
            Bangladesh&rsquo;s Trusted Travel Partner
          </span>
          <h1 className="font-display laptop:text-6xl text-4xl leading-[1.1] font-semibold tracking-tight text-white sm:text-5xl">
            Discover Bangladesh&rsquo;s Untold Beauty
          </h1>
          <p className="laptop:text-lg max-w-lg text-base leading-relaxed text-white/85">
            From cloud-wrapped hills to golden beaches — curated group tours, experienced hosts, and
            journeys designed to be remembered.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/booking">Book Tour</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
              asChild
            >
              <Link to="/events">View Events</Link>
            </Button>
          </div>
        </motion.div>

        <motion.dl
          initial={reducedMotion ? false : 'hidden'}
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.3 }}
          className="flex max-w-md gap-8"
        >
          {HERO_MINI_STATS.map((stat) => (
            <div key={stat.id}>
              <dd className="font-display laptop:text-3xl text-2xl font-semibold text-white">
                <AnimatedCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={Number.isInteger(stat.value) ? 0 : 1}
                />
              </dd>
              <dt className="text-xs text-white/70">{stat.label}</dt>
            </div>
          ))}
        </motion.dl>

        <motion.div
          initial={reducedMotion ? false : 'hidden'}
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.45 }}
          className="laptop:absolute laptop:inset-x-0 laptop:bottom-0 laptop:translate-y-1/2 laptop:px-8"
        >
          <SearchTourWidget />
        </motion.div>
      </Container>

      {!reducedMotion && (
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="laptop:hidden absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/70"
          aria-hidden="true"
        >
          <ChevronDown className="size-6" />
        </motion.div>
      )}
    </section>
  );
}

export { HeroSection };

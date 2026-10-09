import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Section } from '@/components/layout/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { EventCard } from '@/features/home/components/UpcomingEvents/EventCard';
import { UPCOMING_EVENTS, type UpcomingEvent } from '@/features/home/data/events';
import { staggerContainer } from '@/lib/animations/variants';
import { apiClient } from '@/lib/axios';
import { Skeleton } from '@/components/ui/skeleton';

interface ApiTourEvent {
  _id: string;
  eventCode: string;
  startDate: string;
  endDate: string;
  capacity?: number;
  tourTemplateId?: {
    _id: string;
    title: string;
    slug: string;
    destination: string;
    durationDays: number;
    pricing?: { basePrice: number };
    packageTiers?: string[];
    featuredImage?: string;
  };
  busId?: {
    name: string;
    isAC: boolean;
    type: string;
  };
}

function UpcomingEvents() {
  const { data: apiEvents, isLoading } = useQuery({
    queryKey: ['home', 'upcoming-events'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ success: boolean; data: { items: ApiTourEvent[] } }>(
          '/events?limit=6',
        );
        return res.data?.data?.items || [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
  });

  const events: UpcomingEvent[] = useMemo(() => {
    if (apiEvents && apiEvents.length > 0) {
      return apiEvents.map((item) => {
        const tpl = item.tourTemplateId;
        const bus = item.busId;
        return {
          id: item._id,
          title: tpl?.title || item.eventCode,
          destination: tpl?.destination || 'Bangladesh',
          date: item.startDate,
          priceBDT: tpl?.pricing?.basePrice || 4800,
          totalSeats: item.capacity || 45,
          availableSeats: Math.max(1, (item.capacity || 45) - 8),
          durationDays: tpl?.durationDays || 3,
          busType: bus ? `${bus.name} (${bus.isAC ? 'AC' : 'Non-AC'})` : 'Scania AC Coach',
          image: tpl?.featuredImage || UPCOMING_EVENTS[0].image,
          slug: tpl?.slug,
          packages: tpl?.packageTiers || ['Single', 'Couple', 'Premium'],
          isDemo: false,
        };
      });
    }
    return UPCOMING_EVENTS;
  }, [apiEvents]);

  return (
    <Section
      id="upcoming-events"
      aria-labelledby="upcoming-events-heading"
      className="bg-muted/40 scroll-mt-20"
    >
      <SectionTitle
        id="upcoming-events-heading"
        eyebrow="Fixed Date Departures"
        title="Upcoming Events"
        description="Curated group tours with confirmed dates and dedicated AC transport. Book early before seats sell out."
      />

      {isLoading ? (
        <div className="laptop:grid-cols-2 mt-10 grid grid-cols-1 gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="border-border bg-card grid grid-cols-1 gap-4 overflow-hidden rounded-xl border p-4 sm:grid-cols-[240px_1fr]"
            >
              <Skeleton className="h-44 w-full rounded-lg" />
              <div className="flex flex-col gap-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <div className="mt-auto flex justify-between pt-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="laptop:grid-cols-2 mt-10 grid grid-cols-1 gap-6"
        >
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </motion.div>
      )}
    </Section>
  );
}

export { UpcomingEvents };

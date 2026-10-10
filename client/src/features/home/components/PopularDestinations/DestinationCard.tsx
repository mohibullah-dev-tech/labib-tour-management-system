import { memo } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Clock, ArrowUpRight } from 'lucide-react';
import type { Destination } from '@/features/home/data/destinations';
import { LazyImage } from '@/components/common/LazyImage';
import { Rating } from '@/components/common/Rating';
import { Badge } from '@/components/ui/badge';
import { fadeInUp } from '@/lib/animations/variants';

export interface DestinationCardProps {
  destination: Destination;
}

/**
 * Minimalist card, not a busy template card: one image, one price line,
 * one CTA. `motion.div` here only handles the scroll-reveal (variants
 * inherited from the parent's staggerContainer); hover/tap feedback is
 * plain CSS (`group-hover:`) — reserving Framer Motion for entrance only
 * keeps every card interaction instant, no JS-driven hover lag.
 */
const DestinationCard = memo(function DestinationCard({ destination }: DestinationCardProps) {
  return (
    <motion.article
      variants={fadeInUp}
      className="group border-border bg-card flex flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative">
        <LazyImage
          src={destination.image}
          alt={destination.name}
          aspectClassName="aspect-[4/3]"
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <Badge className="bg-background/90 text-foreground absolute top-3 left-3 border-0 backdrop-blur">
          {destination.region}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-foreground text-lg leading-tight font-semibold">
            {destination.name}
          </h3>
          <Rating value={destination.rating} />
        </div>

        <p className="text-muted-foreground line-clamp-2 flex-1 text-sm leading-relaxed">
          {destination.shortDescription}
        </p>

        <div className="text-muted-foreground flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {destination.durationDays} দিন
          </span>
        </div>

        <div className="border-border mt-1 flex items-center justify-between border-t pt-3">
          <div>
            <p className="text-muted-foreground text-xs">শুরু মাত্র</p>
            <p className="font-display text-primary text-lg font-semibold">
              ৳{destination.startingPriceBDT.toLocaleString('en-BD')}
            </p>
          </div>
          <Link
            to={`/tours/${destination.slug}`}
            className="border-border text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors"
          >
            বিস্তারিত দেখুন
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
});

export { DestinationCard };

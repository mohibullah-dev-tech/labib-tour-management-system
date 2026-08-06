import { Clock, Users, Bus, CalendarDays, MapPin } from 'lucide-react';
import type { Tour } from '@/features/tours/types';
import { formatDate } from '@/lib/format';

export interface QuickOverviewProps {
  tour: Tour;
}

const ITEM_CLASS =
  'flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center';

/** Icon + label stat row — the "at a glance" facts every tour type has, regardless of category. */
function QuickOverview({ tour }: QuickOverviewProps) {
  return (
    <dl className="laptop:grid-cols-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div className={ITEM_CLASS}>
        <Clock className="text-primary size-5" aria-hidden="true" />
        <dt className="text-muted-foreground text-xs">Duration</dt>
        <dd className="text-foreground text-sm font-medium">
          {tour.durationDays}D{tour.durationNights > 0 ? `/${tour.durationNights}N` : ''}
        </dd>
      </div>
      <div className={ITEM_CLASS}>
        <CalendarDays className="text-primary size-5" aria-hidden="true" />
        <dt className="text-muted-foreground text-xs">Next Departure</dt>
        <dd className="text-foreground text-sm font-medium">
          {formatDate(tour.nextDepartureDate)}
        </dd>
      </div>
      <div className={ITEM_CLASS}>
        <Users className="text-primary size-5" aria-hidden="true" />
        <dt className="text-muted-foreground text-xs">Seats Available</dt>
        <dd className="text-foreground text-sm font-medium">
          {tour.availableSeats} / {tour.totalSeats}
        </dd>
      </div>
      <div className={ITEM_CLASS}>
        <Bus className="text-primary size-5" aria-hidden="true" />
        <dt className="text-muted-foreground text-xs">Bus Type</dt>
        <dd className="text-foreground text-sm font-medium">{tour.busType}</dd>
      </div>
      <div className={ITEM_CLASS}>
        <MapPin className="text-primary size-5" aria-hidden="true" />
        <dt className="text-muted-foreground text-xs">Region</dt>
        <dd className="text-foreground text-sm font-medium">{tour.region}</dd>
      </div>
    </dl>
  );
}

export { QuickOverview };

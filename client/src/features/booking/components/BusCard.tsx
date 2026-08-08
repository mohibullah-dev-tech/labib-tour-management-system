import { Bus as BusIcon, Zap, Users } from 'lucide-react';
import type { Bus } from '@/features/booking/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface BusCardProps {
  bus: Bus;
}

/**
 * Displays the event's single dedicated bus — not a picker. Per the
 * business rule "one event = one bus," there's nothing to choose
 * between; this card exists so the guest sees exactly what they're
 * riding before moving to seat selection, not to offer alternatives.
 */
function BusCard({ bus }: BusCardProps) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="items-center text-center">
        <div className="bg-primary-50 text-primary dark:bg-primary-950 flex size-14 items-center justify-center rounded-full">
          <BusIcon className="size-7" aria-hidden="true" />
        </div>
        <CardTitle>{bus.name}</CardTitle>
        <p className="text-muted-foreground text-sm">{bus.busNumber}</p>
      </CardHeader>
      <CardContent>
        <dl className="border-border grid grid-cols-2 gap-4 border-t pt-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <Zap className="text-primary size-4" aria-hidden="true" />
            <dt className="text-muted-foreground text-xs">Type</dt>
            <dd>
              <Badge variant={bus.acType === 'AC' ? 'default' : 'secondary'}>{bus.acType}</Badge>
            </dd>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users className="text-primary size-4" aria-hidden="true" />
            <dt className="text-muted-foreground text-xs">Seats Available</dt>
            <dd className="text-foreground text-sm font-medium">
              {bus.availableSeats} / {bus.totalSeats}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

export { BusCard };

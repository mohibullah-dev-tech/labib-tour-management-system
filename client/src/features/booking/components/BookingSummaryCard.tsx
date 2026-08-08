import type {
  BookingEvent,
  BookingPackageOption,
  PricingBreakdown,
} from '@/features/booking/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatBDT, formatDate } from '@/lib/format';

export interface BookingSummaryCardProps {
  event: BookingEvent;
  packageOption: BookingPackageOption;
  seatIds: string[];
  pricing: PricingBreakdown;
  /** Compact mode drops the card chrome — used in a persistent sidebar where a Card wrapper already exists around it. */
  compact?: boolean;
}

/**
 * Every field the brief's Step 6 lists: Tour, Event, Seat Numbers,
 * Package, Guest Count, Package Price, Subtotal, Discount, Minimum
 * Advance, Received Amount, Due Amount. Pure presentation over a
 * `PricingBreakdown` — reused as-is by both BookingSummaryStep (full
 * page) and could back a "view booking" screen later with the same
 * props shape.
 */
function BookingSummaryCard({
  event,
  packageOption,
  seatIds,
  pricing,
  compact = false,
}: BookingSummaryCardProps) {
  const body = (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-col gap-2 text-sm">
        <Row label="Tour" value={event.tourName} />
        <Row label="Event Date" value={formatDate(event.departureDate)} />
        <Row label="Seat Numbers" value={seatIds.length > 0 ? seatIds.join(', ') : '\u2014'} />
        <Row label="Package" value={packageOption.name} />
        <Row label="Guest Count" value={String(pricing.guestCount)} />
      </dl>

      <Separator />

      <dl className="flex flex-col gap-2 text-sm">
        <Row label="Package Price (per person)" value={formatBDT(pricing.pricePerPerson)} />
        <Row label="Subtotal" value={formatBDT(pricing.subtotal)} />
        <Row
          label="Discount"
          value={pricing.discount > 0 ? `\u2212${formatBDT(pricing.discount)}` : formatBDT(0)}
        />
        <Row label="Total" value={formatBDT(pricing.total)} emphasize />
      </dl>

      <Separator />

      <dl className="flex flex-col gap-2 text-sm">
        <Row label="Minimum Advance" value={formatBDT(pricing.minimumAdvance)} />
        <Row label="Received Amount" value={formatBDT(pricing.receivedAmount)} />
        <Row label="Due Amount" value={formatBDT(pricing.dueAmount)} emphasize />
      </dl>
    </div>
  );

  if (compact) return body;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={
          emphasize ? 'font-display text-primary font-semibold' : 'text-foreground font-medium'
        }
      >
        {value}
      </dd>
    </div>
  );
}

export { BookingSummaryCard };

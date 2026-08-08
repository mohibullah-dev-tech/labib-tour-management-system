import { useMemo } from 'react';
import { BookingSummaryCard } from '@/features/booking/components/BookingSummaryCard';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { computePricing } from '@/features/booking/utils/pricing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Step 6 — the brief's full field list rendered via BookingSummaryCard,
 * plus a guest-info recap. "Confirm Booking" generates a placeholder
 * booking ID client-side (`LTMS-` + timestamp) purely so Step 7 has
 * something to display — a real backend will return the actual ID from
 * `POST /api/v1/bookings`, and that response replaces this line, not
 * the rest of the flow.
 */
function BookingSummaryStep() {
  const { draft, submitBooking, goBack } = useBooking();

  const pricing = useMemo(() => {
    if (!draft.event || !draft.packageOption) return null;
    return computePricing({
      category: draft.event.tourCategory,
      pricePerPerson: draft.packageOption.pricePerPersonBDT,
      guestCount: draft.selectedSeatIds.length,
    });
  }, [draft.event, draft.packageOption, draft.selectedSeatIds]);

  if (!draft.event || !draft.packageOption || !pricing) return null;

  const handleConfirm = () => {
    const bookingId = `LTMS-${Date.now().toString().slice(-8)}`;
    submitBooking(bookingId);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h2 className="font-display text-foreground text-xl font-semibold">Review Your Booking</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Please check every detail before confirming.
        </p>
      </div>

      <BookingSummaryCard
        event={draft.event}
        packageOption={draft.packageOption}
        seatIds={draft.selectedSeatIds}
        pricing={pricing}
      />

      <Card>
        <CardHeader>
          <CardTitle>Guest Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <Row label="Full Name" value={draft.guestForm.fullName} />
            <Row label="Phone" value={draft.guestForm.phone} />
            <Row label="Email" value={draft.guestForm.email} />
            <Row label="Pickup Location" value={draft.guestForm.pickupLocation} />
            <Row label="Address" value={draft.guestForm.address} />
            <Row
              label="Emergency Contact"
              value={`${draft.guestForm.emergencyContactName} (${draft.guestForm.emergencyContactPhone})`}
            />
          </dl>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={goBack}>
          Back
        </Button>
        <Button size="lg" onClick={handleConfirm}>
          Confirm Booking
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-foreground font-medium">{value}</dd>
    </div>
  );
}

export { BookingSummaryStep };

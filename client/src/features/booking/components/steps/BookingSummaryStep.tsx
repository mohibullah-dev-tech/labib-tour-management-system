import { useMemo, useState, useCallback } from 'react';
import { BookingSummaryCard } from '@/features/booking/components/BookingSummaryCard';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { computePricing } from '@/features/booking/utils/pricing';
import { SeatLockCountdown } from '@/features/booking/components/SeatLockCountdown';
import { seatService } from '@/features/booking/services/seat.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/lib/axios';

/**
 * Step 6 — Review booking with real-time seat lock countdown,
 * idempotency protection, double-click prevention, and concurrency check.
 */
function BookingSummaryStep() {
  const { draft, submitBooking, markHoldExpired, goToStep, goBack } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pricing = useMemo(() => {
    if (!draft.event || !draft.packageOption) return null;
    return computePricing({
      category: draft.event.tourCategory,
      pricePerPerson: draft.packageOption.pricePerPersonBDT,
      guestCount: draft.selectedSeatIds.length,
    });
  }, [draft.event, draft.packageOption, draft.selectedSeatIds]);

  const handleHoldExpired = useCallback(() => {
    markHoldExpired();
    toast.error('Your seat hold has expired. Please select your seats again.');
  }, [markHoldExpired]);

  if (!draft.event || !draft.packageOption || !pricing) return null;
  const currentEvent = draft.event;
  const currentPackage = draft.packageOption;

  const isLockExpired =
    draft.isHoldExpired ||
    (draft.lockExpiresAt ? new Date(draft.lockExpiresAt).getTime() <= Date.now() : false);

  const handleConfirm = async () => {
    if (isLockExpired || !draft.selectedSeatIds.length) {
      toast.error('Your seat hold has expired. Please select your seats again.');
      goToStep('seat');
      return;
    }

    setIsSubmitting(true);
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    try {
      // Build booking payload matching server CreateBookingInput
      const bookingPayload = {
        eventId: currentEvent.id,
        bookingType: currentPackage.tier,
        quantity: draft.selectedSeatIds.length,
        seatNumbers: draft.selectedSeatIds,
        guestDetails: [
          {
            name: draft.guestForm.fullName,
            phone: draft.guestForm.phone,
            email: draft.guestForm.email || undefined,
            address: draft.guestForm.address || undefined,
            emergencyContact: draft.guestForm.emergencyContactPhone || undefined,
            emergencyContactName: draft.guestForm.emergencyContactName || undefined,
          },
        ],
        pickupPoint: draft.guestForm.pickupLocation || undefined,
        specialNotes: draft.guestForm.specialNotes || undefined,
      };

      const result = await seatService.confirmBooking<{ _id?: string; bookingCode?: string }>(
        bookingPayload,
        idempotencyKey,
      );

      const confirmedId =
        result.bookingCode || result._id || `LTMS-${Date.now().toString().slice(-8)}`;
      submitBooking(confirmedId);
      toast.success('Booking confirmed successfully!');
    } catch (err) {
      // If error indicates expired lock or conflict, guide user back to seat step
      const msg = extractApiErrorMessage(err, 'Booking confirmation failed');
      toast.error(msg);
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('held')) {
        markHoldExpired();
        goToStep('seat');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-foreground text-xl font-semibold">
            Review Your Booking
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Please check every detail before confirming.
          </p>
        </div>

        {draft.lockExpiresAt && !isLockExpired && (
          <SeatLockCountdown expiresAt={draft.lockExpiresAt} onExpired={handleHoldExpired} />
        )}
      </div>

      {isLockExpired && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 shrink-0 text-red-600 dark:text-red-400" />
            <span>Your temporary seat hold has expired.</span>
          </div>
          <Button size="sm" variant="destructive" onClick={() => goToStep('seat')}>
            Re-select Seats
          </Button>
        </div>
      )}

      <BookingSummaryCard
        event={currentEvent}
        packageOption={currentPackage}
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
            <Row label="Email" value={draft.guestForm.email || 'N/A'} />
            <Row
              label="Pickup Location"
              value={draft.guestForm.pickupLocation || 'Main Terminal'}
            />
            <Row label="Address" value={draft.guestForm.address || 'N/A'} />
            <Row
              label="Emergency Contact"
              value={
                draft.guestForm.emergencyContactName
                  ? `${draft.guestForm.emergencyContactName} (${draft.guestForm.emergencyContactPhone || 'N/A'})`
                  : 'N/A'
              }
            />
          </dl>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={goBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button
          size="lg"
          onClick={handleConfirm}
          disabled={isSubmitting || isLockExpired || !draft.selectedSeatIds.length}
          className="min-w-44"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Securing Booking...
            </>
          ) : (
            'Confirm Booking'
          )}
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

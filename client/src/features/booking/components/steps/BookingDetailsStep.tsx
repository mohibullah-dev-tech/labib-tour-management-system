import { useCallback } from 'react';
import { GuestForm } from '@/features/booking/components/GuestForm';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { SeatLockCountdown } from '@/features/booking/components/SeatLockCountdown';
import type { GuestFormData } from '@/features/booking/types';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

/** Step 5 — guest information with active seat lock timer. */
function BookingDetailsStep() {
  const { draft, setGuestForm, markHoldExpired, goToStep, goBack } = useBooking();

  const handleHoldExpired = useCallback(() => {
    markHoldExpired();
    toast.error('Your seat hold has expired. Please select the seats again.');
  }, [markHoldExpired]);

  if (!draft.packageOption) return null;

  const isLockExpired =
    draft.isHoldExpired ||
    (draft.lockExpiresAt ? new Date(draft.lockExpiresAt).getTime() <= Date.now() : false);

  const handleSubmit = (data: GuestFormData) => {
    if (isLockExpired) {
      toast.error('Your seat hold has expired. Please select the seats again.');
      goToStep('seat');
      return;
    }
    setGuestForm(data);
    goToStep('summary');
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-foreground text-xl font-semibold">Guest Information</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            We'll use these details to confirm your booking.
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

      <GuestForm
        defaultValues={draft.guestForm}
        packageName={draft.packageOption.name}
        onSubmit={handleSubmit}
        onBack={goBack}
      />
    </div>
  );
}

export { BookingDetailsStep };

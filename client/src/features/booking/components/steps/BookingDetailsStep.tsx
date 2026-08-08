import { GuestForm } from '@/features/booking/components/GuestForm';
import { useBooking } from '@/features/booking/hooks/useBooking';
import type { GuestFormData } from '@/features/booking/types';

/** Step 5 — guest information. "Booking Type" is shown read-only (already chosen in Step 2), not re-asked. */
function BookingDetailsStep() {
  const { draft, setGuestForm, goToStep, goBack } = useBooking();

  if (!draft.packageOption) return null;

  const handleSubmit = (data: GuestFormData) => {
    setGuestForm(data);
    goToStep('summary');
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h2 className="font-display text-foreground text-xl font-semibold">Guest Information</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          We'll use these details to confirm your booking.
        </p>
      </div>

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

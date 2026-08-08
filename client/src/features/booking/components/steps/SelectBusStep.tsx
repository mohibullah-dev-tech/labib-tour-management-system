import { BusCard } from '@/features/booking/components/BusCard';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { Button } from '@/components/ui/button';

/** Step 3 — displays the event's one dedicated bus (business rule: one event = one bus, so there's nothing to pick between). */
function SelectBusStep() {
  const { bus, confirmBus, goBack } = useBooking();

  if (!bus) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-display text-foreground text-xl font-semibold">Your Bus</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          This event travels on one dedicated bus.
        </p>
      </div>

      <BusCard bus={bus} />

      <div className="mx-auto flex w-full max-w-md flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={goBack}>
          Back
        </Button>
        <Button onClick={confirmBus}>Continue to Seat Selection</Button>
      </div>
    </div>
  );
}

export { SelectBusStep };

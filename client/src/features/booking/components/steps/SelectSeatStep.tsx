import { SeatMap } from '@/features/booking/components/SeatMap/SeatMap';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { Button } from '@/components/ui/button';

/** Step 4 — interactive seat map. Guest count for the whole booking is derived from how many seats are selected here, not asked separately. */
function SelectSeatStep() {
  const { draft, bus, toggleSeat, goToStep, goBack } = useBooking();

  if (!bus) return null;

  const hasSelection = draft.selectedSeatIds.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-foreground text-xl font-semibold">Select Your Seats</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Tap available seats to select. Each seat = one guest.
          </p>
        </div>
        <p className="bg-primary-50 text-primary dark:bg-primary-950 rounded-full px-4 py-1.5 text-sm font-medium">
          {draft.selectedSeatIds.length} {draft.selectedSeatIds.length === 1 ? 'seat' : 'seats'}{' '}
          selected
        </p>
      </div>

      <SeatMap bus={bus} selectedSeatIds={draft.selectedSeatIds} onToggleSeat={toggleSeat} />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={goBack}>
          Back
        </Button>
        <Button disabled={!hasSelection} onClick={() => goToStep('details')}>
          Continue with {draft.selectedSeatIds.length || 0}{' '}
          {draft.selectedSeatIds.length === 1 ? 'Seat' : 'Seats'}
        </Button>
      </div>
    </div>
  );
}

export { SelectSeatStep };

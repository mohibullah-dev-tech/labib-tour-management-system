import { useCallback, useMemo, useEffect } from 'react';
import { SeatMap } from '@/features/booking/components/SeatMap/SeatMap';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { useEventSeats } from '@/features/booking/hooks/useEventSeats';
import { SeatLockCountdown } from '@/features/booking/components/SeatLockCountdown';
import { generateSeatRows, type SeatOverride } from '@/features/booking/utils/seat-layout';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Step 4 — interactive real-time seat map with Redis atomic locking and countdown timer.
 */
function SelectSeatStep() {
  const {
    draft,
    bus: fallbackBus,
    setSeatLocks,
    clearSeatLocks,
    markHoldExpired,
    goToStep,
    goBack,
  } = useBooking();

  const eventId = draft.event?.id;
  const {
    seats: liveSeats,
    isLoading: isSeatsLoading,
    lockSeats,
    isLocking,
    releaseSeats,
    isReleasing,
    refetchSeats,
    heartbeat,
  } = useEventSeats(eventId);

  // Build reactive Bus model merging real-time MongoDB + Redis statuses
  const dynamicBus = useMemo(() => {
    if (!fallbackBus) return undefined;

    const overrides: Record<string, SeatOverride> = {};

    // 1. Apply live server statuses (Redis locks + MongoDB bookings)
    for (const s of liveSeats) {
      overrides[s.seatNumber] = {
        status: s.status,
        lockedByCurrentUser: s.lockedByCurrentUser,
        lockExpiresAt: s.lockExpiresAt,
      };
    }

    // 2. Mark locally selected/held seats as locked by current user
    for (const id of draft.selectedSeatIds) {
      if (!overrides[id] || overrides[id] === 'available') {
        overrides[id] = {
          status: 'locked',
          lockedByCurrentUser: true,
          lockExpiresAt: draft.lockExpiresAt,
        };
      }
    }

    const rows = generateSeatRows(overrides);

    return {
      ...fallbackBus,
      rows,
      availableSeats: rows.reduce(
        (sum, row) => sum + row.seats.filter((s) => s.status === 'available').length,
        0,
      ),
    };
  }, [fallbackBus, liveSeats, draft.selectedSeatIds, draft.lockExpiresAt]);

  // Periodic heartbeat while on the page with active locks
  useEffect(() => {
    if (!draft.selectedSeatIds.length || !eventId) return;

    const interval = setInterval(() => {
      void heartbeat(draft.selectedSeatIds);
    }, 120_000); // 2 minutes

    return () => clearInterval(interval);
  }, [draft.selectedSeatIds, eventId, heartbeat]);

  // Handle expiration callback from SeatLockCountdown
  const handleHoldExpired = useCallback(() => {
    markHoldExpired();
    void refetchSeats();
    toast.error('Your seat hold has expired. Please select the seats again.');
  }, [markHoldExpired, refetchSeats]);

  // Toggle seat selection with atomic backend lock/release
  const handleToggleSeat = useCallback(
    async (seatId: string) => {
      const isAlreadySelected = draft.selectedSeatIds.includes(seatId);

      if (isAlreadySelected) {
        // Immediate release of the unselected seat
        const updatedSeats = draft.selectedSeatIds.filter((id) => id !== seatId);
        try {
          await releaseSeats([seatId]);
          if (updatedSeats.length === 0) {
            clearSeatLocks();
          } else {
            // Keep remaining held seats
            setSeatLocks(
              updatedSeats,
              draft.lockExpiresAt || new Date(Date.now() + 600_000).toISOString(),
              draft.seatLockSessionId || '',
            );
          }
        } catch {
          toast.error('Failed to release seat. Please try again.');
        }
      } else {
        // Attempt atomic lock on new seat selection
        const candidateSeats = [...draft.selectedSeatIds, seatId];
        try {
          const result = await lockSeats(candidateSeats);
          setSeatLocks(result.seatNumbers, result.expiresAt, result.sessionId);
        } catch {
          // Re-fetch seats in case someone else just locked it
          void refetchSeats();
        }
      }
    },
    [
      draft.selectedSeatIds,
      draft.lockExpiresAt,
      draft.seatLockSessionId,
      releaseSeats,
      lockSeats,
      setSeatLocks,
      clearSeatLocks,
      refetchSeats,
    ],
  );

  if (!dynamicBus) return null;

  const hasSelection = draft.selectedSeatIds.length > 0 && !draft.isHoldExpired;
  const isBusy = isLocking || isReleasing;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-foreground text-xl font-semibold">Select Your Seats</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Tap available seats to hold. Seats are temporarily locked in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {draft.lockExpiresAt && draft.selectedSeatIds.length > 0 && (
            <SeatLockCountdown expiresAt={draft.lockExpiresAt} onExpired={handleHoldExpired} />
          )}

          <p className="bg-primary/10 text-primary dark:bg-primary/20 rounded-full px-4 py-1.5 text-sm font-medium">
            {draft.selectedSeatIds.length} {draft.selectedSeatIds.length === 1 ? 'seat' : 'seats'}{' '}
            selected
          </p>
        </div>
      </div>

      {draft.isHoldExpired && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="size-5 shrink-0 text-red-600 dark:text-red-400" />
          <p>
            Your seat reservation session expired. Please tap the seats you wish to book again to
            acquire a new lock.
          </p>
        </div>
      )}

      {isSeatsLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="text-primary size-8 animate-spin" />
        </div>
      ) : (
        <SeatMap
          bus={dynamicBus}
          selectedSeatIds={draft.selectedSeatIds}
          onToggleSeat={handleToggleSeat}
        />
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={goBack} disabled={isBusy}>
          Back
        </Button>

        <Button
          disabled={!hasSelection || isBusy}
          onClick={() => goToStep('details')}
          className="min-w-40"
        >
          {isBusy ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Holding Seats...
            </>
          ) : (
            `Continue with ${draft.selectedSeatIds.length || 0} ${
              draft.selectedSeatIds.length === 1 ? 'Seat' : 'Seats'
            }`
          )}
        </Button>
      </div>
    </div>
  );
}

export { SelectSeatStep };

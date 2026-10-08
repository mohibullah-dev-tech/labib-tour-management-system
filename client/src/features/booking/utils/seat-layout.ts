import type { Seat, SeatRow, SeatStatus } from '@/features/booking/types';

const ROW_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export type SeatOverride =
  | SeatStatus
  | {
      status: SeatStatus;
      lockedByCurrentUser?: boolean;
      lockExpiresAt?: string | null;
    };

/**
 * Builds the standard 45-seat layout: rows A–J with 4 seats each (2 left
 * of the aisle, 2 right), plus a 5-seat back row K — matching the layout
 * the brief specifies. Overrides merge backend Redis/Mongo statuses.
 */
export function generateSeatRows(overrides: Record<string, SeatOverride> = {}): SeatRow[] {
  const getSeatData = (id: string): Seat => {
    const override = overrides[id];
    if (!override) {
      return { id, status: 'available' };
    }
    if (typeof override === 'string') {
      return { id, status: override };
    }
    return {
      id,
      status: override.status,
      lockedByCurrentUser: override.lockedByCurrentUser,
      lockExpiresAt: override.lockExpiresAt,
    };
  };

  const rows: SeatRow[] = ROW_LETTERS.map((row) => ({
    row,
    seats: [1, 2, 3, 4].map((position) => getSeatData(`${row}${position}`)),
  }));

  rows.push({
    row: 'K',
    seats: [1, 2, 3, 4, 5].map((position) => getSeatData(`K${position}`)),
  });

  return rows;
}

export function countAvailableSeats(rows: SeatRow[]): number {
  return rows.reduce(
    (sum, row) => sum + row.seats.filter((s) => s.status === 'available').length,
    0,
  );
}

export function countTotalSeats(rows: SeatRow[]): number {
  return rows.reduce((sum, row) => sum + row.seats.length, 0);
}

import type { Seat, SeatRow, SeatStatus } from '@/features/booking/types';

const ROW_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

/**
 * Builds the standard 45-seat layout: rows A–J with 4 seats each (2 left
 * of the aisle, 2 right), plus a 5-seat back row K — matching the layout
 * the brief specifies. `overrides` lets each bus in data/buses.ts assign
 * a realistic mix of booked/locked/reserved seats without every mock bus
 * hand-writing all 45 seat objects.
 */
export function generateSeatRows(overrides: Record<string, SeatStatus> = {}): SeatRow[] {
  const rows: SeatRow[] = ROW_LETTERS.map((row) => ({
    row,
    seats: [1, 2, 3, 4].map((position) => {
      const id = `${row}${position}`;
      return { id, status: overrides[id] ?? 'available' } satisfies Seat;
    }),
  }));

  rows.push({
    row: 'K',
    seats: [1, 2, 3, 4, 5].map((position) => {
      const id = `K${position}`;
      return { id, status: overrides[id] ?? 'available' } satisfies Seat;
    }),
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

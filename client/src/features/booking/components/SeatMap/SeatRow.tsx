import { memo } from 'react';
import type { SeatRow as SeatRowType } from '@/features/booking/types';
import { Seat } from '@/features/booking/components/SeatMap/Seat';

export interface SeatRowProps {
  row: SeatRowType;
  selectedSeatIds: string[];
  onToggleSeat: (seatId: string) => void;
}

/**
 * Rows A–J: 2 seats | aisle gap | 2 seats, matching the brief's layout
 * exactly. Row K (the back row) has no aisle — 5 seats span the full
 * width, matching a real coach's bench-style back row.
 */
const SeatRow = memo(function SeatRow({ row, selectedSeatIds, onToggleSeat }: SeatRowProps) {
  const isBackRow = row.row === 'K';

  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground w-4 shrink-0 text-center text-xs font-medium">
        {row.row}
      </span>

      {isBackRow ? (
        <div className="flex flex-1 justify-center gap-2">
          {row.seats.map((seat) => (
            <Seat
              key={seat.id}
              seat={seat}
              isSelected={selectedSeatIds.includes(seat.id)}
              onToggle={onToggleSeat}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center gap-2">
          <div className="flex gap-2">
            {row.seats.slice(0, 2).map((seat) => (
              <Seat
                key={seat.id}
                seat={seat}
                isSelected={selectedSeatIds.includes(seat.id)}
                onToggle={onToggleSeat}
              />
            ))}
          </div>
          {/* Aisle */}
          <div className="w-8 shrink-0" aria-hidden="true" />
          <div className="flex gap-2">
            {row.seats.slice(2, 4).map((seat) => (
              <Seat
                key={seat.id}
                seat={seat}
                isSelected={selectedSeatIds.includes(seat.id)}
                onToggle={onToggleSeat}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export { SeatRow };

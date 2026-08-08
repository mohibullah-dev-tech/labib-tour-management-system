import { useState } from 'react';
import { User, DoorOpen, ZoomIn, ZoomOut } from 'lucide-react';
import type { Bus } from '@/features/booking/types';
import { SeatRow } from '@/features/booking/components/SeatMap/SeatRow';
import { SeatLegend } from '@/features/booking/components/SeatMap/SeatLegend';
import { Button } from '@/components/ui/button';

export interface SeatMapProps {
  bus: Bus;
  selectedSeatIds: string[];
  onToggleSeat: (seatId: string) => void;
}

const ZOOM_LEVELS = [1, 1.25, 1.5];

/**
 * Full seat map: front area (driver/helper/door — decorative, orients
 * the guest to the bus layout), the A–J + K seat grid, and a mobile-only
 * zoom control. Zoom is a simple CSS `transform: scale()` on the rows
 * container inside a horizontally-scrollable wrapper — enough to make
 * small touch targets comfortable on a phone without a gesture/pinch
 * library dependency the brief didn't ask for.
 */
function SeatMap({ bus, selectedSeatIds, onToggleSeat }: SeatMapProps) {
  const [zoomIndex, setZoomIndex] = useState(0);
  const zoom = ZOOM_LEVELS[zoomIndex];

  return (
    <div className="flex flex-col gap-4">
      <div className="laptop:hidden flex items-center justify-between">
        <p className="text-muted-foreground text-xs">Pinch or use zoom to see seats clearly</p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            aria-label="Zoom out"
            disabled={zoomIndex === 0}
            onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
          >
            <ZoomOut className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Zoom in"
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            onClick={() => setZoomIndex((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))}
          >
            <ZoomIn className="size-4" />
          </Button>
        </div>
      </div>

      <div className="border-border bg-card overflow-x-auto rounded-lg border p-4">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          className="mx-auto flex w-fit flex-col gap-3 transition-transform"
        >
          {/* Front of bus */}
          <div className="bg-muted text-muted-foreground mb-2 flex items-center justify-between rounded-md px-4 py-2 text-xs">
            <span className="flex items-center gap-1.5">
              <User className="size-4" aria-hidden="true" />
              Driver
            </span>
            <span className="flex items-center gap-1.5">
              Helper
              <DoorOpen className="size-4" aria-hidden="true" />
              Door
            </span>
          </div>

          {bus.rows.map((row) => (
            <SeatRow
              key={row.row}
              row={row}
              selectedSeatIds={selectedSeatIds}
              onToggleSeat={onToggleSeat}
            />
          ))}
        </div>
      </div>

      <SeatLegend />
    </div>
  );
}

export { SeatMap };

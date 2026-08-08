import { Lock } from 'lucide-react';

const LEGEND_ITEMS: { label: string; swatchClass: string; icon?: boolean }[] = [
  { label: 'Available', swatchClass: 'border-border bg-background' },
  { label: 'Selected', swatchClass: 'border-primary bg-primary' },
  {
    label: 'Booked',
    swatchClass: 'border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-700',
  },
  {
    label: 'Locked',
    swatchClass: 'border-dashed border-neutral-400 bg-neutral-200 dark:bg-neutral-800',
    icon: true,
  },
  {
    label: 'Reserved',
    swatchClass: 'border-accent-400 bg-accent-100 dark:border-accent-700 dark:bg-accent-950',
  },
  {
    label: 'Female Reserved',
    swatchClass: 'border-rose-300 bg-rose-100 dark:border-rose-800 dark:bg-rose-950',
  },
];

/** Explains every SeatStatus's color — kept in sync with Seat.tsx's STATUS_CLASS map by definition (same six statuses). */
function SeatLegend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {LEGEND_ITEMS.map((item) => (
        <li key={item.label} className="text-muted-foreground flex items-center gap-2 text-xs">
          <span
            className={`flex size-5 items-center justify-center rounded border-2 ${item.swatchClass}`}
          >
            {item.icon && <Lock className="size-2.5 text-neutral-500" aria-hidden="true" />}
          </span>
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export { SeatLegend };

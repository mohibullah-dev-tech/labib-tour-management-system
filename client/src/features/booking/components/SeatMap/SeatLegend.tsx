import { Lock, Ban } from 'lucide-react';

const LEGEND_ITEMS: {
  label: string;
  swatchClass: string;
  icon?: 'lock' | 'ban';
}[] = [
  { label: 'Available', swatchClass: 'border-border bg-background' },
  { label: 'Selected / Held', swatchClass: 'border-primary bg-primary text-primary-foreground' },
  {
    label: 'Temporarily Held (Others)',
    swatchClass:
      'border-dashed border-amber-400 bg-amber-100 dark:border-amber-700 dark:bg-amber-950/60',
    icon: 'lock',
  },
  {
    label: 'Booked',
    swatchClass: 'border-neutral-300 bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-700',
  },
  {
    label: 'Reserved',
    swatchClass: 'border-accent-400 bg-accent-100 dark:border-accent-700 dark:bg-accent-950',
  },
  {
    label: 'Blocked',
    swatchClass: 'border-neutral-400 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-900',
    icon: 'ban',
  },
];

/** Explains every SeatStatus color and icon */
function SeatLegend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {LEGEND_ITEMS.map((item) => (
        <li key={item.label} className="text-muted-foreground flex items-center gap-2 text-xs">
          <span
            className={`flex size-5 items-center justify-center rounded border-2 text-[10px] font-bold ${item.swatchClass}`}
          >
            {item.icon === 'lock' && (
              <Lock className="size-2.5 text-amber-700 dark:text-amber-400" aria-hidden="true" />
            )}
            {item.icon === 'ban' && (
              <Ban className="size-2.5 text-neutral-400" aria-hidden="true" />
            )}
          </span>
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export { SeatLegend };

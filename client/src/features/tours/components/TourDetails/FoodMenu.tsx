import { UtensilsCrossed } from 'lucide-react';
import type { FoodMenuEntry } from '@/features/tours/types';

export interface FoodMenuProps {
  menu?: FoodMenuEntry[];
}

function FoodMenu({ menu }: FoodMenuProps) {
  if (!menu?.length) return null;

  return (
    <div className="laptop:grid-cols-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {menu.map((entry) => (
        <div key={entry.meal} className="border-border bg-card rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-2">
            <UtensilsCrossed className="text-primary size-4" aria-hidden="true" />
            <h4 className="text-foreground text-sm font-semibold">{entry.meal}</h4>
          </div>
          <ul className="text-muted-foreground flex flex-col gap-1 text-sm">
            {entry.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export { FoodMenu };

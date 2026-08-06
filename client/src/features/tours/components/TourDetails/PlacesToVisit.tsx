import type { PlaceToVisit } from '@/features/tours/types';
import { LazyImage } from '@/components/common/LazyImage';

export interface PlacesToVisitProps {
  places?: PlaceToVisit[];
}

function PlacesToVisit({ places }: PlacesToVisitProps) {
  if (!places?.length) return null;

  return (
    <div className="laptop:grid-cols-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
      {places.map((place) => (
        <div key={place.id} className="border-border bg-card overflow-hidden rounded-lg border">
          <LazyImage src={place.image} alt={place.name} aspectClassName="aspect-[4/3]" />
          <div className="p-4">
            <h4 className="font-display text-foreground text-sm font-semibold">{place.name}</h4>
            <p className="text-muted-foreground mt-1 text-sm">{place.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export { PlacesToVisit };

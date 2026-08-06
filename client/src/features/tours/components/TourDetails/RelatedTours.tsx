import { TOURS } from '@/features/tours/data/tours';
import { TourCard } from '@/features/tours/components/ToursListing/TourCard';

export interface RelatedToursProps {
  relatedTourIds?: string[];
}

/** Looks up related tours by id from the shared TOURS catalog — reuses TourCard rather than a bespoke mini-card. */
function RelatedTours({ relatedTourIds }: RelatedToursProps) {
  if (!relatedTourIds?.length) return null;

  const related = relatedTourIds
    .map((id) => TOURS.find((t) => t.id === id))
    .filter((t) => t !== undefined);

  if (related.length === 0) return null;

  return (
    <div className="laptop:grid-cols-3 grid grid-cols-1 gap-6 sm:grid-cols-2">
      {related.map((tour) => (
        <TourCard key={tour.id} tour={tour} />
      ))}
    </div>
  );
}

export { RelatedTours };

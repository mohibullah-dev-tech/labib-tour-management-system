import { SlidersHorizontal } from 'lucide-react';
import type { SortOption, TourFiltersState } from '@/features/tours/hooks/useTourFilters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ToursFilters } from '@/features/tours/components/ToursListing/ToursFilters';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export interface ToursToolbarProps {
  resultCount: number;
  filters: TourFiltersState;
  onChange: (patch: Partial<TourFiltersState>) => void;
  destinations: string[];
  busTypes: string[];
  priceBounds: [number, number];
  activeFilterCount: number;
  onReset: () => void;
}

/**
 * Result count + Sort control, always visible. The full ToursFilters
 * panel only appears here on mobile/tablet, inside a Sheet — on
 * laptop+ it renders permanently in ToursPage's sidebar instead (see
 * ToursPage.tsx), so this toolbar's "Filters" button is hidden there.
 */
function ToursToolbar({
  resultCount,
  filters,
  onChange,
  destinations,
  busTypes,
  priceBounds,
  activeFilterCount,
  onReset,
}: ToursToolbarProps) {
  return (
    <div className="border-border flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm">
        <span className="text-foreground font-medium">{resultCount}</span>{' '}
        {resultCount === 1 ? 'tour' : 'tours'} found
      </p>

      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="laptop:hidden gap-1.5 lg:hidden">
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground flex size-4 items-center justify-center rounded-full text-[10px]">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-sm overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <ToursFilters
                filters={filters}
                onChange={onChange}
                destinations={destinations}
                busTypes={busTypes}
                priceBounds={priceBounds}
                activeFilterCount={activeFilterCount}
                onReset={onReset}
              />
            </div>
          </SheetContent>
        </Sheet>

        <Select
          value={filters.sortBy}
          onValueChange={(value) => onChange({ sortBy: value as SortOption })}
        >
          <SelectTrigger aria-label="Sort by" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export { ToursToolbar };

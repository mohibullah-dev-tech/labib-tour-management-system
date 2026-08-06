import { useMemo } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import type { TourFiltersState, DurationBucket } from '@/features/tours/hooks/useTourFilters';
import { TOUR_CATEGORY_LABELS, type TourCategory } from '@/features/tours/types';
import { TOURS } from '@/features/tours/data/tours';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatBDT, formatMonth } from '@/lib/format';

const DURATION_OPTIONS: { value: DurationBucket; label: string }[] = [
  { value: 'all', label: 'Any duration' },
  { value: 'day', label: 'Day Trip' },
  { value: 'short', label: '2\u20133 Days' },
  { value: 'long', label: '4+ Days' },
];

export interface ToursFiltersProps {
  filters: TourFiltersState;
  onChange: (patch: Partial<TourFiltersState>) => void;
  destinations: string[];
  busTypes: string[];
  priceBounds: [number, number];
  activeFilterCount: number;
  onReset: () => void;
}

/**
 * Pure controlled-inputs filter panel — no state of its own. Rendered
 * identically inside the desktop sidebar and the mobile Drawer (see
 * ToursPage.tsx) so the two never visually or behaviorally drift apart;
 * only their container differs.
 */
function ToursFilters({
  filters,
  onChange,
  destinations,
  busTypes,
  priceBounds,
  activeFilterCount,
  onReset,
}: ToursFiltersProps) {
  // Departure months derived from the actual data — never a hardcoded list that could go stale.
  const departureMonths = useMemo(() => {
    const months = Array.from(new Set(TOURS.map((t) => t.nextDepartureDate.slice(0, 7)))).sort();
    return months.map((value) => ({ value, label: formatMonth(`${value}-01`) }));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-foreground text-base font-semibold">Filters</h2>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Reset ({activeFilterCount})
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-search">Search Tour</Label>
        <div className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            id="filter-search"
            placeholder="Search by name or destination"
            className="pl-9"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-destination">Destination</Label>
        <Select
          value={filters.destination}
          onValueChange={(value) => onChange({ destination: value })}
        >
          <SelectTrigger id="filter-destination">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All destinations</SelectItem>
            {destinations.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-category">Category</Label>
        <Select
          value={filters.category}
          onValueChange={(value) => onChange({ category: value as TourCategory | 'all' })}
        >
          <SelectTrigger id="filter-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {(Object.keys(TOUR_CATEGORY_LABELS) as TourCategory[]).map((c) => (
              <SelectItem key={c} value={c}>
                {TOUR_CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-duration">Duration</Label>
        <Select
          value={filters.duration}
          onValueChange={(value) => onChange({ duration: value as DurationBucket })}
        >
          <SelectTrigger id="filter-duration">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-departure-month">Departure Month</Label>
        <Select
          value={filters.departureMonth}
          onValueChange={(value) => onChange({ departureMonth: value })}
        >
          <SelectTrigger id="filter-departure-month">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any month</SelectItem>
            {departureMonths.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-bus-type">Bus Type</Label>
        <Select value={filters.busType} onValueChange={(value) => onChange({ busType: value })}>
          <SelectTrigger id="filter-bus-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any bus type</SelectItem>
            {busTypes.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label id="filter-price-label">Price Range</Label>
          <span className="text-muted-foreground text-xs">
            {formatBDT(filters.priceRange[0])} – {formatBDT(filters.priceRange[1])}
          </span>
        </div>
        <Slider
          aria-labelledby="filter-price-label"
          min={priceBounds[0]}
          max={priceBounds[1]}
          step={500}
          value={filters.priceRange}
          onValueChange={(value) => onChange({ priceRange: value as [number, number] })}
          minStepsBetweenThumbs={1}
        />
      </div>
    </div>
  );
}

export { ToursFilters };

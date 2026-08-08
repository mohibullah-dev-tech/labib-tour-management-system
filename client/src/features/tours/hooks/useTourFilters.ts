import { useMemo, useState } from 'react';
import { TOURS } from '@/features/tours/data/tours';
import type { Tour, TourCategory } from '@/features/tours/types';

export type DurationBucket = 'all' | 'day' | 'short' | 'long';
export type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'rating';

export interface TourFiltersState {
  search: string;
  destination: string; // 'all' | Tour['destination']
  duration: DurationBucket;
  priceRange: [number, number];
  category: TourCategory | 'all';
  departureMonth: string; // 'all' | 'YYYY-MM'
  busType: string; // 'all' | Tour['busType']
  sortBy: SortOption;
}

const DEFAULT_PRICE_RANGE: [number, number] = [0, 20000];

export const DEFAULT_FILTERS: TourFiltersState = {
  search: '',
  destination: 'all',
  duration: 'all',
  priceRange: DEFAULT_PRICE_RANGE,
  category: 'all',
  departureMonth: 'all',
  busType: 'all',
  sortBy: 'popular',
};

function matchesDurationBucket(tour: Tour, bucket: DurationBucket): boolean {
  if (bucket === 'all') return true;
  if (bucket === 'day') return tour.durationDays === 1;
  if (bucket === 'short') return tour.durationDays >= 2 && tour.durationDays <= 3;
  return tour.durationDays >= 4;
}

/**
 * Owns filter/sort state and derives the visible tour list + the filter
 * option lists (destinations, bus types, price bounds) directly from
 * TOURS — so the filter UI never hardcodes a destination or bus-type
 * list that could drift out of sync with the data. Swapping TOURS for a
 * TanStack Query result later only changes the `source` this hook reads
 * from `data/tours.ts` — every filter/sort computation here is already
 * written generically over `Tour[]`.
 *
 * `initialFilters` lets a caller pre-fill state on mount — e.g. arriving
 * from the Home page's search widget with `?search=Sajek Valley` already
 * in the URL (see ToursPage.tsx).
 */
export function useTourFilters(source: Tour[] = TOURS, initialFilters?: Partial<TourFiltersState>) {
  const [filters, setFilters] = useState<TourFiltersState>(() => ({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  }));

  const destinations = useMemo(
    () => Array.from(new Set(source.map((t) => t.destination))).sort(),
    [source],
  );
  const busTypes = useMemo(
    () => Array.from(new Set(source.map((t) => t.busType))).sort(),
    [source],
  );
  const priceBounds = useMemo<[number, number]>(() => {
    if (source.length === 0) return DEFAULT_PRICE_RANGE;
    const prices = source.map((t) => t.startingPriceBDT);
    return [Math.min(...prices), Math.max(...prices)];
  }, [source]);

  const filteredTours = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();

    const result = source.filter((tour) => {
      if (
        searchTerm &&
        !tour.name.toLowerCase().includes(searchTerm) &&
        !tour.destination.toLowerCase().includes(searchTerm)
      ) {
        return false;
      }
      if (filters.destination !== 'all' && tour.destination !== filters.destination) return false;
      if (filters.category !== 'all' && tour.category !== filters.category) return false;
      if (filters.busType !== 'all' && tour.busType !== filters.busType) return false;
      if (!matchesDurationBucket(tour, filters.duration)) return false;
      if (
        tour.startingPriceBDT < filters.priceRange[0] ||
        tour.startingPriceBDT > filters.priceRange[1]
      )
        return false;
      if (
        filters.departureMonth !== 'all' &&
        !tour.nextDepartureDate.startsWith(filters.departureMonth)
      )
        return false;
      return true;
    });

    const sorted = [...result].sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.startingPriceBDT - b.startingPriceBDT;
        case 'price-desc':
          return b.startingPriceBDT - a.startingPriceBDT;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
        default:
          return b.reviewCount - a.reviewCount;
      }
    });

    return sorted;
  }, [source, filters]);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const activeFilterCount = [
    filters.search !== '',
    filters.destination !== 'all',
    filters.duration !== 'all',
    filters.category !== 'all',
    filters.departureMonth !== 'all',
    filters.busType !== 'all',
    filters.priceRange[0] !== DEFAULT_PRICE_RANGE[0] ||
      filters.priceRange[1] !== DEFAULT_PRICE_RANGE[1],
  ].filter(Boolean).length;

  return {
    filters,
    setFilters,
    filteredTours,
    destinations,
    busTypes,
    priceBounds,
    resetFilters,
    activeFilterCount,
  };
}

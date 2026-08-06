import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CompassIcon } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Section } from '@/components/layout/Section';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { useTourFilters } from '@/features/tours/hooks/useTourFilters';
import { TourCard } from '@/features/tours/components/ToursListing/TourCard';
import { TourCardSkeleton } from '@/features/tours/components/ToursListing/TourCardSkeleton';
import { ToursFilters } from '@/features/tours/components/ToursListing/ToursFilters';
import { ToursToolbar } from '@/features/tours/components/ToursListing/ToursToolbar';
import { staggerContainer } from '@/lib/animations/variants';

const PAGE_SIZE = 9;

/**
 * All Tours page — filters/sorts the static TOURS array today via
 * useTourFilters. The hook's internals are the only thing that changes
 * when this becomes a real search (TanStack Query with server-side
 * filtering); this component just renders `filteredTours`, a loading
 * flag, and pagination — it never touches TOURS directly.
 */
export function ToursPage() {
  const {
    filters,
    setFilters,
    filteredTours,
    destinations,
    busTypes,
    priceBounds,
    resetFilters,
    activeFilterCount,
  } = useTourFilters();

  const [page, setPage] = useState(1);
  // Simulates the initial network fetch's loading state so the skeleton
  // UI has somewhere real to appear — replace with TanStack Query's
  // `isLoading` once a real endpoint exists; this component's JSX below
  // doesn't need to change for that swap.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (patch: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredTours.length / PAGE_SIZE));
  const pagedTours = useMemo(
    () => filteredTours.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredTours, page],
  );

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PageWrapper>
      <PageHeader
        title="All Tours"
        description="Relax getaways, premium retreats, quick day trips, and seasonal specials across Bangladesh."
      />

      <Section className="laptop:grid-cols-[280px_1fr] grid grid-cols-1 gap-8">
        {/* Desktop sidebar — hidden on mobile/tablet, where ToursToolbar's Sheet trigger takes over. */}
        <aside className="laptop:block hidden">
          <div className="sticky top-24">
            <ToursFilters
              filters={filters}
              onChange={handleFilterChange}
              destinations={destinations}
              busTypes={busTypes}
              priceBounds={priceBounds}
              activeFilterCount={activeFilterCount}
              onReset={resetFilters}
            />
          </div>
        </aside>

        <div className="flex flex-col gap-6">
          <ToursToolbar
            resultCount={filteredTours.length}
            filters={filters}
            onChange={handleFilterChange}
            destinations={destinations}
            busTypes={busTypes}
            priceBounds={priceBounds}
            activeFilterCount={activeFilterCount}
            onReset={resetFilters}
          />

          {isLoading ? (
            <div className="desktop:grid-cols-3 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {Array.from({ length: 6 }, (_, i) => (
                <TourCardSkeleton key={i} />
              ))}
            </div>
          ) : pagedTours.length === 0 ? (
            <EmptyState
              icon={CompassIcon}
              title="No tours match your filters"
              description="Try adjusting or resetting your filters to see more results."
              action={
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
              }
            />
          ) : (
            <>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="desktop:grid-cols-3 grid grid-cols-1 gap-6 sm:grid-cols-2"
              >
                {pagedTours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </motion.div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-4"
              />
            </>
          )}
        </div>
      </Section>
    </PageWrapper>
  );
}

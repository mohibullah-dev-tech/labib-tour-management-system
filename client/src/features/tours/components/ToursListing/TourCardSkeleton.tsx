import { Skeleton } from '@/components/ui/skeleton';

/** Mirrors TourCard's exact layout/dimensions so the loading state never causes a layout shift once real cards render. */
function TourCardSkeleton() {
  return (
    <div className="border-border bg-card flex flex-col overflow-hidden rounded-lg border shadow-sm">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="border-border mt-1 flex items-center justify-between border-t pt-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}

export { TourCardSkeleton };

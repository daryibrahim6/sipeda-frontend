import { Skeleton, LocationCardSkeleton } from '@/components/ui/Skeleton';

export default function PetaLoading() {
  return (
    <>
<main id="main" className="page-container py-10" aria-busy="true">
        <div className="mb-8">
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Map placeholder */}
          <Skeleton className="h-[500px] lg:h-[640px] rounded-2xl" />

          {/* Location list */}
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <LocationCardSkeleton key={i} />)}
          </div>
        </div>
      </main>
</>
  );
}
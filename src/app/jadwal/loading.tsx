import { ScheduleCardSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function JadwalLoading() {
  return (
    <>
<main id="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" aria-busy="true">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-9 w-56 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>

        {/* Filter bulan */}
        <div className="mb-4">
          <Skeleton className="h-3 w-12 mb-2" />
          <div className="flex flex-wrap gap-1.5">
            {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-8 w-16 rounded-lg" />)}
          </div>
        </div>

        {/* Filter lokasi */}
        <div className="mb-8">
          <Skeleton className="h-3 w-12 mb-2" />
          <div className="flex flex-wrap gap-1.5">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-lg" />)}
          </div>
        </div>

        {/* Schedule cards */}
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(3)].map((_, j) => <ScheduleCardSkeleton key={j} />)}
              </div>
            </div>
          ))}
        </div>
      </main>
</>
  );
}

import { Skeleton } from '@/components/ui/Skeleton';

export default function StokDarahLoading() {
  return (
    <main id="main" className="animate-pulse">
      {/* Header skeleton */}
      <div className="bg-gray-950 py-16">
        <div className="page-container">
          <Skeleton className="h-3 w-20 bg-gray-800 rounded mb-3" />
          <Skeleton className="h-10 w-64 bg-gray-800 rounded mb-3" />
          <Skeleton className="h-4 w-96 bg-gray-800 rounded" />
        </div>
      </div>

      <div className="page-container py-12 space-y-10">
        {/* Ringkasan Stok skeleton */}
        <div>
          <Skeleton className="h-7 w-48 bg-gray-200 rounded mb-2" />
          <Skeleton className="h-4 w-72 bg-gray-100 rounded mb-6" />
          <div className="grid grid-cols-2 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-6 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stok per Lokasi skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-7 w-40 bg-gray-200 rounded mb-6" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[var(--radius-card)] border border-[var(--color-border-muted)] overflow-hidden">
              <div className="px-6 py-5 bg-[var(--color-section-alt)] border-b border-[var(--color-border-muted)]">
                <Skeleton className="h-4 w-16 rounded-full mb-2" />
                <Skeleton className="h-5 w-48 rounded mb-1" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Skeleton className="h-4 w-6 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-full rounded mb-1" />
                        <Skeleton className="h-1.5 w-full rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
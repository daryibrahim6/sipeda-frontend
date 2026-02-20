// src/app/stok-darah/loading.tsx

import { Skeleton, BloodStockSkeleton } from '@/components/ui/Skeleton';

export default function StokDarahLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" aria-busy="true">
      <div className="mb-8">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-9 w-40 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-5 w-36 rounded-full" />
        ))}
      </div>

      <Skeleton className="h-6 w-48 mb-4" />
      <BloodStockSkeleton />
    </div>
  );
}
// src/app/loading.tsx
// Otomatis ditampilkan Next.js saat page.tsx sedang di-fetch

import { StatCardSkeleton, ScheduleCardSkeleton, ArticleCardSkeleton } from '@/components/ui/Skeleton';

export default function HomeLoading() {
  return (
    <div aria-label="Memuat halaman..." aria-busy="true">
      {/* Hero skeleton */}
      <section className="bg-gray-950 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="animate-pulse h-6 w-48 bg-white/10 rounded-full" />
            <div className="animate-pulse h-14 w-3/4 bg-white/10 rounded-lg" />
            <div className="animate-pulse h-14 w-1/2 bg-white/10 rounded-lg" />
            <div className="animate-pulse h-6 w-full max-w-xl bg-white/10 rounded-lg" />
            <div className="flex gap-3 pt-2">
              <div className="animate-pulse h-12 w-36 bg-white/10 rounded-xl" />
              <div className="animate-pulse h-12 w-36 bg-white/10 rounded-xl" />
              <div className="animate-pulse h-12 w-36 bg-white/10 rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats skeleton */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        </div>
      </section>

      {/* Schedules skeleton */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse h-8 w-48 bg-gray-200 rounded-lg mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <ScheduleCardSkeleton key={i} />)}
          </div>
        </div>
      </section>

      {/* Articles skeleton */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse h-8 w-36 bg-gray-200 rounded-lg mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <ArticleCardSkeleton key={i} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
// src/app/loading.tsx
// Otomatis ditampilkan Next.js saat page.tsx sedang di-fetch

import { StatCardSkeleton, ScheduleCardSkeleton, ArticleCardSkeleton } from '@/components/ui/Skeleton';

export default function HomeLoading() {
  return (
    <div aria-label="Memuat halaman..." aria-busy="true">
      {/* Crimson Depth Hero Skeleton */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-20 overflow-hidden bg-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950 via-gray-950 to-black"></div>
        <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-12 w-full">
          
          <div className="flex justify-center mb-8">
            <div className="animate-pulse h-8 w-48 bg-white/10 rounded-full" />
          </div>

          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="animate-pulse h-16 sm:h-24 w-3/4 bg-white/10 rounded-2xl" />
            <div className="animate-pulse h-16 sm:h-24 w-2/3 bg-white/10 rounded-2xl" />
          </div>

          <div className="flex justify-center mb-12">
            <div className="animate-pulse h-6 w-full max-w-2xl bg-white/10 rounded-lg" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="animate-pulse h-14 w-full sm:w-48 bg-white/20 rounded-full" />
            <div className="animate-pulse h-14 w-full sm:w-48 bg-white/5 rounded-full" />
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
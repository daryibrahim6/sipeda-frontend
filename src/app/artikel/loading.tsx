import { Skeleton, ArticleCardSkeleton } from '@/components/ui/Skeleton';

export default function ArtikelLoading() {
  return (
    <>
<main id="main" aria-busy="true">
        {/* Header dark */}
        <section className="bg-gray-950 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-4 w-24 bg-white/10 rounded mb-3 animate-pulse" />
            <div className="h-10 w-36 bg-white/10 rounded mb-3 animate-pulse" />
            <div className="h-6 w-80 bg-white/10 rounded animate-pulse" />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Featured article skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
            <Skeleton className="aspect-video md:aspect-auto rounded-none h-64 md:h-auto" />
            <div className="p-8 flex flex-col justify-center space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-4/5" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} />)}
          </div>
        </div>
      </main>
</>
  );
}
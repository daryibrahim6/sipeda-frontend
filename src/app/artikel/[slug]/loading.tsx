import { ArticleCardSkeleton } from '@/components/ui/Skeleton';

export default function ArtikelDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-6 w-24 bg-gray-200 rounded mb-6" />
      <div className="h-10 w-3/4 bg-gray-200 rounded-lg mb-4" />
      <div className="h-4 w-1/2 bg-gray-100 rounded mb-8" />
      <div className="aspect-video bg-gray-200 rounded-2xl mb-8" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-11/12" />
        <div className="h-4 bg-gray-100 rounded w-4/5" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
      </div>
      <div className="mt-12">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Droplets } from 'lucide-react';
import { getArticles } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArticleImagePlaceholder } from '@/components/ui/ArticleImagePlaceholder';

export const metadata: Metadata = {
  title: 'Artikel',
  description: 'Baca artikel edukasi seputar donor darah, kesehatan, dan kegiatan PMI Indramayu.',
};

export const revalidate = 120;

export default async function ArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page) : 1;

  const result = await getArticles(page).catch(() => null);
  const articles = result?.data ?? [];
  const totalPages = result?.totalPages ?? 1;

  return (
    <>
      <main id="main">
        <PageHeader
          badge="Edukasi & Info"
          title="Artikel"
          description="Informasi seputar donor darah, tips kesehatan, dan kegiatan PMI Indramayu."
        />

        <div className="page-container py-12">
          {articles.length === 0 ? (
            <EmptyState icon={<Droplets />} title="Belum ada artikel" />
          ) : (
            <>
              {/* Article grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map(a => (
              <Link key={a.id} href={`/artikel/${a.slug}`} className="group bg-white border border-[var(--color-border-muted)] rounded-[var(--radius-card)] shadow-[var(--shadow-elevated)] overflow-hidden cursor-pointer hover:border-[var(--color-primary-light)] hover:shadow-[var(--shadow-hover)] transition-all duration-200">
                    <div className="aspect-video overflow-hidden bg-[var(--color-section-alt)]">
                      {a.gambar ? (
                        <Image
                          src={a.gambar}
                          alt={a.gambar_alt ?? a.judul}
                          width={680}
                          height={383}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <ArticleImagePlaceholder />
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-semibold text-gray-900 leading-snug group-hover:text-red-700 transition-colors mb-2 line-clamp-2">
                        {a.judul}
                      </h3>
                      {a.excerpt && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{a.excerpt}</p>
                      )}
                      <div className="text-xs text-gray-400">{formatDate(a.published_at)}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {page > 1 && (
                    <a href={`/artikel?page=${page - 1}`}
                      className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 active:scale-[0.95] transition-all">
                      ← Sebelumnya
                    </a>
                  )}
                  <span className="px-4 py-2 text-sm text-gray-500">
                    Halaman {page} dari {totalPages}
                  </span>
                  {page < totalPages && (
                    <a href={`/artikel?page=${page + 1}`}
                      className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 active:scale-[0.95] transition-all">
                      Selanjutnya →
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
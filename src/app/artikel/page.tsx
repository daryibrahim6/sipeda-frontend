import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Droplets } from 'lucide-react';
import { getArticles } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Artikel',
  description: 'Baca artikel edukasi seputar donor darah, kesehatan, dan kegiatan PMI Indramayu.',
};

export const revalidate = 120;

export default async function ArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; kategori?: string }>;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page) : 1;

  const result = await getArticles(page).catch(() => null);
  const articles = result?.data ?? [];
  const totalPages = result?.totalPages ?? 1;

  return (
    <>
<main id="main">

        {/* Header */}
        <section className="bg-gray-950 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold text-red-400 uppercase tracking-widest mb-2">
              Edukasi & Info
            </p>
            <h1 className="text-4xl font-bold">Artikel</h1>
            <p className="text-gray-400 mt-2 text-lg">
              Informasi seputar donor darah, tips kesehatan, dan kegiatan PMI Indramayu.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <Droplets className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <div className="text-gray-500 font-medium">Belum ada artikel</div>
            </div>
          ) : (
            <>
              {/* Featured article */}
              {page === 1 && articles[0] && (
                <Link href={`/artikel/${articles[0].slug}`}
                  className="group grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all mb-10">
                  <div className="aspect-video md:aspect-auto bg-gradient-to-br from-red-50 to-red-100 overflow-hidden">
                    {articles[0].gambar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={articles[0].gambar} alt={articles[0].gambar_alt ?? articles[0].judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Droplets className="w-16 h-16 text-red-200" />
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">
                      {articles[0].kategori_nama}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-red-700 transition-colors mb-3">
                      {articles[0].judul}
                    </h2>
                    {articles[0].excerpt && (
                      <p className="text-gray-500 leading-relaxed mb-4 line-clamp-3">
                        {articles[0].excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {formatDate(articles[0].published_at)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
                        Baca selengkapnya <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Article grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(page === 1 ? articles.slice(1) : articles).map(a => (
                  <Link key={a.id} href={`/artikel/${a.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      {a.gambar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.gambar} alt={a.gambar_alt ?? a.judul}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Droplets className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                        {a.kategori_nama}
                      </span>
                      <h3 className="font-semibold text-gray-900 leading-snug group-hover:text-red-700 transition-colors mt-1 mb-2 line-clamp-2">
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
                      className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors">
                      ← Sebelumnya
                    </a>
                  )}
                  <span className="px-4 py-2 text-sm text-gray-500">
                    Halaman {page} dari {totalPages}
                  </span>
                  {page < totalPages && (
                    <a href={`/artikel?page=${page + 1}`}
                      className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors">
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
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag, Droplets } from 'lucide-react';

import { getArticleBySlug, getArticles } from '@/lib/api';
import { formatDate } from '@/lib/utils';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  if (!article) return { title: 'Artikel Tidak Ditemukan' };
  return {
    title: article.judul,
    description: article.excerpt ?? article.judul,
    openGraph: {
      title: article.judul,
      description: article.excerpt ?? '',
      images: article.gambar ? [{ url: article.gambar }] : [],
    },
  };
}

export default async function ArtikelDetailPage({ params }: Props) {
  const { slug } = await params;

  const [article, related] = await Promise.all([
    getArticleBySlug(slug).catch(() => null),
    getArticles(1).catch(() => null),
  ]);

  if (!article) notFound();

  const relatedArticles = related?.data
    ?.filter(a => a.slug !== slug)
    .slice(0, 3) ?? [];

  return (
    <main id="main">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Back */}
        <Link href="/artikel"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Artikel
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-widest">
              <Tag className="w-3 h-3" />
              {article.kategori_nama}
            </span>
            <span className="text-gray-300">·</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {formatDate(article.published_at)}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {article.judul}
          </h1>

          {article.excerpt && (
            <p className="text-lg text-gray-500 leading-relaxed border-l-4 border-red-500 pl-4">
              {article.excerpt}
            </p>
          )}
        </div>

        {/* Cover image */}
        {article.gambar && (
          <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.gambar} alt={article.gambar_alt ?? article.judul}
              className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-gray prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-sm
              prose-strong:text-gray-900
              prose-li:text-gray-600"
          dangerouslySetInnerHTML={{ __html: article.konten ?? '' }}
        />

        {/* Tags / Share */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Kategori:</span>
            <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full">
              {article.kategori_nama}
            </span>
          </div>
        </div>
      </div>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100 py-12 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Artikel Lainnya</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedArticles.map(a => (
                <Link key={a.id} href={`/artikel/${a.slug}`}
                  className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="aspect-video bg-gradient-to-br from-red-50 to-red-100 overflow-hidden">
                    {a.gambar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.gambar} alt={a.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Droplets className="w-8 h-8 text-red-200" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                      {a.kategori_nama}
                    </span>
                    <h3 className="font-semibold text-gray-900 text-sm mt-1 line-clamp-2 group-hover:text-red-700 transition-colors">
                      {a.judul}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
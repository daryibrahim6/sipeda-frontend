import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Share2, Heart, Droplets } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';

import { getArticleBySlug, getArticles } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { StructuredData } from '@/components/seo/StructuredData';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&h=450&fit=crop',
];

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  if (!article) return { title: 'Artikel Tidak Ditemukan' };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sipeda.vercel.app';
  return {
    title: article.judul,
    description: article.excerpt ?? article.judul,
    alternates: { canonical: `${siteUrl}/artikel/${slug}` },
    openGraph: {
      title: article.judul,
      description: article.excerpt ?? '',
      type: 'article',
      publishedTime: article.published_at ?? undefined,
      authors: [article.penulis],
      images: article.gambar ? [{ url: article.gambar }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.judul,
      description: article.excerpt ?? '',
      images: article.gambar ? [article.gambar] : [],
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sipeda.vercel.app';

  const relatedArticles = related?.data
    ?.filter(a => a.slug !== slug)
    .slice(0, 3) ?? [];

  return (
    <main id="main">
      <StructuredData data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.judul,
        description: article.excerpt ?? article.judul,
        image: article.gambar ?? undefined,
        datePublished: article.published_at,
        author: { '@type': 'Person', name: article.penulis },
        publisher: { '@type': 'Organization', name: 'PMI Kabupaten Indramayu', logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png` } },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/artikel/${slug}` },
      }} />
      <StructuredData data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Beranda', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Artikel', item: `${siteUrl}/artikel` },
          { '@type': 'ListItem', position: 3, name: article.judul },
        ],
      }} />

      {/* ── Hero / Cover ── */}
      <div className="relative">
        {article.gambar || article.judul ? (
          <div className="relative h-[40vh] sm:h-[50vh] lg:h-[56vh] overflow-hidden">
            <Image src={article.gambar || FALLBACK_IMAGES[article.id % FALLBACK_IMAGES.length]} alt={article.gambar_alt ?? article.judul} width={800} height={450}
              className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
          </div>
        ) : (
          <div className="h-[32vh] sm:h-[40vh] bg-gradient-to-br from-red-600 via-red-500 to-red-800 flex items-center justify-center">
            <Droplets className="w-16 h-16 text-white/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>
        )}
      </div>

      {/* ── Article Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">

        {/* Back */}
        <Link href="/artikel"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-3xl shadow-[var(--shadow-elevated)] border border-[var(--color-border-muted)] p-8 sm:p-10 mb-8">

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-text-muted)] mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(article.published_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {article.penulis}
            </span>
            {article.kategori_nama && (
              <span className="px-2.5 py-1 rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-semibold text-[10px] uppercase tracking-wider">
                {article.kategori_nama}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-text-primary)] leading-tight mb-5">
            {article.judul}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-base sm:text-lg text-[var(--color-text-secondary)] leading-relaxed border-l-4 border-[var(--color-primary)] pl-5">
              {article.excerpt}
            </p>
          )}

          {/* Share */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[var(--color-border-muted)]">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Bagikan</span>
            <a href={`https://wa.me/?text=${encodeURIComponent(article.judul + ' — ' + 'https://sipeda.vercel.app/artikel/' + article.slug)}`}
              target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
              <Share2 className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Content prose */}
        <div className="bg-white rounded-3xl border border-[var(--color-border-muted)] p-8 sm:p-10 shadow-sm">
          <div
            className="prose prose-gray prose-lg max-w-none text-justify
                prose-headings:font-bold prose-headings:text-[var(--color-text-primary)] prose-headings:tracking-tight
                prose-p:text-[var(--color-text-secondary)] prose-p:leading-relaxed prose-p:text-justify
                prose-a:text-[var(--color-primary)] prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-2xl prose-img:shadow-md
                prose-strong:text-[var(--color-text-primary)]
                prose-li:text-[var(--color-text-secondary)]
                prose-blockquote:border-l-[var(--color-primary)] prose-blockquote:text-[var(--color-text-secondary)] prose-blockquote:bg-[var(--color-primary-subtle)] prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-2xl"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.konten ?? '') }}
          />
        </div>

        {/* Bottom share */}
        <div className="flex items-center justify-center gap-4 my-10">
          <a href={`https://wa.me/?text=${encodeURIComponent(article.judul + ' — ' + 'https://sipeda.vercel.app/artikel/' + article.slug)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors active:scale-[0.97]">
            <Share2 className="w-4 h-4" /> Bagikan Artikel
          </a>
          <Link href="/jadwal"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-accent)] text-white text-sm font-semibold hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-colors active:scale-[0.97]">
            <Heart className="w-4 h-4" /> Daftar Donor
          </Link>
        </div>
      </div>

      {/* ── Related Articles ── */}
      {relatedArticles.length > 0 && (
        <section className="bg-[var(--color-section-alt)] border-t border-[var(--color-border-muted)] py-12 lg:py-16 mt-10">
          <div className="page-container">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-6 bg-[var(--color-primary)] rounded-full" />
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Artikel Lainnya</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedArticles.map(a => (
                <Link key={a.id} href={`/artikel/${a.slug}`} className="group bg-white border border-[var(--color-border-muted)] rounded-[var(--radius-card)] shadow-[var(--shadow-elevated)] overflow-hidden hover:border-[var(--color-primary-light)] hover:shadow-[var(--shadow-hover)] transition-all duration-200 hover:-translate-y-1">
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={a.gambar || FALLBACK_IMAGES[relatedArticles.indexOf(a) % FALLBACK_IMAGES.length]}
                      alt={a.judul} width={800} height={450}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[var(--color-text-primary)] text-sm leading-snug line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                      {a.judul}
                    </h3>
                    <div className="text-xs text-[var(--color-text-muted)] mt-2">{formatDate(a.published_at)}</div>
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

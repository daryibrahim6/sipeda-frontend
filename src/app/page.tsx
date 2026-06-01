import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Droplets, MapPin, Calendar, AlertTriangle,
  ArrowRight, Heart, ChevronDown, TrendingUp, Share2, Navigation
} from 'lucide-react';
import { ScheduleCard } from '@/components/jadwal/ScheduleCard';
import { getStats, getSchedules, getArticles, getBloodStockSummary, getLocations } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Badge, StockBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { BLOOD_ORDER, STOCK_BAR_COLORS, STOCK_TEXT_COLORS, STOCK_LABEL } from '@/lib/constants';
import { RevealWrapper } from '@/components/ui/RevealWrapper';

export const metadata: Metadata = {
  title: 'SIPEDA — Sistem Informasi Pendonoran Darah',
  description: 'Platform informasi pendonoran darah resmi PMI Kabupaten Indramayu. Cek jadwal, stok darah, dan daftar donor online.',
};

export const revalidate = 60;

export default async function HomePage() {
  const results = await Promise.allSettled([
    getStats(),
    getSchedules(),
    getArticles(1),
    getBloodStockSummary(),
    getLocations(),
  ]);

  const failedSections = results.map((r, i) => r.status === 'rejected' ? ['stats', 'schedules', 'articles', 'bloodStock', 'locations'][i] : null).filter(Boolean);
  const hasError = failedSections.length > 0;

  const [stats, schedules, articles, bloodSummary, rawLocations] = results.map(x => x.status === 'fulfilled' ? x.value : null);

  const upcomingSchedules = (schedules as Awaited<ReturnType<typeof getSchedules>> | null)
    ?.filter(s => s.status === 'aktif').slice(0, 3) ?? [];

  const featuredArticles = (articles as Awaited<ReturnType<typeof getArticles>> | null)
    ?.data?.slice(0, 4) ?? [];

  const s = stats as Awaited<ReturnType<typeof getStats>> | null;
  const bloodData = (bloodSummary as Awaited<ReturnType<typeof getBloodStockSummary>> | null) ?? [];
  const locations = (rawLocations as Awaited<ReturnType<typeof getLocations>> | null) ?? [];

  const hasUrgency = (s?.total_stok_kritis ?? 0) > 0;

  const sortedBlood = [...bloodData].sort(
    (a, b) => BLOOD_ORDER.indexOf(a.golongan_darah) - BLOOD_ORDER.indexOf(b.golongan_darah)
  );

  const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=680&h=383&fit=crop',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=680&h=383&fit=crop',
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=680&h=383&fit=crop',
    'https://images.unsplash.com/photo-1628348068946-1c38f34d0c3c?w=680&h=383&fit=crop',
  ];

  return (
    <main id="main">

      {/* ── HERO ── */}
      <section className="relative w-full h-dvh min-h-[600px] overflow-hidden">

        {/* Layer 1 — Background image, terisolasi dari flex */}
        <div className="absolute inset-0 z-0 will-change-auto">
          <Image
            src="/hero-blood.jpg"
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
            fetchPriority="high"
          />
        </div>

        {/* Layer 2 — Overlays, tetap 3 div terpisah */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/70 to-[#0a0a0a]/40" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        <div className="absolute inset-0 z-10 bg-noise opacity-5 mix-blend-overlay pointer-events-none" />

        {/* Layer 3 — Content: sejajar dengan navbar scrolled (64% centered) */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 xl:px-0 xl:w-[64%] xl:mx-auto">
          <div className="xl:max-w-none">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-medium text-gray-300 mb-8 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary-muted)] opacity-75 motion-reduce:animate-none" style={{ animationIterationCount: 2 }} />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-primary)]" />
              </span>
              Sistem Aktif · PMI Indramayu
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 animate-fade-in-up stagger-1">
              Satu Tetes Darah
              <br />
              <span className="text-gradient-red">Tiga Nyawa</span> Tertolong
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 font-medium max-w-xl leading-relaxed mb-10 animate-fade-in-up stagger-2">
              Platform resmi pendonoran darah. Cek ketersediaan kantong darah, cari jadwal terdekat, dan daftar antrean tanpa perlu repot datang.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-in-up stagger-3">
              <Link href="/jadwal" className="inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-accent)] text-white shadow-lg shadow-black/20 hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] hover:shadow-lg hover:shadow-black/30 active:scale-[0.97] transition-all">
                <Heart className="w-5 h-5" /> Daftar Donor
              </Link>
              <Link href="/stok-darah" className="inline-flex items-center gap-2 px-8 py-4 font-medium rounded-full border border-white/30 bg-white/20 text-white hover:bg-white/30 hover:shadow-lg hover:shadow-black/20 active:scale-[0.97] transition-all">
                <Droplets className="w-5 h-5" /> Cek Stok Darah
              </Link>
            </div>

          </div>
        </div>

        {/* Chevron — subtle fade instead of bounce (performance) */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 motion-safe:animate-fade-in motion-reduce:hidden">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-24 left-4 right-4 z-40 md:hidden pointer-events-none">
        <Link href="/jadwal" className="pointer-events-auto flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-accent)] text-white text-sm font-bold rounded-2xl shadow-lg shadow-red-900/30 active:scale-[0.97] transition-all">
          <Heart className="w-4 h-4" /> Daftar Donor Sekarang
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          DATA SECTION — Asymmetric bento + inline stock preview
         ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 lg:py-20" style={{ contentVisibility: 'auto', containIntrinsicSize: '600px' }}>
        <RevealWrapper className="page-container">

          {/* ── Error banner (when data partially fails) ── */}
          {hasError && (
            <div className="mb-8">
              <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-800">Beberapa data gagal dimuat. Silakan muat ulang halaman.</p>
                </div>
                <Link href="/" className="px-4 py-2 text-sm font-semibold bg-amber-600 text-white rounded-xl hover:bg-amber-700 active:scale-[0.97] transition-all flex-shrink-0">
                  Muat Ulang
                </Link>
              </div>
            </div>
          )}

          {/* ── Row 1: Urgency Alert ── */}
          {hasUrgency && (
            <div className="mb-12">
              <div className="flex items-center gap-5 p-6 bg-[var(--color-primary-subtle)] border border-red-200 rounded-3xl ring-1 ring-red-100 shadow-lg">
                <div className="w-12 h-12 bg-red-100 text-[var(--color-primary)] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    <strong className="text-[var(--color-primary-dark)]">{s?.total_stok_kritis} golongan darah</strong> dalam kondisi kritis. Pendonor sangat dibutuhkan hari ini.
                  </p>
                </div>
                <Link href="/stok-darah" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg shadow-black/15 active:scale-[0.97] transition-all flex-shrink-0">
                  Bantu Sekarang
                </Link>
              </div>
            </div>
          )}

          {/* ── Row 2: Stats — asymmetric bento ── */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-16">
            {/* Large — 2 cols */}
            <Card variant="elevated" className="md:col-span-2 md:row-span-2 flex flex-col justify-between p-8 bg-gradient-to-br from-red-50/80 to-white border-[var(--color-primary-light)] ring-1 ring-red-200 shadow-lg shadow-red-900/5">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-2xl flex items-center justify-center">
                  <Droplets className="w-7 h-7" />
                </div>
                {(s?.total_stok_kritis ?? 0) > 0 && (
                  <Badge variant="danger" icon={<AlertTriangle className="w-3 h-3" />}>
                    {s?.total_stok_kritis} kritis
                  </Badge>
                )}
              </div>
              <div className="mt-auto">
                <div className="text-5xl font-extrabold text-[var(--color-primary-dark)] tracking-tight tabular-nums">
                  {s?.total_stok ?? '—'}
                </div>
                <div className="text-sm font-semibold text-[var(--color-primary-muted)] uppercase tracking-wider mt-1">
                  Kantong Tersedia
                </div>
              </div>
            </Card>

            {/* Small 1 */}
            <Card variant="elevated" className="flex flex-col justify-between p-6 ring-1 ring-gray-100 hover:ring-red-200">
              <div className="w-12 h-12 bg-[var(--color-section-alt)] text-[var(--color-text-primary)] rounded-2xl flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight tabular-nums">
                    {s?.lokasi_aktif ?? '—'}
                  </span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mt-1.5">
                  Lokasi Aktif
                </div>
              </div>
            </Card>

            {/* Small 2 */}
            <Card variant="elevated" className="flex flex-col justify-between p-6 ring-1 ring-gray-100 hover:ring-red-200">
              <div className="w-12 h-12 bg-[var(--color-section-alt)] text-[var(--color-text-primary)] rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight tabular-nums">
                  {s?.jadwal_aktif ?? '—'}
                </span>
                <div className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mt-1">
                  Jadwal Bulan Ini
                </div>
              </div>
            </Card>
          </div>

          {/* ── Row 3: Stock Preview — inline progress bars ── */}
          {sortedBlood.length > 0 && (
            <div className="mb-20 p-6 bg-white rounded-3xl border border-[var(--color-border-muted)] ring-1 ring-black/[0.03] shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="section-label mb-1">Stok Darah</div>
                  <h2 className="section-title">Ringkasan Stok</h2>
                </div>
                <Link href="/stok-darah" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline">
                  Detail <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {sortedBlood.map(b => {
                  const maxTotal = Math.max(...sortedBlood.map(x => x.total), 1);
                  const pct = (b.total / maxTotal) * 100;
                  const barColor = STOCK_BAR_COLORS[b.status as keyof typeof STOCK_BAR_COLORS] ?? STOCK_BAR_COLORS.normal;
                  const textColor = STOCK_TEXT_COLORS[b.status as keyof typeof STOCK_TEXT_COLORS] ?? STOCK_TEXT_COLORS.normal;
                  const label = STOCK_LABEL[b.status as keyof typeof STOCK_LABEL] ?? 'Normal';
                  return (
                    <div key={b.golongan_darah} className="flex items-center gap-4">
                      <div className="w-10 flex-shrink-0">
                        <span className={`text-base font-extrabold tracking-tight ${textColor}`}>
                          {b.golongan_darah}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[var(--color-text-muted)] tabular-nums">{b.total} kantong</span>
                          <Badge variant={
                            b.status === 'normal' ? 'success' :
                            b.status === 'kritis' ? 'warning' : 'danger'
                          }>
                            {label}
                          </Badge>
                        </div>
                        <div className="h-2.5 bg-[var(--color-section-alt)] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${b.total === 0 ? 0 : Math.max(pct, 4)}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Row 4: Jadwal (2/3) + Alert Kritis (1/3) — split ── */}
          <div className="flex flex-col lg:flex-row gap-8 mb-20">
            {/* Jadwal — 2/3 */}
            <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="section-label mb-1">Jadwal Donor</div>
                  <h2 className="section-title">Kegiatan Terdekat</h2>
                </div>
                <Link href="/jadwal" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors">
                  Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {upcomingSchedules.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {upcomingSchedules.slice(0, 2).map(s => (
                    <ScheduleCard key={s.id} schedule={s} />
                  ))}
                  {upcomingSchedules[2] && (
                    <div className="sm:col-span-2">
                      <ScheduleCard key={upcomingSchedules[2].id} schedule={upcomingSchedules[2]} />
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={<Calendar className="w-6 h-6" />}
                  title="Belum ada jadwal donor aktif"
                  description="Belum ada jadwal donor yang tersedia saat ini. Cek kembali nanti."
                />
              )}
            </div>

            {/* Alert Kritis — 1/3 */}
            {hasUrgency && (
              <div className="lg:w-1/3">
                <div className="sticky top-28">
                  <Card variant="flush" className="bg-gradient-to-br from-[var(--color-primary-subtle)] to-white border border-[var(--color-primary-light)] ring-1 ring-red-200 shadow-lg !p-8 rounded-3xl">
                    <div className="w-14 h-14 bg-red-100 text-[var(--color-primary)] rounded-2xl flex items-center justify-center mb-5">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Stok Darah Kritis</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
                      Saat ini terdapat <strong className="text-[var(--color-primary-dark)]">{s?.total_stok_kritis} golongan darah</strong> dalam kondisi kritis atau kosong. Setetes darah Anda sangat berarti.
                    </p>
                    <Link href="/stok-darah" className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 shadow-lg shadow-black/15 active:scale-[0.97] transition-all">
                      <Heart className="w-4 h-4" /> Bantu Sekarang
                    </Link>
                    <a href={`https://wa.me/?text=${encodeURIComponent('Info Stok Darah — PMI Indramayu. Ayo bantu donor darah!')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full mt-3 py-2.5 rounded-2xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-section-alt)] hover:border-[var(--color-primary)] active:scale-[0.97] transition-all">
                      <Share2 className="w-4 h-4" /> Bagikan
                    </a>
                  </Card>
                </div>
              </div>
            )}
          </div>

        </RevealWrapper>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LOKASI — Location preview with stock
         ═══════════════════════════════════════════════════════════════ */}
      {locations.length > 0 && (
      <section className="py-12 lg:py-20 bg-white">
          <RevealWrapper className="page-container">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="section-label mb-1">Lokasi Donor</div>
                <h2 className="section-title">Temukan Lokasi Terdekat</h2>
              </div>
              <Link href="/peta" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors">
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {locations.slice(0, 3).map(loc => {
                const worstPri = (status: string) =>
                  status === 'kosong' ? 2 : status === 'kritis' ? 1 : 0;
                const deduped = (loc.stok_ringkas ?? []).reduce<Record<string, { golongan_darah: string; status: string }>>((acc, s) => {
                  const existing = acc[s.golongan_darah];
                  if (!existing || worstPri(s.status) > worstPri(existing.status)) acc[s.golongan_darah] = s;
                  return acc;
                }, {});
                const stockEntries = Object.values(deduped);

                return (
                  <Card key={loc.id} variant="interactive" className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm text-[var(--color-text-primary)] leading-snug">{loc.nama_lokasi}</h3>
                      <Badge>{loc.tipe}</Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-3">
                      <MapPin className="w-3 h-3" />
                      {loc.kecamatan}
                    </div>

                    {stockEntries.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-[var(--color-text-muted)] mb-1.5 font-medium">Stok tersedia:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {stockEntries.map((s, i) => (
                            <div key={`${s.golongan_darah}-${i}`} className="flex items-center gap-1">
                              <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]">{s.golongan_darah}</span>
                              <StockBadge status={s.status as 'normal' | 'kritis' | 'kosong'} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-[var(--color-border-muted)]">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${loc.koordinat_lat},${loc.koordinat_lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2.5 min-h-[44px] bg-red-600 hover:bg-red-700 shadow-lg shadow-black/10 text-white text-xs font-semibold rounded-lg active:scale-[0.95] transition-all"
                      >
                        <Navigation className="w-3 h-3" />
                        Petunjuk Arah
                      </a>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/peta" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-2xl bg-white text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] active:scale-[0.97] transition-all">
                Lihat Semua Lokasi <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </RevealWrapper>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          ARTIKEL — Horizontal scroll
         ═══════════════════════════════════════════════════════════════ */}
      {featuredArticles.length > 0 && (
      <section className="py-12 lg:py-20 bg-white">
        <RevealWrapper>
          <div className="page-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="section-label mb-1">Edukasi & Info</div>
                <h2 className="section-title">Artikel Terbaru</h2>
              </div>
              <Link href="/artikel" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors">
                Semua Artikel <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Horizontal scroll */}
          <div className="overflow-x-auto pb-4 -mb-4 scrollbar-hide">
            <div className="flex gap-6 px-4 sm:px-6 lg:px-8 w-max lg:mx-auto">
              {featuredArticles.map((a, i) => (
                <Link
                  key={a.id}
                  href={`/artikel/${a.slug}`}
                  className="group flex-shrink-0 w-[300px] sm:w-[340px] bg-white rounded-3xl overflow-hidden border border-[var(--color-border-muted)] shadow-sm hover:-translate-y-1.5 hover:shadow-xl hover:border-[var(--color-primary-light)] transition-all duration-300 active:scale-[0.98]"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-[var(--color-section-alt)]">
                    <Image
                      src={a.gambar || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                      alt={a.gambar_alt ?? a.judul}
                      width={340}
                      height={191}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      sizes="(max-width: 640px) 300px, 340px"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[var(--color-text-primary)] leading-snug mb-2 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                      {a.judul}
                    </h3>
                    {a.excerpt && (
                      <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-3">{a.excerpt}</p>
                    )}
                    <div className="text-xs text-[var(--color-text-muted)]">{formatDate(a.published_at)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link href="/artikel" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-2xl bg-white text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] active:scale-[0.97] transition-all">
              Semua Artikel <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </RevealWrapper>
        </section>
      )}
    </main>
  );
}

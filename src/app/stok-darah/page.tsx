import type { Metadata } from 'next';
import { Droplets, MapPin, Calendar, RefreshCw, Info, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { getBloodStockSummary, getLocations, getBloodStockByMultipleLocations } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { BLOOD_ORDER, STOCK_BAR_COLORS, STOCK_TEXT_COLORS, STOCK_LABEL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Stok Darah',
  description: 'Cek ketersediaan stok darah real-time di PMI dan fasilitas kesehatan Kabupaten Indramayu.',
};

export const revalidate = 30;

export default async function StokDarahPage() {
  const [summary, locations] = await Promise.all([
    getBloodStockSummary().catch(() => []),
    getLocations().catch(() => []),
  ]);

  const lokasiIds = locations.map(l => l.id);
  const allStocks = await getBloodStockByMultipleLocations(lokasiIds).catch(() => ({} as Record<number, Awaited<ReturnType<typeof getBloodStockByMultipleLocations>>[number]>));
  const stockPerLokasi = locations.map(lokasi => ({
    lokasi,
    stocks: allStocks[lokasi.id] ?? [],
  }));

  const lastUpdated = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  });

  const totalKritis = summary.filter(s => s.status !== 'normal').length;

  const statusPriority = { kosong: 2, kritis: 1, normal: 0 } as const;
  const sortedSummary = [...summary].sort((a, b) => {
    const pa = statusPriority[a.status as keyof typeof statusPriority] ?? 0;
    const pb = statusPriority[b.status as keyof typeof statusPriority] ?? 0;
    if (pa !== pb) return pb - pa;
    return BLOOD_ORDER.indexOf(a.golongan_darah) - BLOOD_ORDER.indexOf(b.golongan_darah);
  });

  return (
    <main id="main">
      <PageHeader
        badge={{ icon: <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary-muted)] opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-primary)]" /></span>, text: 'Pemantauan Real-time' }}
        title="Stok Darah"
        description={<>Data ketersediaan darah di seluruh fasilitas kesehatan Kabupaten Indramayu. Diperbarui secara berkala oleh <strong>petugas resmi PMI</strong>.</>}
        actions={
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-section-alt)] rounded-2xl text-sm text-[var(--color-text-muted)] font-medium border border-[var(--color-border-muted)]">
            <RefreshCw className="w-4 h-4" />
            Terakhir diperbarui: {lastUpdated} WIB
          </div>
        }
      />

      {/* ── Alert kritis ── */}
      {totalKritis > 0 && (
        <section className="bg-[var(--color-primary-subtle)] border-b border-red-100">
          <div className="page-container py-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-1">
                <span className="relative flex h-3 w-3 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-50" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-primary)]" />
                </span>
                <p className="text-sm text-[var(--color-primary-dark)] font-medium">
                  <strong>{totalKritis} golongan darah</strong> dalam kondisi kritis atau kosong.
                  Pendonor sangat dibutuhkan —{' '}
                  <Link href="/jadwal" className="underline font-bold hover:text-[var(--color-primary)]">daftar donor sekarang</Link>.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a href={`https://wa.me/?text=${encodeURIComponent(`🚨 *Info Stok Darah — PMI Indramayu*\n\n${sortedSummary.filter(s => s.status !== 'normal').map(s => `${s.golongan_darah}: ${s.status === 'kosong' ? 'KOSONG' : 'KRITIS'} (${s.total} kantong)`).join('\n')}\n\nAyo bantu! Cek jadwal & daftar donor:\n🔗 https://sipeda.vercel.app/jadwal`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-semibold rounded-2xl hover:bg-[var(--color-primary)]/20 transition-colors min-h-[44px]">
                  <MessageCircle className="w-3.5 h-3.5" />
                  Bagikan
                </a>
                <a href="tel:+62234271648"
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-semibold rounded-2xl hover:bg-[var(--color-primary)]/20 transition-colors min-h-[44px]">
                  <Phone className="w-3.5 h-3.5" />
                  Hubungi PMI
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="page-container py-8 space-y-10">

        {/* ── CTA Banner — ajak donor ── */}
        <section className="bg-gradient-to-r from-[var(--color-primary)] to-red-600 rounded-2xl p-5 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold">Siap donor darah?</h3>
              <p className="text-sm text-white/80 mt-0.5">Cek jadwal dan daftar sekarang di lokasi terdekat.</p>
            </div>
            <Link
              href="/jadwal"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[var(--color-primary)] font-semibold rounded-xl hover:bg-white/90 active:scale-[0.97] transition-all shadow-lg shrink-0 text-sm"
            >
              <Calendar className="w-4 h-4" />
              Daftar Donor
            </Link>
          </div>
        </section>

        {/* ── Ringkasan — inline progress bars ── */}
        <section>
          <h2 className="text-h2 text-[var(--color-text-primary)] mb-1">Ringkasan Stok</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-8">Total stok dari semua lokasi, digabung per golongan darah.</p>

          {sortedSummary.length === 0 ? (
            <EmptyState icon={<Droplets />} title="Data stok belum tersedia" description="Hubungi PMI Indramayu untuk informasi lebih lanjut" />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
                {sortedSummary.map(b => {
                  const maxTotal = Math.max(...sortedSummary.map(x => x.total), 1);
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

              {/* Legend */}
              <div className="flex flex-wrap gap-5 mt-8 text-xs text-[var(--color-text-secondary)]">
                {[
                  { dot: 'bg-green-500', label: 'Tersedia', desc: 'Stok aman' },
                  { dot: 'bg-amber-400', label: 'Kritis', desc: 'Stok menipis, perlu pendonor' },
                  { dot: 'bg-[var(--color-primary)]', label: 'Kosong', desc: 'Tidak ada stok, sangat mendesak' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${l.dot}`} />
                    <span><strong className="text-[var(--color-text-primary)]">{l.label}</strong> — {l.desc}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ── Stok per Lokasi ── */}
        {stockPerLokasi.length > 0 && (
          <section>
            <h2 className="text-h2 text-[var(--color-text-primary)] mb-1">Stok per Lokasi</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-8">Detail ketersediaan di masing-masing fasilitas.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {stockPerLokasi.map(({ lokasi, stocks }) => {
                const byKomponen: Record<string, typeof stocks> = {};
                for (const s of stocks) {
                  if (!byKomponen[s.komponen_kode]) byKomponen[s.komponen_kode] = [];
                  byKomponen[s.komponen_kode].push(s);
                }
                const kompList = Object.keys(byKomponen).sort();

                return (
                  <Card key={lokasi.id} variant="elevated" padding={false}>
                    <div className="px-6 py-5 bg-[var(--color-section-alt)] border-b border-[var(--color-border-muted)] flex items-start justify-between gap-4">
                      <div>
                        <Badge className="mb-1.5">{lokasi.tipe}</Badge>
                        <h3 className="font-bold text-[var(--color-text-primary)]">{lokasi.nama_lokasi}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mt-1">
                          <MapPin className="w-3 h-3" />
                          {lokasi.kecamatan} · {lokasi.kota}
                        </div>
                      </div>
                      {lokasi.kontak && (
                        <a href={`tel:${lokasi.kontak}`}
                          className="text-xs font-medium text-[var(--color-primary)] hover:underline flex-shrink-0 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {lokasi.kontak}
                        </a>
                      )}
                    </div>

                    <div className="p-6 space-y-5">
                      {kompList.length === 0 ? (
                        <p className="text-sm text-[var(--color-text-muted)] italic">Data stok belum diperbarui.</p>
                      ) : (
                        kompList.map(kode => {
                          const kompStocks = byKomponen[kode];
                          const namaKomp = kompStocks[0]?.komponen_nama ?? kode;
                          const maxLocal = Math.max(...kompStocks.map(s => s.jumlah), 1);
                          return (
                            <div key={kode}>
                              <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
                                {namaKomp} ({kode})
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
                                {BLOOD_ORDER.map(golongan => {
                                  const s = kompStocks.find(w => w.golongan_darah === golongan);
                                  const localPct = s ? (s.jumlah / maxLocal) * 100 : 0;
                                  const localBarColor = s ? (STOCK_BAR_COLORS[s.status as keyof typeof STOCK_BAR_COLORS] ?? STOCK_BAR_COLORS.normal) : '';
                                  const localTextColor = s ? (STOCK_TEXT_COLORS[s.status as keyof typeof STOCK_TEXT_COLORS] ?? STOCK_TEXT_COLORS.normal) : 'text-[var(--color-text-muted)]';
                                  return (
                                    <div key={golongan} className="flex items-center gap-2">
                                      <span className={`text-xs font-extrabold w-7 flex-shrink-0 ${localTextColor}`}>
                                        {golongan}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs text-[var(--color-text-muted)] tabular-nums">{s ? s.jumlah : '—'}</span>
                                        </div>
                                        {s && (
                                          <div className="h-1.5 bg-[var(--color-section-alt)] rounded-full overflow-hidden mt-0.5">
                                            <div className={`h-full rounded-full ${localBarColor}`} style={{ width: `${Math.max(localPct, 3)}%` }} />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* ── CTA Banner 2 — bottom ── */}
        <section className="bg-[var(--color-section-alt)] border border-[var(--color-border-muted)] rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">Tertarik jadi pendonor?</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Temukan jadwal donor terdekat dan daftar langsung dari sini.</p>
            </div>
            <Link
              href="/jadwal"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold rounded-xl active:scale-[0.97] transition-all shadow-lg shrink-0 text-sm"
            >
              <Calendar className="w-4 h-4" />
              Daftar Donor
            </Link>
          </div>
        </section>

        {/* ── Info box ── */}
        <Card variant="flush" className="bg-blue-50 border border-blue-100 !p-6 rounded-3xl">
          <div className="flex gap-4">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Tentang Data Stok</h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                Data stok yang ditampilkan diperbarui secara berkala oleh petugas PMI Indramayu
                dan fasilitas kesehatan terkait. Untuk informasi real-time atau kebutuhan
                mendesak, harap hubungi langsung PMI Kabupaten Indramayu di{' '}
                <a href="tel:+62234271648" className="font-semibold underline">
                  0234-271648
                </a>{' '}
                atau kunjungi halaman{' '}
                <a href="/peta" className="font-semibold underline">peta lokasi</a>.
              </p>
            </div>
          </div>
        </Card>

      </div>
    </main>
  );
}

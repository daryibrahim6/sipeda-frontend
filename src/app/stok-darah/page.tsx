import type { Metadata } from 'next';
import { Droplets, MapPin, RefreshCw, AlertTriangle, CheckCircle2, Info, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { getBloodStockSummary, getLocations, getBloodStockByMultipleLocations } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Stok Darah',
  description: 'Cek ketersediaan stok darah real-time di PMI dan fasilitas kesehatan Kabupaten Indramayu.',
};

export const revalidate = 60;

// ─── Status badge component ───────────────────────────────────────────────────
function StockStatus({ status }: { status: 'normal' | 'kritis' | 'kosong' }) {
  if (status === 'normal') return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
      <CheckCircle2 className="w-3 h-3" /> Tersedia
    </span>
  );
  if (status === 'kritis') return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      <AlertTriangle className="w-3 h-3" /> Kritis
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
      <Droplets className="w-3 h-3" /> Kosong
    </span>
  );
}

// ─── Blood type card ─────────────────────────────────────────────────────────
function BloodTypeCard({
  golongan, total, status,
}: {
  golongan: string;
  total: number;
  status: 'normal' | 'kritis' | 'kosong';
}) {
  const bg =
    status === 'kosong' ? 'bg-red-50 border-red-200' :
      status === 'kritis' ? 'bg-amber-50 border-amber-200' :
        'bg-white border-gray-100';

  const textColor =
    status === 'kosong' ? 'text-red-700' :
      status === 'kritis' ? 'text-amber-700' :
        'text-gray-900';

  return (
    <div className={`rounded-2xl border p-4 flex flex-col items-center gap-2 transition-all hover:shadow-md ${bg}`}>
      {/* Pulsing indicator jika kritis/kosong */}
      {status !== 'normal' && (
        <span className="relative flex h-2 w-2 self-end">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'kosong' ? 'bg-red-400' : 'bg-amber-400'}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'kosong' ? 'bg-red-500' : 'bg-amber-500'}`} />
        </span>
      )}
      <div className={`text-3xl font-extrabold tracking-tight ${textColor}`}>
        {golongan}
      </div>
      <div className="text-center">
        <div className={`text-xl font-bold ${textColor}`}>{total}</div>
        <div className="text-xs text-gray-400 mt-0.5">kantong</div>
      </div>
      <StockStatus status={status} />
    </div>
  );
}

// ─── Komponen filter tabs ─────────────────────────────────────────────────────
const BLOOD_ORDER = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function StokDarahPage() {
  // FIX: Satu batch fetch semua data yang dibutuhkan — tidak ada N+1
  const [summary, locations] = await Promise.all([
    getBloodStockSummary().catch(() => []),
    getLocations().catch(() => []),
  ]);

  // FIX: Single bulk query untuk semua lokasi (menggantikan N queries)
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

  const sortedSummary = [...summary].sort(
    (a, b) => BLOOD_ORDER.indexOf(a.golongan_darah) - BLOOD_ORDER.indexOf(b.golongan_darah)
  );

  // Dapatkan komponen unik dari data stok
  const allComponents = Array.from(
    new Set(
      Object.values(allStocks)
        .flat()
        .map(s => s.komponen_kode)
        .filter(Boolean)
    )
  ).sort();

  return (
    <>
      <main id="main">
        {/* ── Header ── */}
        <section className="bg-gray-950 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">
              Real-time
            </p>
            <h1 className="text-4xl font-extrabold mb-3">Stok Darah</h1>
            <p className="text-gray-400 max-w-xl">
              Data ketersediaan darah di seluruh fasilitas kesehatan Kabupaten Indramayu.
              Diperbarui secara berkala oleh petugas PMI.
            </p>

            {/* Last updated */}
            <div className="flex items-center gap-2 mt-5 text-sm text-gray-500">
              <RefreshCw className="w-3.5 h-3.5" />
              Terakhir diperbarui: {lastUpdated} WIB
            </div>
          </div>
        </section>

        {/* ── Alert kritis ── */}
        {totalKritis > 0 && (() => {
          const kritisInfo = sortedSummary
            .filter(s => s.status !== 'normal')
            .map(s => `${s.golongan_darah}: ${s.status === 'kosong' ? 'KOSONG' : 'KRITIS'} (${s.total} kantong)`)
            .join('\n');
          const waText = `🚨 *Info Stok Darah — PMI Indramayu*\n\nBeberapa golongan darah membutuhkan pendonor:\n\n${kritisInfo}\n\nAyo bantu! Cek jadwal & daftar donor:\n🔗 https://sipeda.vercel.app/jadwal`;
          const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`;
          return (
            <section className="bg-red-600">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="relative flex h-3 w-3 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                    </span>
                    <p className="text-sm text-white font-medium">
                      <strong>{totalKritis} golongan darah</strong> dalam kondisi kritis atau kosong.
                      Pendonor sangat dibutuhkan —{' '}
                      <Link href="/jadwal" className="underline font-bold">daftar donor sekarang</Link>.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={waUrl}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 border border-white/30 text-white text-xs font-semibold rounded-xl hover:bg-white/30 transition-colors">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Bagikan
                    </a>
                    <a href="tel:+62234271648"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 border border-white/30 text-white text-xs font-semibold rounded-xl hover:bg-white/30 transition-colors">
                      <Phone className="w-3.5 h-3.5" />
                      Hubungi PMI
                    </a>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

          {/* ── Ringkasan semua golongan darah ── */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Ringkasan Stok</h2>
              <p className="text-gray-500 text-sm mt-1">
                Total stok dari semua lokasi donor aktif, digabungkan per golongan darah.
              </p>
            </div>

            {sortedSummary.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                <Droplets className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Data stok belum tersedia</p>
                <p className="text-sm text-gray-400 mt-1">
                  Hubungi PMI Indramayu untuk informasi lebih lanjut
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {sortedSummary.map(s => (
                  <BloodTypeCard
                    key={s.golongan_darah}
                    golongan={s.golongan_darah}
                    total={s.total}
                    status={s.status}
                  />
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-5 mt-5 text-xs text-gray-500">
              {[
                { dot: 'bg-green-500', label: 'Tersedia', desc: 'Stok aman' },
                { dot: 'bg-amber-400', label: 'Kritis', desc: 'Stok menipis, perlu pendonor' },
                { dot: 'bg-red-500', label: 'Kosong', desc: 'Tidak ada stok, sangat mendesak' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${l.dot}`} />
                  <span><strong className="text-gray-700">{l.label}</strong> — {l.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Stok per lokasi ── */}
          {stockPerLokasi.length > 0 && (
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Stok per Lokasi</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Detail ketersediaan darah di masing-masing fasilitas.
                </p>
              </div>

              <div className="space-y-6">
                {stockPerLokasi.map(({ lokasi, stocks }) => {
                  // Group by komponen
                  const byKomponen: Record<string, typeof stocks> = {};
                  for (const s of stocks) {
                    if (!byKomponen[s.komponen_kode]) byKomponen[s.komponen_kode] = [];
                    byKomponen[s.komponen_kode].push(s);
                  }
                  const kompList = Object.keys(byKomponen).sort();

                  return (
                    <div key={lokasi.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      {/* Lokasi header */}
                      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                              {lokasi.tipe}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900">{lokasi.nama_lokasi}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            {lokasi.kecamatan} · {lokasi.kota}
                          </div>
                        </div>
                        {lokasi.kontak && (
                          <a href={`tel:${lokasi.kontak}`}
                            className="text-xs font-medium text-red-600 hover:underline flex-shrink-0 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lokasi.kontak}
                          </a>
                        )}
                      </div>

                      {/* Stok per komponen */}
                      <div className="p-6 space-y-5">
                        {kompList.length === 0 ? (
                          <p className="text-sm text-gray-400 italic">
                            Data stok belum diperbarui untuk lokasi ini.
                          </p>
                        ) : (
                          kompList.map(kode => {
                            const kompStocks = byKomponen[kode];
                            const namaKomp = kompStocks[0]?.komponen_nama ?? kode;
                            return (
                              <div key={kode}>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                                  {namaKomp} ({kode})
                                </p>
                                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                  {BLOOD_ORDER.map(golongan => {
                                    const s = kompStocks.find((w: { golongan_darah: string }) => w.golongan_darah === golongan);
                                    return (
                                      <div key={golongan}
                                        className={`rounded-xl p-3 text-center border transition-colors ${!s ? 'bg-gray-50 border-gray-100 opacity-40' :
                                          s.status === 'kosong' ? 'bg-red-50 border-red-200' :
                                            s.status === 'kritis' ? 'bg-amber-50 border-amber-200' :
                                              'bg-green-50 border-green-200'
                                          }`}>
                                        <div className={`text-lg font-bold ${!s ? 'text-gray-400' :
                                          s.status === 'kosong' ? 'text-red-700' :
                                            s.status === 'kritis' ? 'text-amber-700' :
                                              'text-green-700'
                                          }`}>
                                          {golongan}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                          {s ? `${s.jumlah}` : '—'}
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
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Info box ── */}
          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
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
          </section>

        </div>
      </main >
    </>
  );
}
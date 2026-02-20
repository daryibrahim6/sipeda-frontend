import Link from 'next/link';
import { Droplets, MapPin, Calendar, AlertTriangle, ArrowRight, Phone } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { StatCard } from '@/components/ui/StatCard';
import { ScheduleCard } from '@/components/jadwal/ScheduleCard';
import { getStats, getSchedules, getArticles, getAnnouncements } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export const revalidate = 60;

export default async function HomePage() {
  const [stats, schedules, articles, announcements] = await Promise.allSettled([
    getStats(),
    getSchedules(),
    getArticles(1),
    getAnnouncements(),
  ]).then(r => r.map(x => x.status === 'fulfilled' ? x.value : null));

  const upcomingSchedules = (schedules as Awaited<ReturnType<typeof getSchedules>> | null)
    ?.filter(s => s.status === 'aktif').slice(0, 3) ?? [];

  const featuredArticles = (articles as Awaited<ReturnType<typeof getArticles>> | null)
    ?.data?.slice(0, 3) ?? [];

  const activeAnnouncements = (announcements as Awaited<ReturnType<typeof getAnnouncements>> | null) ?? [];
  const s = stats as Awaited<ReturnType<typeof getStats>> | null;

  return (
    <>
      <Navbar />
      <main id="main">

        {/* Announcement Banner */}
        {activeAnnouncements.map(a => (
          <div key={a.id} className={`px-4 py-3 text-sm text-center font-medium ${
            a.tipe === 'darurat'    ? 'bg-red-600 text-white' :
            a.tipe === 'peringatan' ? 'bg-amber-500 text-white' :
            a.tipe === 'sukses'     ? 'bg-green-600 text-white' :
            'bg-blue-600 text-white'
          }`}>
            <span className="font-semibold">{a.judul}</span> — {a.isi}
            {a.link && (
              <Link href={a.link} className="ml-2 underline">
                {a.link_teks ?? 'Selengkapnya'}
              </Link>
            )}
          </div>
        ))}

        {/* ── Hero ── */}
        <section className="relative bg-gray-950 text-white overflow-hidden">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
          {/* Red glow */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-red-700/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium mb-8 text-gray-300">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Layanan aktif 24 jam — PMI Indramayu
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                Donor Darah
                <br />
                <span className="text-red-400">Lebih Mudah</span> dari
                <br />
                Sebelumnya
              </h1>

              <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-xl">
                Temukan lokasi donor darah terdekat, pantau stok darah secara real-time,
                dan daftar jadwal donor — semuanya di satu platform.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/peta"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
                  <MapPin className="w-4 h-4" />
                  Temukan Lokasi
                </Link>
                <Link href="/jadwal"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors">
                  <Calendar className="w-4 h-4" />
                  Lihat Jadwal
                </Link>
                <Link href="/stok-darah"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors">
                  <Droplets className="w-4 h-4" />
                  Cek Stok Darah
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Droplets}
                value={s?.total_stok ?? '—'}
                label="Total Stok Darah"
                sub="dalam kantong/unit"
              />
              <StatCard
                icon={MapPin}
                value={s?.lokasi_aktif ?? '—'}
                label="Lokasi Aktif"
              />
              <StatCard
                icon={Calendar}
                value={s?.jadwal_aktif ?? '—'}
                label="Jadwal Bulan Ini"
              />
              <StatCard
                icon={AlertTriangle}
                value={s?.total_stok_kritis ?? '—'}
                label="Stok Kritis"
                sub="butuh pendonor segera"
                alert={(s?.total_stok_kritis ?? 0) > 0}
              />
            </div>
          </div>
        </section>

        {/* ── Cara Kerja ── */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-2">
                Mudah & Cepat
              </p>
              <h2 className="text-3xl font-bold text-gray-900">Donor Darah dalam 4 Langkah</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {/* Connector line */}
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-red-200 to-transparent" />

              {[
                { num: '01', title: 'Temukan Lokasi', desc: 'Buka peta interaktif dan cari lokasi donor darah terdekat di Kecamatan Indramayu.', icon: MapPin },
                { num: '02', title: 'Pilih Jadwal',   desc: 'Lihat jadwal kegiatan donor dan pilih waktu yang paling sesuai dengan kamu.', icon: Calendar },
                { num: '03', title: 'Daftar Online',  desc: 'Isi form pendaftaran singkat dan dapatkan kode registrasi via WhatsApp.', icon: ArrowRight },
                { num: '04', title: 'Datang & Donor', desc: 'Tunjukkan kode registrasi di lokasi dan mulai menyelamatkan nyawa.', icon: Droplets },
              ].map(step => (
                <div key={step.num} className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 rounded-2xl mb-4 mx-auto">
                    <step.icon className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="text-xs font-bold text-red-400 font-mono mb-1">{step.num}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Jadwal Terdekat ── */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-1">
                  Jadwal Donor
                </p>
                <h2 className="text-3xl font-bold text-gray-900">Kegiatan Terdekat</h2>
              </div>
              <Link href="/jadwal"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                Lihat semua <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {upcomingSchedules.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcomingSchedules.map(s => (
                  <ScheduleCard key={s.id} schedule={s} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <div className="text-gray-500 font-medium">Belum ada jadwal aktif bulan ini</div>
                <div className="text-sm text-gray-400 mt-1">Pantau terus untuk update terbaru</div>
              </div>
            )}

            <div className="text-center mt-6 sm:hidden">
              <Link href="/jadwal"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
                Lihat semua jadwal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Emergency CTA ── */}
        <section className="py-16 bg-red-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-6">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Butuh Darah Mendesak?</h2>
            <p className="text-red-100 text-lg mb-8 max-w-xl mx-auto">
              Hubungi PMI Indramayu langsung atau cek ketersediaan stok darah secara real-time.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/stok-darah"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-700 font-semibold rounded-xl hover:bg-red-50 transition-colors">
                <Droplets className="w-4 h-4" />
                Cek Stok Darah
              </Link>
              <a href="tel:+62234123456"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-700 border border-white/20 text-white font-semibold rounded-xl hover:bg-red-800 transition-colors">
                <Phone className="w-4 h-4" />
                Hubungi PMI
              </a>
            </div>
          </div>
        </section>

        {/* ── Artikel ── */}
        {featuredArticles.length > 0 && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-1">
                    Edukasi & Info
                  </p>
                  <h2 className="text-3xl font-bold text-gray-900">Artikel Terbaru</h2>
                </div>
                <Link href="/artikel"
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700">
                  Lihat semua <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredArticles.map(a => (
                  <Link key={a.id} href={`/artikel/${a.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
                    {a.gambar ? (
                      <div className="aspect-video bg-gray-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={a.gambar} alt={a.gambar_alt ?? a.judul}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                        <Droplets className="w-10 h-10 text-red-300" />
                      </div>
                    )}
                    <div className="p-5">
                      <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                        {a.kategori_nama}
                      </span>
                      <h3 className="font-semibold text-gray-900 leading-snug group-hover:text-red-700 transition-colors mt-1 mb-2">
                        {a.judul}
                      </h3>
                      {a.excerpt && (
                        <p className="text-sm text-gray-500 line-clamp-2">{a.excerpt}</p>
                      )}
                      <div className="text-xs text-gray-400 mt-3">
                        {formatDate(a.published_at)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />
    </>
  );
}
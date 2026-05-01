import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Droplets, MapPin, Calendar, AlertTriangle,
  ArrowRight, Phone, Heart, Users, Clock,
  ChevronRight, ChevronDown
} from 'lucide-react';
import { ScheduleCard } from '@/components/jadwal/ScheduleCard';
import { getStats, getSchedules, getArticles, getAnnouncements } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'SIPEDA — Sistem Informasi Pendonoran Darah',
  description: 'Platform informasi pendonoran darah resmi PMI Kabupaten Indramayu. Cek jadwal, stok darah, dan daftar donor online.',
};

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

  const hasUrgency = (s?.total_stok_kritis ?? 0) > 0;

  return (
    <>
<main id="main">

        {/* ── Announcement Banner ── */}
        {activeAnnouncements.map(a => (
          <div key={a.id} className={`px-4 py-3 text-sm text-center font-medium ${
            a.tipe === 'darurat'    ? 'bg-red-600 text-white' :
            a.tipe === 'peringatan' ? 'bg-amber-500 text-white' :
            a.tipe === 'sukses'     ? 'bg-green-600 text-white' :
            'bg-blue-600 text-white'
          }`}>
            <span className="font-bold">{a.judul}</span>
            <span className="mx-2 opacity-60">—</span>
            {a.isi}
            {a.link && (
              <Link href={a.link} className="ml-2 underline underline-offset-2 font-semibold">
                {a.link_teks ?? 'Selengkapnya'} →
              </Link>
            )}
          </div>
        ))}

        {/* ── CRIMSON DEPTH HERO (Dark + Noise) ── */}
        <section className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-20 overflow-hidden bg-gray-950">
          {/* Deep gradient background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950 via-gray-950 to-black"></div>
          
          {/* Static SVG Noise Overlay (Zero Lag) */}
          <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay pointer-events-none"></div>

          {/* Optional: Glow spheres for depth */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-12">
            
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-medium text-gray-300 mb-8 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              Sistem Aktif • PMI Indramayu
            </div>

            {/* Huge Hero Typography */}
            <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight mb-8 text-white leading-[1.1] animate-fade-in-up stagger-1">
              Satu Tetes Darah.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-300">
                Tiga Nyawa
              </span> Tertolong.
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 font-medium max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up stagger-2">
              Platform resmi pendonoran darah. Cek ketersediaan kantong darah, cari jadwal terdekat, dan daftar antrean tanpa perlu repot datang.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3">
              <Link href="/jadwal" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-950 font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 text-red-600" /> Daftar Donor
              </Link>
              <Link href="/stok-darah" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-medium rounded-full border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <Droplets className="w-5 h-5 text-gray-400" /> Cek Stok
              </Link>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 animate-bounce">
            <ChevronDown className="w-6 h-6" />
          </div>
        </section>

        {/* ── DATA SECTION (Clean White / Functional) ── */}
        {/* The hard cut to white provides extreme contrast and perfect readability for data */}
        <section className="py-24 bg-white relative z-20 rounded-t-[3rem] -mt-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Urgent Alert (If Any) */}
            {hasUrgency && (
              <div className="mb-16">
                <div className="bg-red-50 border border-red-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">Stok Darah Kritis</h3>
                      <p className="text-gray-600 font-medium">
                        Saat ini terdapat <strong className="text-red-700">{s?.total_stok_kritis} golongan darah</strong> kosong. Pendonor sangat dibutuhkan hari ini.
                      </p>
                    </div>
                  </div>
                  <Link href="/stok-darah" className="flex-shrink-0 px-6 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-colors shadow-md shadow-red-600/20">
                    Bantu Sekarang
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-24">
              {[
                { value: s?.total_stok ?? '—', label: 'Kantong Tersedia', icon: Droplets, color: 'text-red-600', bg: 'bg-red-50' },
                { value: s?.lokasi_aktif ?? '—', label: 'Lokasi Aktif', icon: MapPin, color: 'text-gray-900', bg: 'bg-gray-50' },
                { value: s?.jadwal_aktif ?? '—', label: 'Jadwal Bulan Ini', icon: Calendar, color: 'text-gray-900', bg: 'bg-gray-50' },
              ].map(stat => (
                <div key={stat.label} className="p-6 rounded-3xl border border-gray-100 hover:border-gray-200 transition-colors flex items-center gap-5">
                  <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</div>
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Jadwal Terdekat */}
            <div className="flex flex-col sm:flex-row items-end justify-between mb-10 gap-4">
              <div>
                <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2">Jadwal Donor</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Kegiatan Terdekat</h2>
              </div>
              <Link href="/jadwal" className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                Lihat Semua Jadwal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {upcomingSchedules.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingSchedules.map(s => (
                  <ScheduleCard key={s.id} schedule={s} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Jadwal</h3>
                <p className="text-gray-500 font-medium">Jadwal donor aktif untuk bulan ini belum tersedia.</p>
              </div>
            )}
            
            <div className="text-center mt-8 sm:hidden">
              <Link href="/jadwal" className="inline-flex items-center gap-2 text-sm font-bold text-red-600">
                Lihat Semua Jadwal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </section>

        {/* ── ARTIKEL TERBARU ── */}
        {featuredArticles.length > 0 && (
          <section className="py-24 bg-[#FAFAFA] border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-end justify-between mb-10 gap-4">
                <div>
                  <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2">Edukasi & Info</p>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Artikel Terbaru</h2>
                </div>
                <Link href="/artikel" className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                  Semua Artikel <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredArticles.map(a => (
                  <Link key={a.id} href={`/artikel/${a.slug}`} className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="aspect-video w-full overflow-hidden bg-gray-100">
                      {a.gambar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.gambar} alt={a.gambar_alt ?? a.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                          <Droplets className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 sm:p-8 flex flex-col flex-1">
                      <span className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">
                        {a.kategori_nama}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 leading-snug mb-3 group-hover:text-red-700 transition-colors line-clamp-2">
                        {a.judul}
                      </h3>
                      {a.excerpt && (
                        <p className="text-gray-500 text-sm line-clamp-2 mb-6 flex-1 font-medium leading-relaxed">{a.excerpt}</p>
                      )}
                      <div className="text-sm font-semibold text-gray-400 mt-auto">{formatDate(a.published_at)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
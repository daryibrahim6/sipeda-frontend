import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Droplets, MapPin, Calendar, AlertTriangle,
  ArrowRight, Phone, Heart, Users, Clock,
  ChevronRight,
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

        {/* ── HERO ── */}
        <section className="relative bg-gray-950 text-white overflow-hidden min-h-[85vh] flex items-center">
          {/* Background pattern */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(220,38,38,0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(220,38,38,0.08) 0%, transparent 40%),
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: 'auto, auto, 60px 60px, 60px 60px',
            }}
          />

          {/* Urgency pulse — ditampilkan jika ada stok kritis */}
          {hasUrgency && (
            <div className="absolute top-8 right-8 hidden lg:flex items-center gap-3 bg-red-900/50 border border-red-500/40 rounded-2xl px-5 py-3 backdrop-blur-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <div>
                <div className="text-xs font-bold text-red-300 uppercase tracking-wide">Stok Kritis</div>
                <div className="text-sm text-white font-semibold">{s?.total_stok_kritis} golongan membutuhkan pendonor</div>
              </div>
              <Link href="/stok-darah" className="ml-2 text-xs text-red-300 hover:text-white transition-colors underline">
                Cek →
              </Link>
            </div>
          )}

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 w-full">
            <div className="max-w-3xl">
              {/* Status badge */}
              <div className="inline-flex items-center gap-2.5 bg-white/8 border border-white/12 rounded-full px-4 py-1.5 text-xs font-medium mb-8 text-gray-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                Layanan aktif · PMI Kabupaten Indramayu
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight mb-6">
                Satu Tetes Darah{' '}
                <br />
                <span className="text-red-400">Tiga Nyawa</span>{' '}
                Terselamatkan
              </h1>

              <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-xl">
                Temukan lokasi donor terdekat, pantau stok darah real-time, dan daftar jadwal
                donor — semuanya dalam satu platform untuk Kabupaten Indramayu.
              </p>

              <div className="flex flex-wrap gap-3 mb-12">
                <Link href="/jadwal"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 active:bg-red-800 transition-colors shadow-lg shadow-red-600/25">
                  <Heart className="w-4 h-4" />
                  Daftar Donor Sekarang
                </Link>
                <Link href="/peta"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 border border-white/15 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm">
                  <MapPin className="w-4 h-4" />
                  Temukan Lokasi
                </Link>
                <Link href="/stok-darah"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 border border-white/15 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm">
                  <Droplets className="w-4 h-4" />
                  Cek Stok Darah
                </Link>
              </div>

              {/* Quick impact stats */}
              <div className="flex flex-wrap gap-8">
                {[
                  { value: s?.total_stok ?? '—', label: 'Kantong tersedia', icon: Droplets },
                  { value: s?.lokasi_aktif ?? '—', label: 'Lokasi aktif', icon: MapPin },
                  { value: s?.jadwal_aktif ?? '—', label: 'Jadwal bulan ini', icon: Calendar },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center gap-2.5">
                    <stat.icon className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <div>
                      <div className="text-xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Stok Kritis Alert — ditampilkan jika ada yang kritis/kosong ── */}
        {hasUrgency && (
          <section className="bg-red-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      Stok Darah Kritis — Pendonor Dibutuhkan Segera
                    </div>
                    <div className="text-red-100 text-xs mt-0.5">
                      {s?.total_stok_kritis} golongan darah dalam kondisi kritis atau kosong saat ini.
                    </div>
                  </div>
                </div>
                <Link href="/stok-darah"
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-white text-red-700 font-semibold text-sm rounded-xl hover:bg-red-50 transition-colors">
                  Lihat Detail <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Cara Kerja ── */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2">
                Mudah & Cepat
              </p>
              <h2 className="text-3xl font-bold text-gray-900">Donor Darah dalam 4 Langkah</h2>
              <p className="text-gray-500 mt-2 max-w-lg mx-auto">
                Prosesnya sederhana. Persiapan 10 menit, dampaknya bisa menyelamatkan nyawa.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
              {/* Connector */}
              <div className="hidden lg:block absolute top-9 left-[14%] right-[14%] h-px bg-gradient-to-r from-transparent via-red-200 to-transparent z-0" />

              {[
                {
                  num: '01', icon: MapPin,    color: 'from-red-50 to-orange-50',
                  title: 'Temukan Lokasi',
                  desc: 'Buka peta interaktif, cari lokasi donor terdekat lengkap dengan info stok darah.',
                },
                {
                  num: '02', icon: Calendar,  color: 'from-rose-50 to-red-50',
                  title: 'Pilih Jadwal',
                  desc: 'Lihat ketersediaan jadwal dan pilih waktu yang cocok. Kuota ditampilkan real-time.',
                },
                {
                  num: '03', icon: Heart,     color: 'from-red-50 to-rose-50',
                  title: 'Daftar Online',
                  desc: 'Isi form pendaftaran singkat. Kode registrasi langsung dikirim ke WhatsApp kamu.',
                },
                {
                  num: '04', icon: Droplets,  color: 'from-rose-50 to-pink-50',
                  title: 'Datang & Donor',
                  desc: 'Tunjukkan kode, jalani pemeriksaan awal, dan donorkan darah. Proses ±45 menit.',
                },
              ].map((step, i) => (
                <div key={step.num} className="relative z-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${step.color} rounded-2xl mb-4`}>
                    <step.icon className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="text-xs font-extrabold text-red-400/60 font-mono mb-1 tracking-widest">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
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
                <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-1">
                  Jadwal Donor
                </p>
                <h2 className="text-3xl font-bold text-gray-900">Kegiatan Terdekat</h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Daftar sebelum kuota penuh — slot sangat terbatas
                </p>
              </div>
              <Link href="/jadwal"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
                Lihat semua <ChevronRight className="w-4 h-4" />
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
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
                Lihat semua jadwal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Kenapa Donor Darah Penting — Edukasi singkat ── */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2">
                  Dampak Nyata
                </p>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Satu Donor, Tiga Nyawa
                </h2>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Satu kantong darah yang kamu donorkan dapat diproses menjadi tiga komponen berbeda —
                  sel darah merah, trombosit, dan plasma — yang masing-masing dapat menyelamatkan
                  satu nyawa berbeda.
                </p>
                <p className="text-gray-500 leading-relaxed mb-8">
                  Di Kabupaten Indramayu, kebutuhan darah mencapai ratusan kantong per bulan.
                  PMI Indramayu mengandalkan pendonor sukarela untuk memenuhi kebutuhan ini.
                </p>
                <Link href="/syarat-donor"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
                  Pelajari syarat dan proses donor <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '3',   unit: 'nyawa',   label: 'bisa diselamatkan dari 1 kantong darah', icon: Heart, color: 'bg-red-600 text-white' },
                  { value: '45',  unit: 'menit',   label: 'total waktu yang dibutuhkan untuk donor', icon: Clock, color: 'bg-gray-900 text-white' },
                  { value: '56',  unit: 'hari',    label: 'jeda minimal antar donor (aman & sehat)', icon: Calendar, color: 'bg-gray-100 text-gray-900' },
                  { value: '17+', unit: 'tahun',   label: 'usia minimal untuk mulai mendonorkan darah', icon: Users, color: 'bg-red-50 text-red-900' },
                ].map(item => (
                  <div key={item.label} className={`rounded-2xl p-6 ${item.color}`}>
                    <div className="text-3xl font-extrabold mb-0.5">
                      {item.value}
                      <span className="text-lg font-bold ml-1 opacity-70">{item.unit}</span>
                    </div>
                    <div className="text-xs leading-snug opacity-70 mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Emergency CTA ── */}
        <section className="py-16 bg-gray-950 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Emergency */}
              <div className="bg-red-600 rounded-2xl p-8">
                <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mb-5">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Butuh Darah Mendesak?</h3>
                <p className="text-red-100 text-sm leading-relaxed mb-6">
                  Cek ketersediaan stok atau langsung hubungi PMI Indramayu.
                  Layanan darurat tersedia 24 jam.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/stok-darah"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-red-700 font-semibold rounded-xl hover:bg-red-50 transition-colors text-sm">
                    <Droplets className="w-4 h-4" />
                    Cek Stok
                  </Link>
                  <a href="tel:+622342271648"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-700 border border-white/20 text-white font-semibold rounded-xl hover:bg-red-800 transition-colors text-sm">
                    <Phone className="w-4 h-4" />
                    Telepon PMI
                  </a>
                </div>
              </div>

              {/* Donate CTA */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center mb-5">
                  <Heart className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Jadilah Pendonor Rutin</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Pendonor rutin adalah tulang punggung ketersediaan darah. Donor 3–4 kali
                  setahun sudah cukup untuk membuat perbedaan besar.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/jadwal"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors text-sm">
                    <Calendar className="w-4 h-4" />
                    Daftar Donor
                  </Link>
                  <Link href="/peta"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm">
                    <MapPin className="w-4 h-4" />
                    Cari Lokasi
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Artikel ── */}
        {featuredArticles.length > 0 && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-1">
                    Edukasi & Info
                  </p>
                  <h2 className="text-3xl font-bold text-gray-900">Artikel Terbaru</h2>
                </div>
                <Link href="/artikel"
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
                  Lihat semua <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredArticles.map(a => (
                  <Link key={a.id} href={`/artikel/${a.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="aspect-video overflow-hidden">
                      {a.gambar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.gambar} alt={a.gambar_alt ?? a.judul}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                          <Droplets className="w-10 h-10 text-red-200" />
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
            </div>
          </section>
        )}

      </main>
</>
  );
}
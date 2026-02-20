// src/app/tentang/page.tsx

import type { Metadata } from 'next';
import { Droplets, MapPin, Phone, Mail, Clock, Users, Heart, Shield } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tentang SIPEDA',
  description: 'Tentang Sistem Informasi Pendonoran Darah (SIPEDA) — platform digital PMI Kabupaten Indramayu.',
};

const milestones = [
  { year: '2023', event: 'Inisiasi pengembangan SIPEDA sebagai proyek digitalisasi PMI Indramayu' },
  { year: '2024', event: 'Peluncuran versi pertama dengan fitur jadwal dan stok darah' },
  { year: '2025', event: 'Integrasi peta interaktif dan sistem registrasi online' },
  { year: '2026', event: 'Pengembangan dashboard admin dan fitur analitik' },
];

const values = [
  {
    icon: Heart,
    title: 'Kemanusiaan',
    desc: 'Donor darah adalah tindakan kemanusiaan tertinggi. SIPEDA hadir untuk memudahkan aksi mulia ini.',
  },
  {
    icon: Shield,
    title: 'Transparansi',
    desc: 'Informasi stok darah, jadwal, dan lokasi tersedia secara real-time dan dapat diakses publik.',
  },
  {
    icon: Users,
    title: 'Inklusif',
    desc: 'Platform dirancang untuk semua kalangan — dari pendonor baru hingga pendonor rutin.',
  },
];

const team = [
  { name: 'dr. Slamet Riyadi', role: 'Kepala UDD PMI Indramayu', initial: 'SR' },
  { name: 'dr. Ani Rahayu', role: 'Dokter Koordinator Donor', initial: 'AR' },
  { name: 'Budi Santoso, S.Kom', role: 'Koordinator Sistem & Data', initial: 'BS' },
];

export default function TentangPage() {
  return (
    <>
      <Navbar />
      <main id="main">

        {/* ── Hero ── */}
        <section className="bg-gray-950 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-xs font-medium mb-6 text-gray-300">
                <Droplets className="w-3.5 h-3.5 text-red-400" />
                PMI Kabupaten Indramayu
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
                Tentang <span className="text-red-400">SIPEDA</span>
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed">
                Sistem Informasi Pendonoran Darah Indramayu — platform digital yang menghubungkan
                pendonor, penerima darah, dan fasilitas kesehatan di Kabupaten Indramayu.
              </p>
            </div>
          </div>
        </section>

        {/* ── Tentang Platform ── */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-2">
                  Tentang Platform
                </p>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Mengapa SIPEDA Dibuat?
                </h2>
                <div className="prose prose-gray max-w-none text-gray-600 space-y-4">
                  <p>
                    SIPEDA lahir dari kebutuhan nyata di lapangan: calon pendonor kesulitan
                    menemukan jadwal donor yang sesuai, keluarga pasien kebingungan mencari
                    ketersediaan darah di saat darurat, dan PMI kewalahan mengelola data
                    secara manual.
                  </p>
                  <p>
                    Platform ini menyederhanakan ekosistem donor darah di Kabupaten Indramayu
                    menjadi satu pintu digital — dari pencarian lokasi, pengecekan stok,
                    pendaftaran jadwal, hingga pemantauan data oleh admin PMI.
                  </p>
                  <p>
                    Dikembangkan bersama PMI Kabupaten Indramayu, SIPEDA dirancang dengan
                    prinsip mobile-first, aksesibel, dan mudah dioperasikan oleh siapa pun.
                  </p>
                </div>
              </div>

              {/* Stats visual */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '5+', label: 'Lokasi Aktif', icon: MapPin },
                  { value: '300+', label: 'Stok Kantong Darah', icon: Droplets },
                  { value: '24/7', label: 'Akses Informasi', icon: Clock },
                  { value: '1000+', label: 'Pendonor Terdaftar', icon: Users },
                ].map(item => (
                  <div key={item.label}
                    className="bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{item.value}</div>
                    <div className="text-sm text-gray-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Nilai ── */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-2">
                Nilai Kami
              </p>
              <h2 className="text-3xl font-bold text-gray-900">Apa yang Kami Percaya</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map(v => (
                <div key={v.title}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 rounded-2xl mb-5">
                    <v.icon className="w-7 h-7 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-2">
                Perjalanan
              </p>
              <h2 className="text-3xl font-bold text-gray-900">Milestone SIPEDA</h2>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
              <div className="space-y-8">
                {milestones.map((m, i) => (
                  <div key={i} className="flex gap-6 pl-10 relative">
                    <div className="absolute left-0 top-1 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-red-600 mb-1">{m.year}</div>
                      <p className="text-gray-600 leading-relaxed">{m.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Tim ── */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-2">
                Tim
              </p>
              <h2 className="text-3xl font-bold text-gray-900">Di Balik SIPEDA</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {team.map(member => (
                <div key={member.name}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center w-56 hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {member.initial}
                  </div>
                  <div className="font-semibold text-gray-900 text-sm leading-snug">{member.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{member.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Kontak ── */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-2">
                  Kontak
                </p>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Hubungi Kami</h2>
                <div className="space-y-4">
                  {[
                    { icon: MapPin, label: 'Alamat', value: 'Jl. DI. Panjaitan No. 54, Indramayu, Jawa Barat 45211' },
                    { icon: Phone, label: 'Telepon', value: '(0234) 271648' },
                    { icon: Mail, label: 'Email', value: 'pmi.indramayu@gmail.com' },
                    { icon: Clock, label: 'Jam Layanan', value: 'Senin–Sabtu, 07:30–15:00 WIB' },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <item.icon className="w-4.5 h-4.5 text-red-600" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{item.label}</div>
                        <div className="text-gray-700 font-medium">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA cards */}
              <div className="space-y-4">
                <div className="bg-red-600 rounded-2xl p-6 text-white">
                  <Droplets className="w-8 h-8 mb-4 text-red-200" />
                  <h3 className="text-xl font-bold mb-2">Siap Mendonor?</h3>
                  <p className="text-red-100 text-sm mb-4">
                    Cek jadwal donor terdekat dan daftar sekarang. Kuota terbatas!
                  </p>
                  <Link href="/jadwal"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-red-700 font-semibold rounded-xl hover:bg-red-50 transition-colors text-sm">
                    Lihat Jadwal
                  </Link>
                </div>
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                  <MapPin className="w-8 h-8 mb-4 text-gray-400" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Temukan Lokasi Terdekat</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Gunakan peta interaktif untuk menemukan lokasi donor dan cek ketersediaan stok darah.
                  </p>
                  <Link href="/peta"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors text-sm">
                    Buka Peta
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
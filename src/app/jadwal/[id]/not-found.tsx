// src/app/jadwal/[id]/not-found.tsx

import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function JadwalNotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Jadwal Tidak Ditemukan</h1>
          <p className="text-gray-500 mb-8">
            Jadwal yang kamu cari tidak tersedia atau sudah dihapus.
            Cek daftar jadwal aktif berikut.
          </p>
          <Link href="/jadwal"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Lihat Semua Jadwal
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
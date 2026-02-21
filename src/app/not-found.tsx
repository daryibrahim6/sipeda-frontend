import Link from 'next/link';
import { Droplets, Home, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Halaman Tidak Ditemukan',
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-12">
                <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-xl">SIPEDA</span>
            </div>

            {/* 404 */}
            <div className="relative mb-6">
                <div className="text-[120px] font-black text-white/5 leading-none select-none">404</div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-7xl font-black text-red-600 leading-none">404</div>
                </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-3">Halaman Tidak Ditemukan</h1>
            <p className="text-gray-400 mb-10 max-w-sm">
                Halaman yang kamu cari tidak ada, sudah dipindahkan, atau URL salah ketik.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
                    <Home className="w-4 h-4" />
                    Ke Beranda
                </Link>
                <Link href="/jadwal"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Lihat Jadwal Donor
                </Link>
            </div>

            <div className="mt-16 text-xs text-gray-700">
                © {new Date().getFullYear()} SIPEDA · PMI Kabupaten Indramayu
            </div>
        </div>
    );
}

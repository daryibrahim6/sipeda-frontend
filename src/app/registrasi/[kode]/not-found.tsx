import Link from 'next/link';
import { SearchX, Home } from 'lucide-react';

export default function RegistrasiNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <SearchX className="w-8 h-8 text-amber-600" />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Registrasi Tidak Ditemukan</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        Kode registrasi yang kamu masukkan tidak valid atau telah dihapus.
      </p>
      <Link href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors text-sm">
        <Home className="w-4 h-4" />
        Ke Beranda
      </Link>
    </div>
  );
}

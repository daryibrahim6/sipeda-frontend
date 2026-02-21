'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';

export default function RegistrasiPage() {
    const router = useRouter();
    const [kode, setKode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = kode.trim().toUpperCase();
        if (!trimmed) return;

        setLoading(true);
        setError('');

        // Navigasi ke halaman detail dengan kode
        router.push(`/registrasi/${encodeURIComponent(trimmed)}`);
    }

    return (
        <>
<main id="main" className="min-h-[70vh] flex items-center justify-center px-4 py-20">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-4">
                            <Search className="w-8 h-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cek Status Registrasi</h1>
                        <p className="text-gray-500 text-sm">
                            Masukkan kode registrasi yang kamu terima saat mendaftar donor.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <label htmlFor="kode" className="block text-sm font-semibold text-gray-700 mb-2">
                            Kode Registrasi
                        </label>
                        <input
                            id="kode"
                            type="text"
                            value={kode}
                            onChange={e => setKode(e.target.value.toUpperCase())}
                            placeholder="Contoh: REG-2025-XXXXXX"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all uppercase mb-4"
                        />

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !kode.trim()}
                            className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Mencari...</>
                                : <><Search className="w-4 h-4" /> Cek Status</>
                            }
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400 mt-4">
                        Kode registrasi dikirim saat kamu mendaftar jadwal donor. Format: REG-YYYY-XXXXXX
                    </p>
                </div>
            </main>
</>
    );
}

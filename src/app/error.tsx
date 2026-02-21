'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to monitoring service in production
        console.error('[SIPEDA Error]', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center px-4 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">Terjadi Kesalahan</h1>
            <p className="text-gray-500 mb-2 max-w-md">
                Maaf, ada masalah saat memuat halaman ini. Ini bisa disebabkan oleh koneksi internet atau masalah server sementara.
            </p>
            {error.digest && (
                <p className="text-xs text-gray-400 font-mono mb-8">Error ID: {error.digest}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={reset}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    Coba Lagi
                </button>
                <Link href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                    <Home className="w-4 h-4" />
                    Ke Beranda
                </Link>
            </div>
        </div>
    );
}

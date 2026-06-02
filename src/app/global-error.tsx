'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Error ini muncul di Vercel Error Tracking dashboard jika fitur diaktifkan
        console.error('[SIPEDA GlobalError]', error);
    }, [error]);

    return (
        <html lang="id">
            <body>
                <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                        Terjadi Kesalahan Kritis
                    </h1>
                    <p style={{ color: '#6b7280', maxWidth: '28rem', marginBottom: '1.5rem' }}>
                        Maaf, aplikasi mengalami masalah. Tim kami sudah mendapat notifikasi.
                    </p>
                    {error.digest && (
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace', marginBottom: '1.5rem' }}>
                            Error ID: {error.digest}
                        </p>
                    )}
                    <button
                        onClick={reset}
                        style={{ padding: '0.75rem 1.5rem', background: '#dc2626', color: 'white', fontWeight: 600, border: 'none', borderRadius: '0.75rem', cursor: 'pointer' }}
                    >
                        Coba Lagi
                    </button>
                </div>
            </body>
        </html>
    );
}

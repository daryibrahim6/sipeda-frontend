'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Droplets, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { loginUnified } from '@/lib/auth';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const isExpired = searchParams.get('expired') === '1';

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');
        try {
            const result = await loginUnified(email, password);

            // Role-based redirect
            if (result.user.role === 'petugas_lapangan') {
                router.push('/petugas');
            } else {
                router.push('/admin/dashboard');
            }
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Login gagal. Coba lagi.');
            setStatus('error');
        }
    }

    return (
        <>
            {isExpired && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm rounded-xl px-4 py-3 mb-5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Sesi kamu sudah habis. Silakan login kembali.
                </div>
            )}

            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                        Alamat Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="email@sipeda.id"
                        autoComplete="email"
                        className="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                        Kata Sandi
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPw ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 pr-11 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                            {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-4 bg-gray-900 hover:bg-red-600 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-sm hover:shadow-md"
                >
                    {status === 'loading'
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengautentikasi...</>
                        : 'Masuk ke Sistem'
                    }
                </button>
            </form>
        </>
    );
}

export default function UnifiedLoginPage() {
    return (
        <div className="min-h-screen flex bg-white">
            
            {/* Kiri: Form Login */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm">
                    {/* Logo Mobile */}
                    <div className="lg:hidden text-center mb-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600 rounded-2xl mb-3 shadow-lg shadow-red-600/30">
                            <Droplets className="w-6 h-6 text-white fill-white" />
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">SIPEDA</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Selamat Datang</h2>
                        <p className="text-sm text-gray-500 mt-2 font-medium">Masuk ke sistem operasional Admin & Petugas.</p>
                    </div>

                    <Suspense fallback={
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                        </div>
                    }>
                        <LoginForm />
                    </Suspense>

                    <p className="text-center text-xs text-gray-500 font-medium mt-8">
                        Akses sistem dibatasi. Hubungi PMI Indramayu jika belum memiliki kredensial.
                    </p>
                </div>
            </div>

            {/* Kanan: Panel Hero Premium (hanya terlihat di layar besar) */}
            <div className="hidden lg:flex flex-1 relative bg-gray-950 items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-red-950 via-gray-950 to-black"></div>
                <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center p-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-600/20 mb-8 border border-white/10">
                        <Droplets className="w-12 h-12 text-white fill-white" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">SIPEDA Core</h2>
                    <p className="text-lg text-gray-400 max-w-md">
                        Sistem Informasi Pendonoran Darah Terpadu. Akses eksklusif untuk staf PMI dan fasilitas kesehatan Indramayu.
                    </p>
                </div>
            </div>
            
        </div>
    );
}

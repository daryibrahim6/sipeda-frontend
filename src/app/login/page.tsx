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

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1.5">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="email@sipeda.id"
                        autoComplete="email"
                        className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1.5">
                        Password
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
                            className="w-full px-4 py-3 pr-11 bg-gray-800 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                            aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2"
                >
                    {status === 'loading'
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Masuk...</>
                        : 'Masuk'
                    }
                </button>
            </form>
        </>
    );
}

export default function UnifiedLoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-2xl mb-4 shadow-lg shadow-red-600/30">
                        <Droplets className="w-7 h-7 text-white fill-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">SIPEDA</h1>
                    <p className="text-sm text-gray-500 mt-1">Sistem Informasi Pendonoran Darah</p>
                </div>

                {/* Card */}
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-1">Masuk</h2>
                    <p className="text-xs text-gray-500 mb-5">Admin & Petugas Lapangan</p>

                    <Suspense fallback={
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                        </div>
                    }>
                        <LoginForm />
                    </Suspense>
                </div>

                <p className="text-center text-xs text-gray-600 mt-6">
                    Akun dibuat oleh admin. Hubungi admin PMI jika belum punya akun.
                </p>
            </div>
        </div>
    );
}

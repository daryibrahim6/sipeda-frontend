'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginPetugas } from '@/lib/auth';
import { Droplets, Loader2 } from 'lucide-react';

export default function PetugasLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await loginPetugas(email, password);
            router.push('/petugas');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login gagal');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-2xl mb-4 shadow-lg shadow-red-600/30">
                        <Droplets className="w-7 h-7 text-white fill-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">SIPEDA</h1>
                    <p className="text-sm text-gray-500 mt-1">Petugas Lapangan — Pencatatan Donor</p>
                </div>

                {/* Card */}
                <div className="bg-gray-900 rounded-2xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-5">Masuk Petugas</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="email@sipeda.id"
                                className="w-full px-3 py-2.5 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full px-3 py-2.5 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Masuk...</> : 'Masuk'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-gray-600 mt-6">
                    Akun petugas dibuat oleh admin. Hubungi admin jika belum punya akun.
                </p>
            </div>
        </div>
    );
}

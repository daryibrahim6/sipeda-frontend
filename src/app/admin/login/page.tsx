'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Droplets, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { loginAdmin } from '@/lib/auth';

// ─── Inner component ──────────────────────────────────────────────────────────
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
      await loginAdmin(email, password);
      // Set marker cookie agar middleware tahu session aktif
      // (Supabase v2 pakai localStorage, bukan cookie, jadi middleware perlu cookie terpisah)
      document.cookie = 'sipeda_admin=1; path=/; max-age=86400; SameSite=Lax';
      router.push('/admin/dashboard');
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
          Sesi kamu telah berakhir. Silakan login kembali.
        </div>
      )}

      <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@sipeda.id"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-11 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-600/20"
          >
            {status === 'loading'
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Masuk...</>
              : 'Masuk ke Dashboard'
            }
          </button>
        </form>
      </div>
    </>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-2xl mb-4 shadow-lg shadow-red-600/30">
            <Droplets className="w-7 h-7 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SIPEDA Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Sistem Informasi Pendonoran Darah</p>
        </div>

        <Suspense fallback={
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 animate-pulse">
            <div className="h-10 bg-white/10 rounded-xl mb-4" />
            <div className="h-10 bg-white/10 rounded-xl mb-4" />
            <div className="h-12 bg-red-900/30 rounded-xl" />
          </div>
        }>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-gray-700 mt-6">
          © {new Date().getFullYear()} SIPEDA — PMI Kabupaten Indramayu
        </p>
      </div>
    </div>
  );
}
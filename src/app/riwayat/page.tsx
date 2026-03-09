'use client';

import { useState } from 'react';
import {
    Search, Loader2, Calendar, MapPin, Clock, CheckCircle2,
    XCircle, AlertTriangle, History, Droplets, ArrowLeft, Phone, Hash, MessageCircle, Bell,
} from 'lucide-react';
import { lookupDonorHistory, type DonorHistoryResult } from '@/lib/api';
import DonorCard from '@/components/donor/DonorCard';
import Link from 'next/link';

// ─── Status helpers ───────────────────────────────────────────────────────────

function statusBadge(status: string, kehadiran: string | null) {
    if (kehadiran === 'hadir') return { label: 'Hadir ✓', cls: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 };
    if (kehadiran === 'tidak_hadir') return { label: 'Tidak Hadir', cls: 'bg-red-50 text-red-700 border-red-200', icon: XCircle };
    if (status === 'dibatalkan') return { label: 'Dibatalkan', cls: 'bg-gray-50 text-gray-500 border-gray-200', icon: XCircle };
    if (status === 'confirmed') return { label: 'Terkonfirmasi', cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2 };
    return { label: 'Menunggu', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle };
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RiwayatPage() {
    const [telepon, setTelepon] = useState('');
    const [kode, setKode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState<DonorHistoryResult | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!telepon.trim() || !kode.trim()) return;
        setLoading(true);
        setError('');
        setData(null);
        try {
            const result = await lookupDonorHistory(telepon.trim(), kode.trim());
            if (!result) {
                setError('Data tidak ditemukan. Pastikan nomor telepon dan kode registrasi benar.');
            } else {
                setData(result);
            }
        } catch {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    }

    function handleBack() {
        setData(null);
        setError('');
    }

    return (
        <main id="main">
            {/* Hero */}
            <section className="bg-gray-950 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">Riwayat</p>
                    <h1 className="text-4xl font-extrabold mb-3">Riwayat Donor Anda</h1>
                    <p className="text-gray-400 max-w-xl">
                        Lihat semua riwayat registrasi dan kegiatan donor darah Anda di SIPEDA.
                        Masukkan nomor telepon dan kode registrasi untuk verifikasi.
                    </p>
                </div>
            </section>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {!data ? (
                    <>
                        {/* Login Form */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                                    <History className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900">Cek Riwayat Donor</h2>
                                    <p className="text-xs text-gray-400">Verifikasi identitas Anda untuk melihat riwayat</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        <Phone className="w-3.5 h-3.5 inline mr-1.5" />
                                        Nomor Telepon
                                    </label>
                                    <input
                                        type="tel"
                                        value={telepon}
                                        onChange={e => setTelepon(e.target.value)}
                                        placeholder="08xxxxxxxxxx"
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Nomor yang Anda gunakan saat registrasi donor.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        <Hash className="w-3.5 h-3.5 inline mr-1.5" />
                                        Kode Registrasi
                                    </label>
                                    <input
                                        type="text"
                                        value={kode}
                                        onChange={e => setKode(e.target.value.toUpperCase())}
                                        placeholder="REG-2026-XXXXX"
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Kode yang Anda terima saat mendaftar. Gunakan kode dari registrasi manapun.</p>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                                        <XCircle className="w-4 h-4 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !telepon.trim() || !kode.trim()}
                                    className="w-full py-3 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                    {loading ? 'Mencari...' : 'Lihat Riwayat'}
                                </button>
                            </form>
                        </div>

                        {/* Help */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-400">
                                Belum pernah mendaftar?{' '}
                                <Link href="/jadwal" className="text-red-600 font-medium hover:underline">
                                    Daftar donor sekarang
                                </Link>
                            </p>
                        </div>
                    </>
                ) : (
                    /* ── History View ── */
                    <div className="space-y-6">
                        {/* Back button */}
                        <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Cari lagi
                        </button>

                        {/* Profile card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Droplets className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-bold text-gray-900">{data.nama}</h2>
                                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Phone className="w-3.5 h-3.5" />
                                            {data.telepon}
                                        </span>
                                        <span className="font-semibold text-red-600">{data.golongan_darah}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats row */}
                            <div className="grid grid-cols-2 gap-3 mt-5">
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold text-gray-900">{data.registrasi.length}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">Total Registrasi</div>
                                </div>
                                <div className="bg-green-50 rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold text-green-700">{data.total_donor_berhasil}</div>
                                    <div className="text-xs text-green-600 mt-0.5">Donor Berhasil</div>
                                </div>
                            </div>
                        </div>

                        {/* Kartu Donor Digital */}
                        <DonorCard data={data} />

                        {/* Reminder 56 hari */}
                        {data.total_donor_berhasil > 0 && (() => {
                            const lastHadir = data.registrasi.find(r => r.status_kehadiran === 'hadir');
                            if (!lastHadir?.jadwal?.tanggal) return null;
                            const lastDate = new Date(lastHadir.jadwal.tanggal);
                            const nextDate = new Date(lastDate);
                            nextDate.setDate(nextDate.getDate() + 56);
                            const now = new Date();
                            const canDonate = now >= nextDate;
                            const nextStr = nextDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                            const waText = canDonate
                                ? `🩸 Hai, saya sudah bisa donor darah lagi! Donor terakhir saya pada ${formatDate(lastHadir.jadwal.tanggal)}.\n\nCek jadwal donor:\n🔗 https://sipeda.vercel.app/jadwal`
                                : `🩸 Reminder: Saya bisa donor darah lagi mulai ${nextStr}.\n\nCek jadwal donor nanti di:\n🔗 https://sipeda.vercel.app/jadwal`;
                            return (
                                <div className={`rounded-2xl border p-4 ${canDonate ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${canDonate ? 'bg-green-100' : 'bg-blue-100'}`}>
                                            <Bell className={`w-4 h-4 ${canDonate ? 'text-green-600' : 'text-blue-600'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-semibold ${canDonate ? 'text-green-800' : 'text-blue-800'}`}>
                                                {canDonate ? '🎉 Anda sudah bisa donor lagi!' : 'Donor berikutnya'}
                                            </div>
                                            <p className={`text-xs mt-0.5 ${canDonate ? 'text-green-600' : 'text-blue-600'}`}>
                                                {canDonate
                                                    ? `Jarak 56 hari sudah terlewati. Ayo daftar jadwal donor berikutnya!`
                                                    : `Anda bisa donor lagi mulai ${nextStr}`}
                                            </p>
                                            <a
                                                href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${canDonate
                                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                            >
                                                <MessageCircle className="w-3 h-3" />
                                                {canDonate ? 'Bagikan ke WhatsApp' : 'Ingatkan Saya via WhatsApp'}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Timeline */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
                                Riwayat Registrasi ({data.registrasi.length})
                            </h3>

                            {data.registrasi.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
                                    <History className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                                    <p className="text-sm">Belum ada riwayat registrasi.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {data.registrasi.map((r) => {
                                        const badge = statusBadge(r.status, r.status_kehadiran);
                                        const Icon = badge.icon;
                                        return (
                                            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-red-200 transition-colors">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-gray-900 text-sm">
                                                            {r.jadwal?.lokasi?.nama_lokasi ?? 'Lokasi tidak diketahui'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {r.jadwal?.lokasi?.kecamatan ?? '-'}
                                                        </div>
                                                    </div>
                                                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${badge.cls}`}>
                                                        <Icon className="w-3 h-3" />
                                                        {badge.label}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {r.jadwal ? formatDate(r.jadwal.tanggal) : '-'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {r.jadwal ? `${r.jadwal.waktu_mulai}–${r.jadwal.waktu_selesai}` : '-'}
                                                    </span>
                                                    <span className="font-mono text-gray-400">{r.kode_registrasi}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* CTA */}
                        <div className="text-center pt-4">
                            <Link href="/jadwal"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm">
                                <Droplets className="w-4 h-4" />
                                Daftar Donor Berikutnya
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Shield, CheckCircle2, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';

export default function HapusDataPage() {
    const [step, setStep] = useState<'info' | 'form' | 'done'>('info');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) return;

        setSending(true);
        setError('');

        try {
            const res = await fetch('/api/send-wa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: '628119198611',
                    message: `🔴 PERMINTAAN HAPUS DATA SIPEDA\nNama: ${name}\nNo. Telepon: ${phone}\n\nDimohon untuk menghubungi pendonor dan memproses penghapusan data sesuai UU PDP.`,
                }),
            });
            const data = await res.json();
            if (!data.success && data.error) throw new Error(data.error);
            setStep('done');
        } catch {
            setError('Gagal mengirim permintaan. Silakan hubungi PMI langsung.');
        } finally {
            setSending(false);
        }
    }

    if (step === 'done') {
        return (
            <main id="main" className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">Permintaan Terkirim</h1>
                    <p className="text-gray-500 text-sm mb-6">
                        Permintaan penghapusan data Anda telah diteruskan ke PMI Kabupaten Indramayu.
                        Tim kami akan menghubungi Anda dalam 3×24 jam untuk memproses permintaan Anda.
                    </p>
                    <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Beranda
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main id="main">
            <section className="bg-gray-950 text-white py-16">
                <div className="page-container">
                    <p className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">
                        Privasi Data
                    </p>
                    <h1 className="text-4xl font-extrabold mb-3">Hapus Data Pribadi</h1>
                    <p className="text-gray-400 max-w-xl">
                        Ajukan permintaan penghapusan data pribadi Anda dari sistem SIPEDA
                        sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP).
                    </p>
                </div>
            </section>

            <div className="page-container py-12">
                <div className="max-w-2xl mx-auto">
                    {step === 'info' && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-2xl border border-gray-200 p-8">
                                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
                                    <Trash2 className="w-7 h-7 text-red-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3">Hak Anda atas Penghapusan Data</h2>
                                <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                                    <p>
                                        Berdasarkan Undang-Undang Perlindungan Data Pribadi (UU PDP) No. 27 Tahun 2022,
                                        Anda berhak meminta penghapusan data pribadi yang kami simpan.
                                    </p>
                                    <p>
                                        Permintaan penghapusan akan diproses dalam waktu 3×24 jam kerja setelah identitas Anda terverifikasi.
                                        Data yang akan dihapus meliputi nama, nomor telepon, alamat, dan riwayat donor Anda.
                                    </p>
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="text-amber-800">Perhatian:</strong>
                                            <p className="text-amber-700 mt-1">
                                                Beberapa data mungkin tetap tersimpan secara anonim untuk keperluan statistik.
                                                Riwayat donor yang sudah diproses tidak dapat dihapus sepenuhnya karena
                                                merupakan catatan medis yang diwajibkan oleh peraturan.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 p-8">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="font-bold text-gray-900">Cara Lain</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Anda juga dapat menghubungi PMI Kabupaten Indramayu secara langsung untuk mengajukan permintaan penghapusan data:
                                </p>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p><strong>Telepon:</strong> 0811-919-8611</p>
                                    <p><strong>Email:</strong> pmi.indramayu@gmail.com</p>
                                    <p><strong>Alamat:</strong> Jl. DI. Panjaitan No. 54, Kabupaten Indramayu</p>
                                </div>
                            </div>

                            <button onClick={() => setStep('form')}
                                className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 active:scale-[0.99] transition-all">
                                Ajukan Permintaan Hapus Data
                            </button>

                            <div className="text-center">
                                <Link href="/" className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                                    ← Kembali ke Beranda
                                </Link>
                            </div>
                        </div>
                    )}

                    {step === 'form' && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-5">Formulir Permintaan Hapus Data</h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <input type="text" required value={name} onChange={e => setName(e.target.value)}
                                        placeholder="Sesuai KTP"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-transparent transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Nomor Telepon <span className="text-red-500">*</span>
                                    </label>
                                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                                        placeholder="08xxxxxxxxxx"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-transparent transition-all" />
                                </div>
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep('info')}
                                        className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                                        Batal
                                    </button>
                                    <button type="submit" disabled={sending || !name.trim() || !phone.trim()}
                                        className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        Kirim Permintaan
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

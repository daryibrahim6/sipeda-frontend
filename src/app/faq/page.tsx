import type { Metadata } from 'next';
import { ChevronDown, HelpCircle, Search, Phone, MessageCircle } from 'lucide-react';
import { getFAQ } from '@/lib/api';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'FAQ',
    description: 'Pertanyaan yang sering ditanyakan seputar donor darah, syarat, proses, dan stok darah di PMI Indramayu.',
};

export const revalidate = 3600;

const KATEGORI_LABEL: Record<string, string> = {
    umum: 'Umum',
    syarat: 'Syarat Donor',
    proses: 'Proses Donor',
    stok: 'Stok Darah',
    lainnya: 'Lainnya',
};

const KATEGORI_ORDER = ['umum', 'syarat', 'proses', 'stok', 'lainnya'];

// Static FAQ fallback jika DB kosong
const STATIC_FAQ = [
    { id: 1, kategori: 'umum', pertanyaan: 'Apa itu SIPEDA?', jawaban: 'SIPEDA (Sistem Informasi Pendonoran Darah) adalah platform digital PMI Kabupaten Indramayu yang memudahkan masyarakat menemukan lokasi donor darah, memantau stok darah, dan mendaftar jadwal donor secara online.' },
    { id: 2, kategori: 'syarat', pertanyaan: 'Berapa usia minimal pendonor darah?', jawaban: 'Pendonor darah harus berusia minimal 17 tahun dan maksimal 65 tahun. Pendonor yang berusia 17 tahun memerlukan izin tertulis dari orang tua.' },
    { id: 3, kategori: 'syarat', pertanyaan: 'Berapa berat badan minimal pendonor?', jawaban: 'Berat badan minimal pendonor adalah 45 kg untuk memastikan keamanan pendonor dan kualitas darah yang didonorkan.' },
    { id: 4, kategori: 'syarat', pertanyaan: 'Apakah saya bisa donor jika sedang sakit?', jawaban: 'Tidak. Pendonor harus dalam kondisi sehat pada saat melakukan donor darah. Jika sedang demam, flu, atau mengonsumsi obat-obatan tertentu, sebaiknya tunda donor hingga kondisi pulih.' },
    { id: 5, kategori: 'proses', pertanyaan: 'Berapa lama proses donor darah?', jawaban: 'Proses donor darah secara keseluruhan membutuhkan waktu sekitar 45 menit, termasuk pendaftaran, pemeriksaan kesehatan awal, proses pengambilan darah (±10 menit), dan istirahat setelah donor.' },
    { id: 6, kategori: 'proses', pertanyaan: 'Berapa kali bisa donor dalam setahun?', jawaban: 'Pendonor pria dapat mendonorkan darah maksimal 5 kali dalam setahun, sedangkan wanita maksimal 4 kali. Jeda minimal antar donor adalah 56 hari (8 minggu).' },
    { id: 7, kategori: 'stok', pertanyaan: 'Seberapa sering data stok darah diperbarui?', jawaban: 'Data stok darah diperbarui secara berkala oleh petugas PMI Indramayu. Untuk informasi paling akurat, khususnya dalam kondisi darurat, silakan hubungi langsung PMI Indramayu di 0234-271648.' },
    { id: 8, kategori: 'umum', pertanyaan: 'Bagaimana cara mendaftar jadwal donor?', jawaban: 'Pilih menu "Jadwal Donor", temukan jadwal yang sesuai, klik "Daftar Sekarang", isi form pendaftaran, dan kamu akan mendapat kode registrasi. Tunjukkan kode tersebut kepada petugas pada hari kegiatan.' },
];

export default async function FAQPage() {
    const rawFAQ = await getFAQ().catch(() => []);
    const faqs = rawFAQ.length > 0 ? rawFAQ : STATIC_FAQ;

    // Group by kategori
    const grouped: Record<string, typeof faqs> = {};
    for (const f of faqs) {
        if (!grouped[f.kategori]) grouped[f.kategori] = [];
        grouped[f.kategori].push(f);
    }

    const categories = KATEGORI_ORDER.filter(k => grouped[k]?.length > 0);

    return (
        <>
            <main id="main">
                {/* ── Header ── */}
                <section className="bg-gray-950 text-white py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600/20 border border-red-500/30 rounded-2xl mb-6">
                            <HelpCircle className="w-7 h-7 text-red-400" />
                        </div>
                        <p className="text-sm font-bold text-red-400 uppercase tracking-widest mb-3">
                            Pertanyaan Umum
                        </p>
                        <h1 className="text-4xl font-extrabold mb-4">FAQ</h1>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Temukan jawaban atas pertanyaan yang sering ditanyakan seputar donor darah di PMI Indramayu.
                        </p>

                        {/* Quick search hint */}
                        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
                            <Search className="w-4 h-4" />
                            <span>Tekan <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-xs text-gray-300">Ctrl+F</kbd> untuk mencari dengan cepat</span>
                        </div>
                    </div>
                </section>

                {/* ── FAQ content ── */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                    {/* Category tabs */}
                    <div className="flex flex-wrap gap-2 mb-10">
                        {categories.map(kat => (
                            <a key={kat} href={`#${kat}`}
                                className="px-4 py-1.5 text-sm font-medium rounded-full border border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors">
                                {KATEGORI_LABEL[kat] ?? kat}
                                <span className="ml-1.5 text-xs text-gray-400">({grouped[kat]?.length})</span>
                            </a>
                        ))}
                    </div>

                    {/* FAQ groups */}
                    <div className="space-y-12">
                        {categories.map(kat => (
                            <section key={kat} id={kat}>
                                <div className="flex items-center gap-3 mb-5">
                                    <h2 className="text-lg font-bold text-gray-900">
                                        {KATEGORI_LABEL[kat] ?? kat}
                                    </h2>
                                    <div className="h-px bg-gray-100 flex-1" />
                                </div>

                                <div className="space-y-3">
                                    {(grouped[kat] ?? []).map(faq => (
                                        <details key={faq.id}
                                            className="group bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:border-red-100 transition-colors">
                                            <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none select-none">
                                                <span className="font-semibold text-gray-900 text-sm leading-snug">
                                                    {faq.pertanyaan}
                                                </span>
                                                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180" />
                                            </summary>
                                            <div className="px-6 pb-5">
                                                <div className="h-px bg-gray-100 mb-4" />
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {faq.jawaban}
                                                </p>
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* ── Still have questions ── */}
                    <div className="mt-14 bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Masih punya pertanyaan?</h3>
                        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                            Tim PMI Indramayu siap membantu. Hubungi kami langsung melalui telepon atau WhatsApp.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a href="tel:+62234271648"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-xl hover:bg-red-700 transition-colors">
                                <Phone className="w-4 h-4" /> Telepon 0234-271648
                            </a>
                            <a href="https://wa.me/62234271648" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold text-sm rounded-xl hover:bg-green-700 transition-colors">
                                <MessageCircle className="w-4 h-4" /> WhatsApp PMI
                            </a>
                            <Link href="/tentang"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors">
                                Tentang SIPEDA
                            </Link>
                        </div>
                    </div>

                </div>
            </main>
        </>
    );
}

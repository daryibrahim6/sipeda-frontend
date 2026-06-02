import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronDown, HelpCircle, Search, Phone, MessageCircle } from 'lucide-react';
import { FAQ_LIST } from '@/lib/faq-data';
import { StructuredData } from '@/components/seo/StructuredData';

export const metadata: Metadata = {
    title: 'FAQ',
    description: 'Pertanyaan yang sering ditanyakan seputar donor darah, syarat, proses, dan stok darah di PMI Indramayu.',
};

const KATEGORI_LABEL: Record<string, string> = {
    umum: 'Umum',
    syarat: 'Syarat Donor',
    proses: 'Proses Donor',
    stok: 'Stok Darah',
    lainnya: 'Lainnya',
};

const KATEGORI_ORDER = ['umum', 'syarat', 'proses', 'stok', 'lainnya'];

export default async function FAQPage() {
    const faqs = FAQ_LIST;

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
                <StructuredData data={{
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: faqs.map(f => ({
                        '@type': 'Question',
                        name: f.pertanyaan,
                        acceptedAnswer: { '@type': 'Answer', text: f.jawaban },
                    })),
                }} />

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
                        <p className="text-[var(--color-text-muted)] max-w-xl mx-auto">
                            Temukan jawaban atas pertanyaan yang sering ditanyakan seputar donor darah di PMI Indramayu.
                        </p>

                        {/* Quick search hint */}
                        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]">
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
                                className="px-4 py-1.5 text-sm font-medium rounded-full border border-[var(--color-border-muted)] bg-white text-[var(--color-text-secondary)] hover:border-red-300 hover:text-[var(--color-primary)] active:scale-[0.95] transition-all">
                                {KATEGORI_LABEL[kat] ?? kat}
                                <span className="ml-1.5 text-xs text-[var(--color-text-muted)]">({grouped[kat]?.length})</span>
                            </a>
                        ))}
                    </div>

                    {/* FAQ groups */}
                    <div className="space-y-12">
                        {categories.map(kat => (
                            <section key={kat} id={kat}>
                                <div className="flex items-center gap-3 mb-5">
                                    <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                                        {KATEGORI_LABEL[kat] ?? kat}
                                    </h2>
                                    <div className="h-px bg-[var(--color-section-alt)] flex-1" />
                                </div>

                                <div className="space-y-3">
                                    {(grouped[kat] ?? []).map(faq => (
                                        <details key={faq.id}
                                            className="group bg-white border border-[var(--color-border-muted)] rounded-2xl shadow-[var(--shadow-card)] overflow-hidden hover:border-red-100 transition-colors">
                                            <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none select-none active:bg-[var(--color-primary-subtle)] transition-colors">
                                                <span className="font-semibold text-[var(--color-text-primary)] text-sm leading-snug">
                                                    {faq.pertanyaan}
                                                </span>
                                                <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0 transition-transform group-open:rotate-180" />
                                            </summary>
                                            <div className="px-6 pb-5">
                                                <div className="h-px bg-[var(--color-section-alt)] mb-4" />
                                                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
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
                    <div className="mt-14 bg-[var(--color-primary-subtle)] border border-red-100 rounded-2xl p-8 text-center">
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Masih punya pertanyaan?</h3>
                        <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
                            Tim PMI Indramayu siap membantu. Hubungi kami langsung melalui telepon atau WhatsApp.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a href="tel:+62234271648"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 text-white font-semibold text-sm rounded-xl hover:bg-red-700 active:scale-[0.97] transition-all">
                                <Phone className="w-4 h-4" /> Telepon 0234-271648
                            </a>
                            <a href="https://wa.me/62234271648" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold text-sm rounded-xl hover:bg-green-700 active:scale-[0.97] transition-all">
                                <MessageCircle className="w-4 h-4" /> WhatsApp PMI
                            </a>
                            <Link href="/tentang"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-[var(--color-border-muted)] text-[var(--color-text-secondary)] font-semibold text-sm rounded-xl hover:bg-[var(--color-section-alt)] active:scale-[0.97] transition-all">
                                Tentang SIPEDA
                            </Link>
                        </div>
                    </div>

                </div>
            </main>
        </>
    );
}

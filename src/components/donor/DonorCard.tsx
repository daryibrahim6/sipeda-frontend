'use client';

import { useRef, useState, useCallback } from 'react';
import { Download, MessageCircle, Droplets, Award, X } from 'lucide-react';
import type { DonorHistoryResult } from '@/lib/api';

type Props = { data: DonorHistoryResult };

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DonorCard({ data }: Props) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState('');

    const lastDonorDate = data.registrasi.find(r => r.status_kehadiran === 'hadir')?.jadwal?.tanggal;
    const donorId = data.registrasi[0]?.kode_registrasi ?? '—';

    const handleDownload = useCallback(async () => {
        const el = cardRef.current;
        if (!el) return;
        setDownloading(true);
        setDownloadError('');
        try {
            await document.fonts.ready;
            await new Promise(r => setTimeout(r, 200));

            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(el, {
                scale: 3,
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                allowTaint: true,
                removeContainer: true,
                onclone: (clonedDoc) => {
                    // Strip Tailwind CSS custom properties that use lab()/oklch()
                    // which html2canvas cannot parse
                    const root = clonedDoc.documentElement;
                    const styles = getComputedStyle(root);
                    const propsToRemove: string[] = [];
                    for (let i = 0; i < styles.length; i++) {
                        const prop = styles[i];
                        if (prop.startsWith('--')) {
                            const val = styles.getPropertyValue(prop);
                            if (val.includes('lab(') || val.includes('oklch(') || val.includes('oklab(')) {
                                propsToRemove.push(prop);
                            }
                        }
                    }
                    propsToRemove.forEach(p => root.style.removeProperty(p));
                },
            });

            // Use toBlob + createObjectURL — works reliably across browsers
            // without being blocked as a popup
            const blob = await new Promise<Blob | null>(resolve =>
                canvas.toBlob(resolve, 'image/png', 1.0)
            );
            if (!blob) throw new Error('Canvas toBlob returned null');

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `kartu-donor-${data.nama.replace(/\s+/g, '-').toLowerCase()}.png`;
            document.body.appendChild(a);
            a.click();
            // Cleanup after a short delay
            setTimeout(() => {
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);
        } catch (err) {
            console.error('html2canvas error:', err);
            setDownloadError('Gagal menyimpan kartu. Coba screenshot manual.');
        } finally {
            setDownloading(false);
        }
    }, [data.nama]);

    function handleShareWA() {
        const lines = [
            `🩸 *Kartu Donor Digital — SIPEDA*`,
            ``,
            `📋 Nama: ${data.nama}`,
            `🅰️ Golongan Darah: ${data.golongan_darah}`,
            `✅ Total Donor Berhasil: ${data.total_donor_berhasil}x`,
            lastDonorDate ? `📅 Donor Terakhir: ${fmtDate(lastDonorDate)}` : null,
            ``,
            `Ayo donor darah! Cek jadwal & daftar di:`,
            `🔗 https://sipeda.vercel.app/jadwal`,
        ].filter(Boolean).join('\n');
        window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, '_blank');
    }

    return (
        <div className="space-y-4">
            {/* ── Card ── */}
            <div
                ref={cardRef}
                style={{
                    maxWidth: 400,
                    margin: '0 auto',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    color: '#111827',
                    // Isolate from Tailwind CSS vars that use lab() — html2canvas can't parse them
                    colorScheme: 'light',
                }}
            >
                {/* Red header strip */}
                <div style={{
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    padding: '20px 24px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36,
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: 10,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Droplets style={{ width: 18, height: 18, color: '#fff', fill: '#fff' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>SIPEDA</div>
                            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>PMI Kab. Indramayu</div>
                        </div>
                    </div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', textAlign: 'right' as const, textTransform: 'uppercase' as const, letterSpacing: 1 }}>
                        Kartu Donor<br />Digital
                    </div>
                </div>

                {/* Main content — white background */}
                <div style={{ padding: '20px 24px' }}>
                    {/* Name */}
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{data.nama}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>{data.telepon}</div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        {/* Blood type */}
                        <div style={{
                            flex: 1,
                            background: '#fef2f2',
                            borderRadius: 12,
                            padding: '14px 16px',
                            textAlign: 'center' as const,
                        }}>
                            <div style={{ fontSize: 9, textTransform: 'uppercase' as const, letterSpacing: 1, color: '#9ca3af', marginBottom: 4 }}>Golongan Darah</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: '#dc2626' }}>{data.golongan_darah}</div>
                        </div>
                        {/* Total donor */}
                        <div style={{
                            flex: 1,
                            background: '#f0fdf4',
                            borderRadius: 12,
                            padding: '14px 16px',
                            textAlign: 'center' as const,
                        }}>
                            <div style={{ fontSize: 9, textTransform: 'uppercase' as const, letterSpacing: 1, color: '#9ca3af', marginBottom: 4 }}>Total Donor</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                <Award style={{ width: 18, height: 18, color: '#16a34a' }} />
                                <span style={{ fontSize: 28, fontWeight: 800, color: '#16a34a' }}>{data.total_donor_berhasil}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer — subtle gray */}
                <div style={{
                    background: '#f9fafb',
                    borderTop: '1px solid #f3f4f6',
                    padding: '12px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', gap: 24 }}>
                        <div>
                            <div style={{ fontSize: 8, textTransform: 'uppercase' as const, letterSpacing: 1, color: '#9ca3af' }}>Donor Terakhir</div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#374151' }}>
                                {lastDonorDate ? fmtDate(lastDonorDate) : 'Belum ada'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 8, textTransform: 'uppercase' as const, letterSpacing: 1, color: '#9ca3af' }}>ID Pendonor</div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#374151', fontFamily: 'monospace' }}>{donorId}</div>
                        </div>
                    </div>
                    <div style={{ fontSize: 8, color: '#d1d5db' }}>sipeda.vercel.app</div>
                </div>
            </div>

            {/* ── Action buttons ── */}
            <div className="flex gap-3 max-w-[400px] mx-auto">
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60"
                >
                    {downloading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    {downloading ? 'Menyimpan...' : 'Simpan Kartu'}
                </button>
                <button
                    onClick={handleShareWA}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
                >
                    <MessageCircle className="w-4 h-4" />
                    Bagikan
                </button>
            </div>

            {/* Error message */}
            {downloadError && (
                <div className="flex items-center gap-2 max-w-[400px] mx-auto p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <X className="w-4 h-4 flex-shrink-0 cursor-pointer hover:text-red-900" onClick={() => setDownloadError('')} />
                    {downloadError}
                </div>
            )}
        </div>
    );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle, Clock, XCircle, Calendar, MapPin, ArrowLeft, Phone } from 'lucide-react';

import { getRegistrasiByKode } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import CancelRegistrasiButton from '@/components/jadwal/CancelRegistrasiButton';
import { Card } from '@/components/ui/Card';


type Props = { params: Promise<{ kode: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { kode } = await params;
    return {
        title: `Status Registrasi ${kode}`,
        description: 'Cek status pendaftaran donor darah kamu.',
    };
}

async function getData(kode: string) {
    try {
        const data = await getRegistrasiByKode(kode);
        if (!data) return { type: 'not_found' as const };
        return { type: 'ok' as const, data };
    } catch {
        return { type: 'error' as const };
    }
}

const STATUS_MAP: Record<string, {
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    desc: string;
}> = {
    pending: { label: 'Menunggu Konfirmasi', icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', desc: 'Pendaftaranmu sedang diproses oleh petugas PMI.' },
    confirmed: { label: 'Dikonfirmasi', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50 border-green-200', desc: 'Pendaftaranmu sudah dikonfirmasi. Datang sesuai jadwal!' },
    hadir: { label: 'Sudah Hadir', icon: CheckCircle, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', desc: 'Terima kasih! Kehadiranmu sudah tercatat.' },
    tidak_hadir: { label: 'Tidak Hadir', icon: XCircle, color: 'text-[var(--color-text-secondary)]', bg: 'bg-[var(--color-section-alt)] border-[var(--color-border-muted)]', desc: 'Kamu tidak hadir pada jadwal tersebut.' },
    dibatalkan: { label: 'Dibatalkan', icon: XCircle, color: 'text-red-700', bg: 'bg-[var(--color-primary-subtle)] border-red-200', desc: 'Registrasi ini telah dibatalkan.' },
};

export default async function RegistrasiDetailPage({ params }: Props) {
    const { kode } = await params;
    const decodedKode = decodeURIComponent(kode).toUpperCase();

    const result = await getData(decodedKode);
    if (result.type === 'not_found') notFound();
    if (result.type === 'error') {
        return (
            <main id="main" className="max-w-lg mx-auto px-4 sm:px-6 py-10">
                <Card variant="flush" className="text-center !p-10 rounded-3xl border border-[var(--color-border-muted)] shadow-[var(--shadow-card)]">
                    <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Gagal Memuat Data</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mb-6">Terjadi kesalahan saat memuat status registrasi. Silakan coba lagi.</p>
                    <Link href="/registrasi"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-accent)] text-white shadow-[var(--shadow-btn-primary)] hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] hover:shadow-[var(--shadow-btn-primary-hover)] active:scale-[0.97] transition-all">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </Link>
                </Card>
            </main>
        );
    }

    const data = result.data;

    const statusInfo = STATUS_MAP[data.status] ?? STATUS_MAP['pending'];
    const StatusIcon = statusInfo.icon;

    return (
        <main id="main" className="max-w-lg mx-auto px-4 sm:px-6 py-10">

            <Link href="/registrasi"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Kembali
            </Link>

            <h1 className="sr-only">Status Registrasi {data.kode_registrasi}</h1>

            {/* Status card */}
            <Card variant="flush" className={`${statusInfo.bg} !p-6 mb-6 rounded-3xl`}>
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${statusInfo.color} bg-white/60`}>
                        <StatusIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-0.5">
                            Status Registrasi
                        </div>
                        <div className={`text-lg font-bold ${statusInfo.color}`}>
                            {statusInfo.label}
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">{statusInfo.desc}</p>
                    </div>
                </div>
            </Card>

            {/* Info registrasi */}
            <Card variant="elevated" className="p-6 space-y-5 rounded-3xl">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-1 h-5 bg-red-600 rounded-full" />
                    <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Detail Registrasi</span>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-[var(--color-border-muted)] text-center">
                    <div className="text-xs font-medium text-[var(--color-text-muted)] mb-1">Kode Registrasi</div>
                    <div className="text-2xl font-bold font-mono text-[var(--color-text-primary)] tracking-widest">
                        {data.kode_registrasi}
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                <div>
                    <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                        Nama Pendaftar
                    </div>
                    <div className="font-semibold text-[var(--color-text-primary)]">{data.nama}</div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 bg-red-600 rounded-full" />
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Detail Jadwal</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)] bg-[var(--color-section-alt)]/50 rounded-xl px-4 py-2.5">
                            <Calendar className="w-4 h-4 text-red-500 flex-shrink-0" />
                            {formatDate(data.jadwal?.tanggal, { withDay: true })}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)] bg-[var(--color-section-alt)]/50 rounded-xl px-4 py-2.5">
                            <Clock className="w-4 h-4 text-red-500 flex-shrink-0" />
                            {formatTime(data.jadwal?.waktu_mulai)} – {formatTime(data.jadwal?.waktu_selesai)} WIB
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)] bg-[var(--color-section-alt)]/50 rounded-xl px-4 py-2.5">
                            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                            {data.jadwal?.lokasi?.nama_lokasi ?? '—'} · {data.jadwal?.lokasi?.kecamatan ?? '—'}
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                <div className="text-sm text-[var(--color-text-muted)] leading-relaxed bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    Tunjukkan kode registrasi ini kepada petugas PMI pada hari kegiatan.
                    Pastikan kamu datang tepat waktu dan sudah memenuhi{' '}
                    <Link href="/syarat-donor" className="text-[var(--color-primary)] font-semibold hover:underline">
                        syarat donor
                    </Link>.
                </div>
            </Card>

            <CancelRegistrasiButton kode={data.kode_registrasi} status={data.status} />

            {/* Contact */}
            <Card variant="flush" className="bg-[var(--color-section-alt)]/50 text-center !p-6 mt-6 rounded-3xl border border-[var(--color-border-muted)]">
                <p className="text-sm text-[var(--color-text-muted)] mb-3">
                    Ada pertanyaan? Hubungi PMI Indramayu
                </p>
                <a href="tel:+62234271648"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold rounded-2xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-accent)] text-white shadow-[var(--shadow-btn-primary)] hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] hover:shadow-[var(--shadow-btn-primary-hover)] active:scale-[0.97] transition-all">
                    <Phone className="w-4 h-4" />
                    0234-271648
                </a>
            </Card>

        </main>
    );
}

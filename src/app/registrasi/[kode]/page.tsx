import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle, Clock, XCircle, Calendar, MapPin, ArrowLeft, Phone } from 'lucide-react';

import { getRegistrasiByKode } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';

type Props = { params: Promise<{ kode: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { kode } = await params;
    return {
        title: `Status Registrasi ${kode}`,
        description: 'Cek status pendaftaran donor darah kamu.',
    };
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
    tidak_hadir: { label: 'Tidak Hadir', icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', desc: 'Kamu tidak hadir pada jadwal tersebut.' },
    dibatalkan: { label: 'Dibatalkan', icon: XCircle, color: 'text-red-700', bg: 'bg-red-50 border-red-200', desc: 'Registrasi ini telah dibatalkan.' },
};

export default async function RegistrasiDetailPage({ params }: Props) {
    const { kode } = await params;
    const decodedKode = decodeURIComponent(kode).toUpperCase();

    const data = await getRegistrasiByKode(decodedKode).catch(() => null);
    if (!data) notFound();

    const statusInfo = STATUS_MAP[data.status] ?? STATUS_MAP['pending'];
    const StatusIcon = statusInfo.icon;

    return (
        <main id="main" className="max-w-lg mx-auto px-4 sm:px-6 py-10">

            <Link href="/registrasi"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Kembali
            </Link>

            {/* Status card */}
            <div className={`rounded-2xl border p-6 mb-6 ${statusInfo.bg}`}>
                <div className="flex items-center gap-3 mb-3">
                    <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                    <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            Status Registrasi
                        </div>
                        <div className={`text-lg font-bold ${statusInfo.color}`}>
                            {statusInfo.label}
                        </div>
                    </div>
                </div>
                <p className="text-sm text-gray-600">{statusInfo.desc}</p>
            </div>

            {/* Info registrasi */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                        Kode Registrasi
                    </div>
                    <div className="text-2xl font-bold font-mono text-gray-900 tracking-widest">
                        {data.kode_registrasi}
                    </div>
                </div>

                <div className="h-px bg-gray-100" />

                <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                        Nama Pendaftar
                    </div>
                    <div className="font-semibold text-gray-900">{data.nama}</div>
                </div>

                <div className="h-px bg-gray-100" />

                <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Detail Jadwal
                    </div>
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-red-500 flex-shrink-0" />
                            {formatDate(data.jadwal?.tanggal, { withDay: true })}
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-gray-700">
                            <Clock className="w-4 h-4 text-red-500 flex-shrink-0" />
                            {formatTime(data.jadwal?.waktu_mulai)} – {formatTime(data.jadwal?.waktu_selesai)} WIB
                        </div>
                        <div className="flex items-center gap-2.5 text-sm text-gray-700">
                            <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                            {data.jadwal?.lokasi?.nama_lokasi ?? '—'} · {data.jadwal?.lokasi?.kecamatan ?? '—'}
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="text-sm text-gray-500 leading-relaxed">
                    Tunjukkan kode registrasi ini kepada petugas PMI pada hari kegiatan.
                    Pastikan kamu datang tepat waktu dan sudah memenuhi{' '}
                    <Link href="/syarat-donor" className="text-red-600 font-semibold hover:underline">
                        syarat donor
                    </Link>.
                </div>
            </div>

            {/* Contact */}
            <div className="mt-6 p-5 bg-gray-50 rounded-2xl text-center">
                <p className="text-sm text-gray-500 mb-3">
                    Ada pertanyaan? Hubungi PMI Indramayu
                </p>
                <a href="tel:+62234271648"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
                    <Phone className="w-4 h-4" />
                    0234-271648
                </a>
            </div>

        </main>
    );
}

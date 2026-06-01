'use client';

import { useState, useEffect, useRef } from 'react';
import { getRekapPencatatan, getAdminPencatatan } from '@/lib/admin-api';
import type { RekapPencatatan, PencatatanDonor } from '@/lib/types';
import { useSidebarToggle } from '@/lib/admin-context';
import { TopBar } from '@/components/admin/TopBar';
import {
    RefreshCw, ClipboardCheck, Calendar,
    MapPin, Check, X, AlertTriangle, ChevronDown, ChevronUp,
    Users, Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/Button';

const STATUS_BADGE: Record<string, string> = {
    berhasil: 'bg-green-100 text-green-700',
    gagal: 'bg-red-100 text-red-700',
    tidak_memenuhi_syarat: 'bg-yellow-100 text-yellow-700',
};
const STATUS_LABEL: Record<string, string> = {
    berhasil: 'Berhasil',
    gagal: 'Gagal',
    tidak_memenuhi_syarat: 'Tidak Memenuhi Syarat',
};

export default function AdminPencatatanPage() {
    const toggleSidebar = useSidebarToggle();
    const [rekap, setRekap] = useState<RekapPencatatan[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [detail, setDetail] = useState<PencatatanDonor[]>([]);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const loadReqId = useRef(0);

    async function loadRekap() {
        const reqId = ++loadReqId.current;
        setLoading(true);
        try {
            const data = await getRekapPencatatan();
            if (reqId !== loadReqId.current) return;
            setRekap(data);
        } catch { /* silent */ }
        if (reqId === loadReqId.current) setLoading(false);
    }

    useEffect(() => {
        void Promise.resolve().then(loadRekap);
    }, []);

    async function toggleExpand(jadwalId: number) {
        if (expanded === jadwalId) {
            setExpanded(null);
            setDetail([]);
            return;
        }
        const reqId = ++loadReqId.current;
        setExpanded(jadwalId);
        setLoadingDetail(true);
        try {
            const data = await getAdminPencatatan(jadwalId);
            if (reqId === loadReqId.current) setDetail(data);
        } catch { /* silent */ }
        if (reqId === loadReqId.current) setLoadingDetail(false);
    }

    // Summary stats
    const totalBerhasil = rekap.reduce((s, r) => s + r.berhasil, 0);
    const totalGagal = rekap.reduce((s, r) => s + r.gagal, 0);
    const totalTidak = rekap.reduce((s, r) => s + r.tidak_memenuhi, 0);
    const totalCatat = rekap.reduce((s, r) => s + r.total_catat, 0);

    // C1: Excel export — 3 sheets
    async function handleExportExcel() {
        // Fetch all detail data for every jadwal
        const allDetails: (PencatatanDonor & { lokasi: string; tanggal: string })[] = [];
        const detailPromises = rekap.map(async (r) => {
            try {
                const detail = await getAdminPencatatan(r.jadwal_id);
                detail.forEach(d => allDetails.push({
                    ...d,
                    lokasi: r.nama_lokasi,
                    tanggal: new Date(r.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                }));
            } catch { /* skip */ }
        });
        await Promise.allSettled(detailPromises);

        const wb = XLSX.utils.book_new();

        // Sheet 1: Rekap per Kegiatan
        const rekapData = rekap.map(r => ({
            'Lokasi': r.nama_lokasi,
            'Tanggal': new Date(r.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            'Waktu': `${r.waktu_mulai} – ${r.waktu_selesai}`,
            'Total Dicatat': r.total_catat,
            'Berhasil': r.berhasil,
            'Gagal': r.gagal,
            'Tidak Memenuhi Syarat': r.tidak_memenuhi,
        }));
        const ws1 = XLSX.utils.json_to_sheet(rekapData);
        ws1['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, ws1, 'Rekap per Kegiatan');

        // Sheet 2: Detail per Pendonor
        const detailData = allDetails.map((d, i) => ({
            'No': i + 1,
            'Lokasi': d.lokasi,
            'Tanggal': d.tanggal,
            'Nama Pendonor': d.nama_pendonor,
            'Golongan Darah': d.golongan_darah,
            'Status': STATUS_LABEL[d.status_donor] ?? d.status_donor,
            'Catatan': d.catatan ?? '-',
            'Waktu Dicatat': new Date(d.created_at).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        }));
        const ws2 = XLSX.utils.json_to_sheet(detailData);
        ws2['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 22 }, { wch: 25 }, { wch: 18 }];
        XLSX.utils.book_append_sheet(wb, ws2, 'Detail Pendonor');

        // Sheet 3: Ringkasan per Golongan Darah
        const goldarCount: Record<string, { berhasil: number; gagal: number; tms: number }> = {};
        allDetails.forEach(d => {
            if (!goldarCount[d.golongan_darah]) goldarCount[d.golongan_darah] = { berhasil: 0, gagal: 0, tms: 0 };
            if (d.status_donor === 'berhasil') goldarCount[d.golongan_darah].berhasil++;
            else if (d.status_donor === 'gagal') goldarCount[d.golongan_darah].gagal++;
            else goldarCount[d.golongan_darah].tms++;
        });
        const goldarData = Object.entries(goldarCount).map(([gol, c]) => ({
            'Golongan Darah': gol,
            'Berhasil': c.berhasil,
            'Gagal': c.gagal,
            'Tidak Memenuhi Syarat': c.tms,
            'Total': c.berhasil + c.gagal + c.tms,
        }));
        const ws3 = XLSX.utils.json_to_sheet(goldarData);
        ws3['!cols'] = [{ wch: 15 }, { wch: 10 }, { wch: 8 }, { wch: 22 }, { wch: 8 }];
        XLSX.utils.book_append_sheet(wb, ws3, 'Per Golongan Darah');

        // Download
        const filename = `SIPEDA_Pencatatan_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, filename);
    }

    return (
        <div className="flex flex-col min-h-full">
            {/* Header — using shared TopBar for consistency */}
            <TopBar
                title="Pencatatan Donor"
                subtitle="Rekap kehadiran pendonor per kegiatan"
                onMenuClick={toggleSidebar}
                actions={
                    <>
                        <Button variant="ghost" size="sm" onClick={loadRekap} title="Refresh" icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-500' : ''}`} />} />
                        {rekap.length > 0 && (
                            <Button variant="secondary" size="sm" onClick={handleExportExcel} icon={<Download className="w-3.5 h-3.5" />}>
                                Export Excel
                            </Button>
                        )}
                    </>
                }
            />

            <main className="flex-1 p-4 sm:p-6 space-y-5">
                {/* Summary cards */}
                {!loading && totalCatat > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl border border-[var(--color-border-muted)] p-5 text-center">
                            <div className="text-2xl font-bold text-[var(--color-text-primary)]">{totalCatat}</div>
                            <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Total Dicatat</div>
                        </div>
                        <div className="bg-white rounded-2xl border border-[var(--color-border-muted)] p-5 text-center">
                            <div className="text-2xl font-bold text-green-600">{totalBerhasil}</div>
                            <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Berhasil</div>
                        </div>
                        <div className="bg-white rounded-2xl border border-[var(--color-border-muted)] p-5 text-center">
                            <div className="text-2xl font-bold text-red-600">{totalGagal}</div>
                            <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Gagal</div>
                        </div>
                        <div className="bg-white rounded-2xl border border-[var(--color-border-muted)] p-5 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{totalTidak}</div>
                            <div className="text-xs text-[var(--color-text-muted)] mt-0.5">Tdk Memenuhi</div>
                        </div>
                    </div>
                )}

                {/* Rekap per jadwal */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-[var(--color-border-muted)] p-5 animate-pulse-soft">
                                <div className="h-4 bg-[var(--color-section-alt)] rounded w-1/2 mb-2" />
                                <div className="h-3 bg-[var(--color-border-muted)] rounded w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : rekap.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[var(--color-border-muted)] p-12 text-center">
                        <ClipboardCheck className="w-8 h-8 text-[var(--color-text-muted)]/60 mx-auto mb-3" />
                        <div className="text-sm text-[var(--color-text-muted)]">Belum ada data pencatatan.</div>
                        <div className="text-xs text-[var(--color-text-muted)] mt-1">Pencatatan dilakukan oleh petugas lapangan saat kegiatan.</div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {rekap.map(r => (
                            <div key={r.jadwal_id} className="bg-white rounded-2xl border border-[var(--color-border-muted)] overflow-hidden">
                                {/* Rekap row */}
                                <button
                                    onClick={() => toggleExpand(r.jadwal_id)}
                                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-[var(--color-section-alt)] transition-colors text-left"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                            <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{r.nama_lokasi}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(r.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span>{r.waktu_mulai}–{r.waktu_selesai}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                                <Check className="w-3 h-3" /> {r.berhasil}
                                            </span>
                                            <span className="text-[var(--color-text-muted)]/60">|</span>
                                            <span className="flex items-center gap-1 text-red-600 font-medium">
                                                <X className="w-3 h-3" /> {r.gagal}
                                            </span>
                                            <span className="text-[var(--color-text-muted)]/60">|</span>
                                            <span className="flex items-center gap-1 text-yellow-600 font-medium">
                                                <AlertTriangle className="w-3 h-3" /> {r.tidak_memenuhi}
                                            </span>
                                        </div>
                                        <div className="bg-[var(--color-section-alt)] text-[var(--color-text-secondary)] text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                            <Users className="w-3 h-3" /> {r.total_catat}
                                        </div>
                                        {expanded === r.jadwal_id
                                            ? <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
                                            : <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                                        }
                                    </div>
                                </button>

                                {/* Detail table */}
                                {expanded === r.jadwal_id && (
                                    <div className="border-t border-[var(--color-border-muted)]">
                                        {loadingDetail ? (
                                            <div className="p-6 text-center">
                                                <RefreshCw className="w-4 h-4 text-[var(--color-text-muted)] animate-spin mx-auto" />
                                            </div>
                                        ) : detail.length === 0 ? (
                                            <div className="p-6 text-center text-sm text-[var(--color-text-muted)]">Tidak ada data.</div>
                                        ) : (
                                            <table className="w-full text-sm">
                                                <thead className="bg-[var(--color-section-alt)]">
                                                    <tr>
                                                        <th className="text-left px-5 py-2 text-xs font-medium text-[var(--color-text-muted)] uppercase">#</th>
                                                        <th className="text-left px-5 py-2 text-xs font-medium text-[var(--color-text-muted)] uppercase">Nama Pendonor</th>
                                                        <th className="text-left px-5 py-2 text-xs font-medium text-[var(--color-text-muted)] uppercase">Gol. Darah</th>
                                                        <th className="text-left px-5 py-2 text-xs font-medium text-[var(--color-text-muted)] uppercase">Status</th>
                                                        <th className="text-left px-5 py-2 text-xs font-medium text-[var(--color-text-muted)] uppercase hidden sm:table-cell">Catatan</th>
                                                        <th className="text-left px-5 py-2 text-xs font-medium text-[var(--color-text-muted)] uppercase hidden md:table-cell">Waktu</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[var(--color-border-muted)]">
                                                    {detail.map((d, idx) => (
                                                        <tr key={d.id} className="hover:bg-[var(--color-section-alt)] transition-colors">
                                                            <td className="px-5 py-2.5 text-[var(--color-text-muted)] font-mono text-xs">{detail.length - idx}</td>
                                                            <td className="px-5 py-2.5 font-medium text-[var(--color-text-primary)]">{d.nama_pendonor}</td>
                                                            <td className="px-5 py-2.5 text-[var(--color-text-secondary)]">{d.golongan_darah}</td>
                                                            <td className="px-5 py-2.5">
                                                                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[d.status_donor]}`}>
                                                                    {STATUS_LABEL[d.status_donor]}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-2.5 text-[var(--color-text-muted)] text-xs hidden sm:table-cell">{d.catatan ?? '—'}</td>
                                                            <td className="px-5 py-2.5 text-[var(--color-text-muted)] text-xs hidden md:table-cell">
                                                                {new Date(d.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

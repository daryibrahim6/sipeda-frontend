'use client';

import { useState, useEffect } from 'react';
import { getRekapPencatatan, getAdminPencatatan } from '@/lib/admin-api';
import type { RekapPencatatan, PencatatanDonor } from '@/lib/types';
import { useSidebarToggle } from '../layout';
import { TopBar } from '@/components/admin/TopBar';
import {
    RefreshCw, ClipboardCheck, Calendar,
    MapPin, Check, X, AlertTriangle, ChevronDown, ChevronUp,
    Users, Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';

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

    async function loadRekap() {
        setLoading(true);
        try {
            const data = await getRekapPencatatan();
            setRekap(data);
        } catch { /* silent */ }
        setLoading(false);
    }

    useEffect(() => { loadRekap(); }, []);

    async function toggleExpand(jadwalId: number) {
        if (expanded === jadwalId) {
            setExpanded(null);
            setDetail([]);
            return;
        }
        setExpanded(jadwalId);
        setLoadingDetail(true);
        try {
            const data = await getAdminPencatatan(jadwalId);
            setDetail(data);
        } catch { /* silent */ }
        setLoadingDetail(false);
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
        for (const r of rekap) {
            try {
                const detail = await getAdminPencatatan(r.jadwal_id);
                detail.forEach(d => allDetails.push({
                    ...d,
                    lokasi: r.nama_lokasi,
                    tanggal: new Date(r.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                }));
            } catch { /* skip */ }
        }

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
        <>
            {/* Header — using shared TopBar for consistency */}
            <TopBar
                title="Pencatatan Donor"
                subtitle="Rekap kehadiran pendonor per kegiatan"
                onMenuClick={toggleSidebar}
                actions={
                    <>
                        <button onClick={loadRekap} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" aria-label="Refresh">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        {rekap.length > 0 && (
                            <button
                                onClick={handleExportExcel}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" /> Export Excel
                            </button>
                        )}
                    </>
                }
            />

            <div className="p-4 sm:p-6 space-y-5">
                {/* Summary cards */}
                {!loading && totalCatat > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900">{totalCatat}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Total Dicatat</div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{totalBerhasil}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Berhasil</div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">{totalGagal}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Gagal</div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{totalTidak}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Tdk Memenuhi</div>
                        </div>
                    </div>
                )}

                {/* Rekap per jadwal */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : rekap.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <ClipboardCheck className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <div className="text-sm text-gray-500">Belum ada data pencatatan.</div>
                        <div className="text-xs text-gray-400 mt-1">Pencatatan dilakukan oleh petugas lapangan saat kegiatan.</div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {rekap.map(r => (
                            <div key={r.jadwal_id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                {/* Rekap row */}
                                <button
                                    onClick={() => toggleExpand(r.jadwal_id)}
                                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                            <span className="text-sm font-semibold text-gray-900 truncate">{r.nama_lokasi}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
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
                                            <span className="text-gray-300">|</span>
                                            <span className="flex items-center gap-1 text-red-600 font-medium">
                                                <X className="w-3 h-3" /> {r.gagal}
                                            </span>
                                            <span className="text-gray-300">|</span>
                                            <span className="flex items-center gap-1 text-yellow-600 font-medium">
                                                <AlertTriangle className="w-3 h-3" /> {r.tidak_memenuhi}
                                            </span>
                                        </div>
                                        <div className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                            <Users className="w-3 h-3" /> {r.total_catat}
                                        </div>
                                        {expanded === r.jadwal_id
                                            ? <ChevronUp className="w-4 h-4 text-gray-400" />
                                            : <ChevronDown className="w-4 h-4 text-gray-400" />
                                        }
                                    </div>
                                </button>

                                {/* Detail table */}
                                {expanded === r.jadwal_id && (
                                    <div className="border-t border-gray-100">
                                        {loadingDetail ? (
                                            <div className="p-6 text-center">
                                                <RefreshCw className="w-4 h-4 text-gray-400 animate-spin mx-auto" />
                                            </div>
                                        ) : detail.length === 0 ? (
                                            <div className="p-6 text-center text-sm text-gray-400">Tidak ada data.</div>
                                        ) : (
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="text-left px-5 py-2 text-xs font-medium text-gray-500 uppercase">#</th>
                                                        <th className="text-left px-5 py-2 text-xs font-medium text-gray-500 uppercase">Nama Pendonor</th>
                                                        <th className="text-left px-5 py-2 text-xs font-medium text-gray-500 uppercase">Gol. Darah</th>
                                                        <th className="text-left px-5 py-2 text-xs font-medium text-gray-500 uppercase">Status</th>
                                                        <th className="text-left px-5 py-2 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Catatan</th>
                                                        <th className="text-left px-5 py-2 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Waktu</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {detail.map((d, idx) => (
                                                        <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-5 py-2.5 text-gray-400 font-mono text-xs">{detail.length - idx}</td>
                                                            <td className="px-5 py-2.5 font-medium text-gray-900">{d.nama_pendonor}</td>
                                                            <td className="px-5 py-2.5 text-gray-600">{d.golongan_darah}</td>
                                                            <td className="px-5 py-2.5">
                                                                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[d.status_donor]}`}>
                                                                    {STATUS_LABEL[d.status_donor]}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-2.5 text-gray-500 text-xs hidden sm:table-cell">{d.catatan ?? '—'}</td>
                                                            <td className="px-5 py-2.5 text-gray-400 text-xs hidden md:table-cell">
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
            </div>
        </>
    );
}

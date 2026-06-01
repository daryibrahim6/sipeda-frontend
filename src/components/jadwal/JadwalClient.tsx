'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar } from 'lucide-react';
import { ScheduleCard } from '@/components/jadwal/ScheduleCard';
import { MONTHS_ID } from '@/lib/utils';
import type { Schedule } from '@/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';

type Location = { id: number; nama_lokasi: string };

function SkeletonCards() {
    return (
        <div className="space-y-10">
            {[1, 2].map(g => (
                <div key={g}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="bg-gray-200 animate-pulse rounded-xl w-[60px] h-[60px]" />
                        <div className="space-y-1.5">
                            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                            <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-52 bg-gray-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function JadwalClient({ locations }: { locations: Location[] }) {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year] = useState(now.getFullYear());
    const [lokasiId, setLokasiId] = useState<number | null>(null);
    const [hanyaSisaKuota, setHanyaSisaKuota] = useState(false);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const cacheRef = useRef<Map<string, Schedule[]>>(new Map());

    const fetchSchedules = useCallback(async (m: number, y: number) => {
        const key = `${y}-${m}`;
        const cached = cacheRef.current.get(key);
        if (cached) {
            setSchedules(cached);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/jadwal?month=${m}&year=${y}`);
            if (!res.ok) throw new Error('fetch failed');
            const data = await res.json();
            cacheRef.current.set(key, data);
            setSchedules(data);
        } catch {
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedules(month, year);
    }, [month, year, fetchSchedules]);

    // Client-side filter by lokasi & sisa kuota (data already loaded)
    const filtered = schedules.filter(s => {
        if (lokasiId && s.lokasi_id !== lokasiId) return false;
        if (hanyaSisaKuota && (s.status === 'penuh' || s.sisa_kuota === 0)) return false;
        return true;
    });

    const grouped = filtered.reduce<Record<string, Schedule[]>>((acc, s) => {
        if (!acc[s.tanggal]) acc[s.tanggal] = [];
        acc[s.tanggal].push(s);
        return acc;
    }, {});

    return (
        <>
            <PageHeader
                badge="Kalender Donor"
                title="Jadwal Kegiatan"
                description={`Pilih jadwal donor darah yang sesuai dengan waktu Anda dan daftar secara online untuk mengamankan kuota harian.`}
            />
            <main id="main" className="page-container py-16">

            {/* Filter bulan */}
            <div className="mb-6">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Bulan</p>
                <div className="flex flex-wrap gap-2">
                    {MONTHS_ID.map((label, i) => {
                        const m = i + 1;
                        return (
                            <button
                                key={m}
                                onClick={() => setMonth(m)}
                                className={`px-4 py-2 text-xs font-medium rounded-xl border transition-all active:scale-[0.95] ${m === month
                                        ? 'bg-red-600 text-white border-red-600'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600'
                                    }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Filter lokasi — instant (no fetch needed, just filter in memory) */}
            {locations.length > 0 && (
                <div className="mb-10">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Lokasi</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setLokasiId(null)}
                            className={`px-4 py-2 text-xs font-medium rounded-xl border transition-all active:scale-[0.95] ${lokasiId === null
                                    ? 'bg-red-600 text-white border-red-600'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'
                                }`}
                        >
                            Semua Lokasi
                        </button>
                        {locations.map(loc => (
                            <button
                                key={loc.id}
                                onClick={() => setLokasiId(loc.id)}
                                className={`px-4 py-2 text-xs font-medium rounded-xl border transition-all active:scale-[0.95] ${lokasiId === loc.id
                                        ? 'bg-red-600 text-white border-red-600'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'
                                    }`}
                            >
                                {loc.nama_lokasi}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter: Hanya sisa kuota */}
            <div className="mb-8 flex items-center gap-3">
              <button
                role="switch"
                aria-checked={hanyaSisaKuota}
                aria-label="Hanya tampilkan jadwal yang ada sisa kuota"
                onClick={() => setHanyaSisaKuota(p => !p)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${hanyaSisaKuota ? 'bg-red-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hanyaSisaKuota ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm text-gray-600 font-medium">Hanya tampilkan yang ada sisa kuota</span>
            </div>

            {/* Content */}
            {loading ? (
                <SkeletonCards />
            ) : Object.keys(grouped).length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <div className="font-medium text-gray-500">
                        Belum ada jadwal untuk {MONTHS_ID[month - 1]} {year}
                        {lokasiId && ` di lokasi ini`}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Coba pilih bulan atau lokasi lain</div>
                </div>
            ) : (
                <div className="space-y-10">
                    {Object.entries(grouped)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([date, daySchedules]) => {
                            const d = new Date(date);
                            return (
                                <div key={date}>
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="bg-red-600 text-white rounded-xl px-4 py-2.5 text-center min-w-[60px]">
                                            <div className="text-2xl font-bold leading-none">{d.getDate()}</div>
                                            <div className="text-xs mt-0.5 opacity-75">
                                                {MONTHS_ID[d.getMonth()].substring(0, 3)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">
                                                {d.toLocaleDateString('id-ID', { weekday: 'long' })}
                                            </div>
                                            <div className="text-xs text-gray-400">{daySchedules.length} kegiatan</div>
                                        </div>
                                        <div className="h-px bg-gray-100 flex-1 ml-2" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {daySchedules.map(s => <ScheduleCard key={s.id} schedule={s} />)}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}
        </main>
        </>
    );
}

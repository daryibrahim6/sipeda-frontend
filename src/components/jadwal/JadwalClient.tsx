'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { ScheduleCard } from '@/components/jadwal/ScheduleCard';
import { MONTHS_ID } from '@/lib/utils';
import type { Schedule } from '@/lib/types';

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
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSchedules = useCallback(async (m: number, y: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/jadwal?month=${m}&year=${y}`);
            if (!res.ok) throw new Error('fetch failed');
            const data = await res.json();
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

    // Client-side filter by lokasi (data already loaded)
    const filtered = lokasiId
        ? schedules.filter(s => s.lokasi_id === lokasiId)
        : schedules;

    const grouped = filtered.reduce<Record<string, Schedule[]>>((acc, s) => {
        if (!acc[s.tanggal]) acc[s.tanggal] = [];
        acc[s.tanggal].push(s);
        return acc;
    }, {});

    return (
        <main id="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Premium Header */}
            <div className="mb-10 text-center sm:text-left border-b border-gray-100 pb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-xs font-bold text-red-600 uppercase tracking-widest mb-4">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
                    </span>
                    Kalender Donor
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                    Jadwal Kegiatan
                </h1>
                <p className="text-gray-500 font-medium max-w-2xl mx-auto sm:mx-0 text-lg">
                    Pilih jadwal donor darah yang sesuai dengan waktu Anda dan daftar secara online untuk mengamankan <strong className="text-gray-900">kuota harian</strong>.
                </p>
            </div>

            {/* Filter bulan */}
            <div className="mb-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Bulan</p>
                <div className="flex flex-wrap gap-1.5">
                    {MONTHS_ID.map((label, i) => {
                        const m = i + 1;
                        return (
                            <button
                                key={m}
                                onClick={() => { setMonth(m); setLokasiId(null); }}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${m === month
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
                <div className="mb-8">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Lokasi</p>
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            onClick={() => setLokasiId(null)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${lokasiId === null
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
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${lokasiId === loc.id
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {daySchedules.map(s => <ScheduleCard key={s.id} schedule={s} />)}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}
        </main>
    );
}

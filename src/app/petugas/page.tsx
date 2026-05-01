'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePetugasUser } from './layout';
import { logoutAdmin } from '@/lib/auth';
import {
    getTodaySchedules, createPencatatan, getPencatatanByJadwal,
    deletePencatatan, updatePencatatan,
} from '@/lib/petugas-api';
import type { Schedule, PencatatanDonor } from '@/lib/types';
import { Calendar, MapPin, Clock, Loader2, ChevronDown } from 'lucide-react';

import { PetugasHeader } from '@/components/petugas/PetugasHeader';
import { StatsBar } from '@/components/petugas/StatsBar';
import { PencatatanForm } from '@/components/petugas/PencatatanForm';
import { PencatatanList } from '@/components/petugas/PencatatanList';

export default function PetugasPage() {
    const router = useRouter();
    const petugasUser = usePetugasUser();

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [selectedJadwal, setSelectedJadwal] = useState<number | null>(null);
    const [pencatatan, setPencatatan] = useState<PencatatanDonor[]>([]);
    const [loadingSchedules, setLoadingSchedules] = useState(true);
    const [loadingList, setLoadingList] = useState(false);

    // Load jadwal hari ini
    useEffect(() => {
        getTodaySchedules()
            .then(data => {
                setSchedules(data);
                if (data.length === 1) setSelectedJadwal(data[0].id);
            })
            .catch(() => { })
            .finally(() => setLoadingSchedules(false));
    }, []);

    // Load pencatatan per jadwal
    const loadPencatatan = useCallback(async (jadwalId: number) => {
        setLoadingList(true);
        try {
            const data = await getPencatatanByJadwal(jadwalId);
            setPencatatan(data);
        } catch { /* silent */ }
        setLoadingList(false);
    }, []);

    useEffect(() => {
        if (selectedJadwal) loadPencatatan(selectedJadwal);
    }, [selectedJadwal, loadPencatatan]);

    async function handleLogout() {
        await logoutAdmin();
        router.push('/login');
    }

    const selectedSchedule = schedules.find(s => s.id === selectedJadwal);
    const stats = {
        total: pencatatan.length,
        berhasil: pencatatan.filter(p => p.status_donor === 'berhasil').length,
        gagal: pencatatan.filter(p => p.status_donor === 'gagal').length,
        tidak_memenuhi: pencatatan.filter(p => p.status_donor === 'tidak_memenuhi_syarat').length,
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <PetugasHeader
                userName={petugasUser?.name ?? 'Petugas'}
                onLogout={handleLogout}
            />

            <main className="max-w-lg mx-auto px-4 py-5 space-y-4">
                {/* Jadwal selector */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        <Calendar className="w-3.5 h-3.5 inline mr-1" />
                        Jadwal Hari Ini
                    </label>

                    {loadingSchedules ? (
                        <div className="bg-gray-900 rounded-xl border border-white/10 p-4 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                        </div>
                    ) : schedules.length === 0 ? (
                        <div className="bg-gray-900 rounded-xl border border-white/10 p-6 text-center text-sm text-gray-500">
                            Tidak ada jadwal donor hari ini.
                        </div>
                    ) : (
                        <div className="relative">
                            <select
                                value={selectedJadwal ?? ''}
                                onChange={e => setSelectedJadwal(Number(e.target.value) || null)}
                                className="w-full appearance-none bg-gray-900 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">— Pilih jadwal —</option>
                                {schedules.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.lokasi?.nama_lokasi ?? `Jadwal #${s.id}`} · {s.waktu_mulai}–{s.waktu_selesai}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                        </div>
                    )}

                    {selectedSchedule && (
                        <div className="mt-2 bg-gray-900/50 rounded-lg border border-white/5 px-4 py-2.5 flex items-center gap-3 text-xs text-gray-400">
                            <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                            <span>{selectedSchedule.lokasi?.nama_lokasi}</span>
                            <span className="text-gray-700">·</span>
                            <Clock className="w-3.5 h-3.5 text-gray-600" />
                            <span>{selectedSchedule.waktu_mulai}–{selectedSchedule.waktu_selesai}</span>
                        </div>
                    )}
                </div>

                {/* Stats bar */}
                {selectedJadwal && !loadingList && pencatatan.length > 0 && (
                    <StatsBar {...stats} />
                )}

                {/* Form */}
                {selectedJadwal && petugasUser && (
                    <PencatatanForm
                        jadwalId={selectedJadwal}
                        petugasId={petugasUser.id}
                        onSaved={() => loadPencatatan(selectedJadwal)}
                        onCreatePencatatan={createPencatatan}
                    />
                )}

                {/* List */}
                {selectedJadwal && (
                    <PencatatanList
                        pencatatan={pencatatan}
                        loading={loadingList}
                        onUpdate={updatePencatatan}
                        onDelete={deletePencatatan}
                        onRefresh={() => loadPencatatan(selectedJadwal)}
                    />
                )}
            </main>
        </div>
    );
}

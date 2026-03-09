'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePetugasUser } from './layout';
import { logoutAdmin } from '@/lib/auth';
import {
    getTodaySchedules, createPencatatan, getPencatatanByJadwal,
    deletePencatatan, updatePencatatan, lookupRegistrasiByKode, markRegistrasiHadir,
} from '@/lib/petugas-api';
import type { Schedule, PencatatanDonor, StatusDonor, BloodType } from '@/lib/types';
import type { RegistrasiLookup } from '@/lib/petugas-api';
import {
    Droplets, LogOut, Loader2, Plus, Calendar, MapPin,
    Clock, Check, X, AlertTriangle, Trash2, Users, ChevronDown,
    Search, Edit3, QrCode, UserPlus,
} from 'lucide-react';

const GOLDAR_OPTIONS: (BloodType | 'Tidak Tahu')[] = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Tidak Tahu',
];

const STATUS_OPTIONS: { value: StatusDonor; label: string; icon: typeof Check; color: string }[] = [
    { value: 'berhasil', label: 'Berhasil', icon: Check, color: 'bg-green-600 hover:bg-green-700 border-green-600' },
    { value: 'gagal', label: 'Gagal', icon: X, color: 'bg-red-600 hover:bg-red-700 border-red-600' },
    { value: 'tidak_memenuhi_syarat', label: 'Tidak Memenuhi Syarat', icon: AlertTriangle, color: 'bg-yellow-600 hover:bg-yellow-700 border-yellow-600' },
];

const STATUS_BADGE: Record<StatusDonor, string> = {
    berhasil: 'bg-green-500/10 text-green-400 border-green-500/20',
    gagal: 'bg-red-500/10 text-red-400 border-red-500/20',
    tidak_memenuhi_syarat: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};
const STATUS_LABEL: Record<StatusDonor, string> = {
    berhasil: 'Berhasil',
    gagal: 'Gagal',
    tidak_memenuhi_syarat: 'Tidak Memenuhi Syarat',
};

type InputMode = 'kode' | 'walkin';

export default function PetugasPage() {
    const router = useRouter();
    const petugasUser = usePetugasUser();

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [selectedJadwal, setSelectedJadwal] = useState<number | null>(null);
    const [pencatatan, setPencatatan] = useState<PencatatanDonor[]>([]);
    const [loadingSchedules, setLoadingSchedules] = useState(true);
    const [loadingList, setLoadingList] = useState(false);

    // Form state
    const [formOpen, setFormOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        nama_pendonor: '',
        golongan_darah: 'Tidak Tahu' as BloodType | 'Tidak Tahu',
        status_donor: 'berhasil' as StatusDonor,
        catatan: '',
    });
    const [formError, setFormError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // B4: Dual-mode input
    const [inputMode, setInputMode] = useState<InputMode>('kode');
    const [kodeInput, setKodeInput] = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupResult, setLookupResult] = useState<RegistrasiLookup | null>(null);
    const [lookupError, setLookupError] = useState('');

    // B3: Edit state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        nama_pendonor: '',
        golongan_darah: 'Tidak Tahu' as BloodType | 'Tidak Tahu',
        status_donor: 'berhasil' as StatusDonor,
        catatan: '',
    });
    const [editSaving, setEditSaving] = useState(false);

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

    // ─── B4: Lookup kode registrasi ──────────────────────────────────────────

    async function handleLookup() {
        if (!kodeInput.trim()) return;
        setLookupLoading(true);
        setLookupError('');
        setLookupResult(null);

        const result = await lookupRegistrasiByKode(kodeInput.trim());
        if (!result) {
            setLookupError('Kode tidak ditemukan. Cek kembali atau gunakan mode Walk-in.');
        } else if (result.status_kehadiran === 'hadir') {
            setLookupError('Kode ini sudah diverifikasi sebelumnya.');
        } else {
            setLookupResult(result);
            // Auto-fill form from registrasi data
            setForm(f => ({
                ...f,
                nama_pendonor: result.nama,
                golongan_darah: (result.golongan_darah as BloodType | 'Tidak Tahu') || 'Tidak Tahu',
            }));
        }
        setLookupLoading(false);
    }

    // ─── Submit pencatatan ───────────────────────────────────────────────────

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedJadwal || !petugasUser) return;
        setSaving(true);
        setFormError('');
        setSuccessMsg('');
        try {
            await createPencatatan({
                jadwal_id: selectedJadwal,
                nama_pendonor: form.nama_pendonor.trim(),
                golongan_darah: form.golongan_darah,
                status_donor: form.status_donor,
                catatan: form.catatan.trim() || undefined,
            }, petugasUser.id);

            // B4: If from kode registrasi, mark as hadir
            if (lookupResult) {
                await markRegistrasiHadir(lookupResult.id).catch(() => { });
            }

            // Reset form & reload list
            setForm({ nama_pendonor: '', golongan_darah: 'Tidak Tahu', status_donor: 'berhasil', catatan: '' });
            setLookupResult(null);
            setKodeInput('');
            setSuccessMsg(`${form.nama_pendonor.trim()} berhasil dicatat!`);
            setTimeout(() => setSuccessMsg(''), 3000);
            loadPencatatan(selectedJadwal);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Gagal menyimpan');
        } finally {
            setSaving(false);
        }
    }

    // ─── B3: Edit pencatatan ─────────────────────────────────────────────────

    function startEdit(p: PencatatanDonor) {
        setEditingId(p.id);
        setEditForm({
            nama_pendonor: p.nama_pendonor,
            golongan_darah: p.golongan_darah as BloodType | 'Tidak Tahu',
            status_donor: p.status_donor,
            catatan: p.catatan ?? '',
        });
    }

    async function handleEditSave() {
        if (!editingId) return;
        setEditSaving(true);
        try {
            await updatePencatatan(editingId, {
                nama_pendonor: editForm.nama_pendonor.trim(),
                golongan_darah: editForm.golongan_darah,
                status_donor: editForm.status_donor,
                catatan: editForm.catatan.trim() || undefined,
            });
            setEditingId(null);
            if (selectedJadwal) loadPencatatan(selectedJadwal);
        } catch { /* silent */ }
        setEditSaving(false);
    }

    // Delete
    async function handleDelete(id: number) {
        if (!confirm('Hapus pencatatan ini?')) return;
        try {
            await deletePencatatan(id);
            if (selectedJadwal) loadPencatatan(selectedJadwal);
        } catch { /* silent */ }
    }

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
            {/* Header */}
            <header className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur-sm border-b border-white/5">
                <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/30">
                            <Droplets className="w-4 h-4 text-white fill-white" />
                        </div>
                        <div>
                            <div className="text-sm font-bold">SIPEDA</div>
                            <div className="text-[10px] text-gray-600">Pencatatan Donor</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 hidden sm:block">{petugasUser?.name ?? 'Petugas'}</span>
                        <button onClick={handleLogout} className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors" aria-label="Logout">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

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
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { label: 'Total', val: stats.total, cls: 'text-white' },
                            { label: 'Berhasil', val: stats.berhasil, cls: 'text-green-400' },
                            { label: 'Gagal', val: stats.gagal, cls: 'text-red-400' },
                            { label: 'Tdk Memenuhi', val: stats.tidak_memenuhi, cls: 'text-yellow-400' },
                        ].map(s => (
                            <div key={s.label} className="bg-gray-900 rounded-xl border border-white/5 p-3 text-center">
                                <div className={`text-xl font-bold ${s.cls}`}>{s.val}</div>
                                <div className="text-[10px] text-gray-600 mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add button / form */}
                {selectedJadwal && (
                    <>
                        {!formOpen ? (
                            <button
                                onClick={() => setFormOpen(true)}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Catat Pendonor
                            </button>
                        ) : (
                            <div className="bg-gray-900 rounded-xl border border-white/10 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <Users className="w-4 h-4 text-red-500" />
                                        Input Pendonor
                                    </h3>
                                    <button onClick={() => { setFormOpen(false); setLookupResult(null); setKodeInput(''); setLookupError(''); }} className="p-1 rounded-lg text-gray-600 hover:text-white hover:bg-white/5">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* B4: Mode toggle */}
                                <div className="grid grid-cols-2 gap-1.5 bg-gray-800 rounded-lg p-1 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => { setInputMode('kode'); setLookupResult(null); setForm(f => ({ ...f, nama_pendonor: '', golongan_darah: 'Tidak Tahu' })); }}
                                        className={`py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${inputMode === 'kode' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        <QrCode className="w-3.5 h-3.5" /> Kode Registrasi
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setInputMode('walkin'); setLookupResult(null); setKodeInput(''); setLookupError(''); }}
                                        className={`py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${inputMode === 'walkin' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        <UserPlus className="w-3.5 h-3.5" /> Walk-in
                                    </button>
                                </div>

                                {/* B4: Kode registrasi lookup */}
                                {inputMode === 'kode' && !lookupResult && (
                                    <div className="mb-4">
                                        <label className="block text-xs text-gray-500 mb-1">Kode Registrasi</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={kodeInput}
                                                onChange={e => setKodeInput(e.target.value.toUpperCase())}
                                                placeholder="REG-2026-XXXXX"
                                                className="flex-1 px-3 py-2.5 bg-gray-800 border border-white/10 rounded-lg text-sm text-white font-mono placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleLookup}
                                                disabled={lookupLoading || !kodeInput.trim()}
                                                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                                            >
                                                {lookupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {lookupError && (
                                            <p className="mt-2 text-xs text-red-400">{lookupError}</p>
                                        )}
                                    </div>
                                )}

                                {/* B4: Registrasi found — show info */}
                                {lookupResult && (
                                    <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Check className="w-4 h-4 text-green-400" />
                                            <span className="text-xs font-semibold text-green-400">Data registrasi ditemukan</span>
                                        </div>
                                        <div className="text-sm text-white font-medium">{lookupResult.nama}</div>
                                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                            <span>Goldar: {lookupResult.golongan_darah}</span>
                                            {lookupResult.nik && <span>NIK: {lookupResult.nik.slice(0, 6)}...{lookupResult.nik.slice(-4)}</span>}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setLookupResult(null); setKodeInput(''); setForm(f => ({ ...f, nama_pendonor: '', golongan_darah: 'Tidak Tahu' })); }}
                                            className="mt-2 text-xs text-gray-500 hover:text-white transition-colors"
                                        >
                                            ← Cari kode lain
                                        </button>
                                    </div>
                                )}

                                {formError && (
                                    <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">{formError}</div>
                                )}
                                {successMsg && (
                                    <div className="mb-3 p-2.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-400 flex items-center gap-2">
                                        <Check className="w-3.5 h-3.5" /> {successMsg}
                                    </div>
                                )}

                                {/* Show form when: walk-in mode, OR kode found */}
                                {(inputMode === 'walkin' || lookupResult) && (
                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        {/* Nama */}
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Nama Pendonor <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={form.nama_pendonor}
                                                onChange={e => setForm(f => ({ ...f, nama_pendonor: e.target.value }))}
                                                required
                                                placeholder="Nama lengkap pendonor"
                                                autoFocus={inputMode === 'walkin'}
                                                readOnly={!!lookupResult}
                                                className={`w-full px-3 py-2.5 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 ${lookupResult ? 'opacity-70' : ''}`}
                                            />
                                        </div>

                                        {/* Golongan Darah */}
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Golongan Darah <span className="text-red-500">*</span></label>
                                            <div className="grid grid-cols-5 gap-1.5">
                                                {GOLDAR_OPTIONS.map(g => (
                                                    <button
                                                        key={g}
                                                        type="button"
                                                        onClick={() => setForm(f => ({ ...f, golongan_darah: g }))}
                                                        className={`py-2 rounded-lg text-xs font-medium border transition-all ${form.golongan_darah === g
                                                            ? 'bg-red-600 border-red-600 text-white'
                                                            : 'bg-gray-800 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                                                            } ${g === 'Tidak Tahu' ? 'col-span-2' : ''}`}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Status Donor <span className="text-red-500">*</span></label>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {STATUS_OPTIONS.map(s => (
                                                    <button
                                                        key={s.value}
                                                        type="button"
                                                        onClick={() => setForm(f => ({ ...f, status_donor: s.value }))}
                                                        className={`py-2.5 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${form.status_donor === s.value
                                                            ? `${s.color} text-white`
                                                            : 'bg-gray-800 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                                                            }`}
                                                    >
                                                        <s.icon className="w-3.5 h-3.5" />
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Catatan */}
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Catatan <span className="text-gray-700">(opsional)</span></label>
                                            <textarea
                                                value={form.catatan}
                                                onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))}
                                                rows={2}
                                                placeholder="Catatan tambahan..."
                                                className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={saving || !form.nama_pendonor.trim()}
                                            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Check className="w-4 h-4" /> Simpan</>}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Pencatatan list */}
                {selectedJadwal && (
                    <div>
                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Pencatatan ({pencatatan.length})
                        </h3>

                        {loadingList ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                            </div>
                        ) : pencatatan.length === 0 ? (
                            <div className="bg-gray-900 rounded-xl border border-white/5 p-8 text-center text-sm text-gray-600">
                                Belum ada pencatatan untuk jadwal ini.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {pencatatan.map((p, idx) => (
                                    <div key={p.id}>
                                        {/* B3: Edit mode */}
                                        {editingId === p.id ? (
                                            <div className="bg-gray-900 rounded-xl border border-red-500/30 p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                                                        <Edit3 className="w-3.5 h-3.5" /> Edit Pencatatan
                                                    </span>
                                                    <button onClick={() => setEditingId(null)} className="p-1 text-gray-600 hover:text-white">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={editForm.nama_pendonor}
                                                    onChange={e => setEditForm(f => ({ ...f, nama_pendonor: e.target.value }))}
                                                    className="w-full px-3 py-2 bg-gray-800 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                                />
                                                <div className="grid grid-cols-5 gap-1">
                                                    {GOLDAR_OPTIONS.map(g => (
                                                        <button
                                                            key={g}
                                                            type="button"
                                                            onClick={() => setEditForm(f => ({ ...f, golongan_darah: g }))}
                                                            className={`py-1.5 rounded text-[10px] font-medium border transition-all ${editForm.golongan_darah === g
                                                                ? 'bg-red-600 border-red-600 text-white'
                                                                : 'bg-gray-800 border-white/10 text-gray-500'
                                                                } ${g === 'Tidak Tahu' ? 'col-span-2' : ''}`}
                                                        >
                                                            {g}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-3 gap-1">
                                                    {STATUS_OPTIONS.map(s => (
                                                        <button
                                                            key={s.value}
                                                            type="button"
                                                            onClick={() => setEditForm(f => ({ ...f, status_donor: s.value }))}
                                                            className={`py-1.5 rounded text-[10px] font-medium border transition-all flex items-center justify-center gap-1 ${editForm.status_donor === s.value
                                                                ? `${s.color} text-white`
                                                                : 'bg-gray-800 border-white/10 text-gray-500'
                                                                }`}
                                                        >
                                                            <s.icon className="w-3 h-3" />{s.label}
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={editForm.catatan}
                                                    onChange={e => setEditForm(f => ({ ...f, catatan: e.target.value }))}
                                                    rows={1}
                                                    placeholder="Catatan..."
                                                    className="w-full px-3 py-1.5 bg-gray-800 border border-white/10 rounded-lg text-xs text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                                />
                                                <button
                                                    onClick={handleEditSave}
                                                    disabled={editSaving || !editForm.nama_pendonor.trim()}
                                                    className="w-full py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5"
                                                >
                                                    {editSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                    {editSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                                </button>
                                            </div>
                                        ) : (
                                            /* Normal display */
                                            <div className="bg-gray-900 rounded-xl border border-white/5 px-4 py-3 flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500">
                                                    {pencatatan.length - idx}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-white truncate">{p.nama_pendonor}</div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-gray-500">{p.golongan_darah}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${STATUS_BADGE[p.status_donor]}`}>
                                                            {STATUS_LABEL[p.status_donor]}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => startEdit(p)}
                                                        className="p-1.5 rounded-lg text-gray-700 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                                                        aria-label="Edit"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                                        aria-label="Hapus"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

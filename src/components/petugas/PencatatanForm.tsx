'use client';

import { useState } from 'react';
import type { BloodType, StatusDonor } from '@/lib/types';
import type { RegistrasiLookup } from '@/lib/petugas-api';
import { lookupRegistrasiByKode, markRegistrasiHadir } from '@/lib/petugas-api';
import {
    Loader2, Check, X, AlertTriangle, Users,
    Search, QrCode, UserPlus,
} from 'lucide-react';

const GOLDAR_OPTIONS: (BloodType | 'Tidak Tahu')[] = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Tidak Tahu',
];

const STATUS_OPTIONS: { value: StatusDonor; label: string; icon: typeof Check; color: string }[] = [
    { value: 'berhasil', label: 'Berhasil', icon: Check, color: 'bg-green-600 hover:bg-green-700 border-green-600' },
    { value: 'gagal', label: 'Gagal', icon: X, color: 'bg-red-600 hover:bg-red-700 border-red-600' },
    { value: 'tidak_memenuhi_syarat', label: 'Tidak Memenuhi Syarat', icon: AlertTriangle, color: 'bg-yellow-600 hover:bg-yellow-700 border-yellow-600' },
];

type InputMode = 'kode' | 'walkin';

type PencatatanFormProps = {
    jadwalId: number;
    petugasId: number;
    onSaved: () => void;
    onCreatePencatatan: (data: {
        jadwal_id: number;
        nama_pendonor: string;
        golongan_darah: BloodType | 'Tidak Tahu';
        status_donor: StatusDonor;
        catatan?: string;
    }, petugasId: number) => Promise<unknown>;
};

export function PencatatanForm({ jadwalId, petugasId, onSaved, onCreatePencatatan }: PencatatanFormProps) {
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

    const [inputMode, setInputMode] = useState<InputMode>('kode');
    const [kodeInput, setKodeInput] = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupResult, setLookupResult] = useState<RegistrasiLookup | null>(null);
    const [lookupError, setLookupError] = useState('');

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
            setForm(f => ({
                ...f,
                nama_pendonor: result.nama,
                golongan_darah: (result.golongan_darah as BloodType | 'Tidak Tahu') || 'Tidak Tahu',
            }));
        }
        setLookupLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setFormError('');
        setSuccessMsg('');
        try {
            await onCreatePencatatan({
                jadwal_id: jadwalId,
                nama_pendonor: form.nama_pendonor.trim(),
                golongan_darah: form.golongan_darah,
                status_donor: form.status_donor,
                catatan: form.catatan.trim() || undefined,
            }, petugasId);

            if (lookupResult) {
                await markRegistrasiHadir(lookupResult.id).catch(() => { });
            }

            const savedName = form.nama_pendonor.trim();
            setForm({ nama_pendonor: '', golongan_darah: 'Tidak Tahu', status_donor: 'berhasil', catatan: '' });
            setLookupResult(null);
            setKodeInput('');
            setSuccessMsg(`${savedName} berhasil dicatat!`);
            setTimeout(() => setSuccessMsg(''), 3000);
            onSaved();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Gagal menyimpan');
        } finally {
            setSaving(false);
        }
    }

    if (!formOpen) {
        return (
            <button
                onClick={() => setFormOpen(true)}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-2xl text-base font-bold transition-all shadow-lg shadow-red-900/50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
                <span className="text-xl leading-none font-light">+</span> Catat Pendonor Baru
            </button>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-red-500" />
                    Input Pendonor
                </h3>
                <button onClick={() => { setFormOpen(false); setLookupResult(null); setKodeInput(''); setLookupError(''); }} className="p-1 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-2 bg-[#F4F4F5] p-1.5 rounded-2xl border border-gray-100 mb-6">
                <button
                    type="button"
                    onClick={() => { setInputMode('kode'); setLookupResult(null); setForm(f => ({ ...f, nama_pendonor: '', golongan_darah: 'Tidak Tahu' })); }}
                    className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${inputMode === 'kode' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}
                >
                    <QrCode className="w-4 h-4" /> Kode Pendaftaran
                </button>
                <button
                    type="button"
                    onClick={() => { setInputMode('walkin'); setLookupResult(null); setKodeInput(''); setLookupError(''); }}
                    className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${inputMode === 'walkin' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}
                >
                    <UserPlus className="w-4 h-4" /> Input Manual
                </button>
            </div>

            {/* Kode registrasi lookup */}
            {inputMode === 'kode' && !lookupResult && (
                <div className="mb-5">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Kode Registrasi</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={kodeInput}
                            onChange={e => setKodeInput(e.target.value.toUpperCase())}
                            placeholder="REG-2026-XXXXX"
                            className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-3.5 text-base font-mono font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all uppercase"
                        />
                        <button
                            type="button"
                            onClick={handleLookup}
                            disabled={lookupLoading || !kodeInput.trim()}
                            className="px-6 py-4 bg-gray-900 hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2"
                        >
                            {lookupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        </button>
                    </div>
                    {lookupError && <p className="mt-2 text-xs font-semibold text-red-500">{lookupError}</p>}
                </div>
            )}

            {/* Registrasi found */}
            {lookupResult && (
                <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Data Ditemukan</span>
                    </div>
                    <div className="text-base font-extrabold text-gray-900">{lookupResult.nama}</div>
                    <div className="flex items-center gap-3 text-xs font-semibold text-gray-600 mt-1">
                        <span>Goldar: <strong className="text-gray-900">{lookupResult.golongan_darah}</strong></span>
                        {lookupResult.nik && <span>NIK: {lookupResult.nik.slice(0, 6)}...{lookupResult.nik.slice(-4)}</span>}
                    </div>
                    <button
                        type="button"
                        onClick={() => { setLookupResult(null); setKodeInput(''); setForm(f => ({ ...f, nama_pendonor: '', golongan_darah: 'Tidak Tahu' })); }}
                        className="mt-3 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
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

            {/* Form fields */}
            {(inputMode === 'walkin' || lookupResult) && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">Nama Pendonor <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.nama_pendonor}
                            onChange={e => setForm(f => ({ ...f, nama_pendonor: e.target.value }))}
                            required
                            placeholder="Nama lengkap pendonor"
                            autoFocus={inputMode === 'walkin'}
                            readOnly={!!lookupResult}
                            className={`w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 placeholder:text-gray-300 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all ${lookupResult ? 'bg-gray-50 opacity-70 cursor-not-allowed' : 'bg-white'}`}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 mt-5">Golongan Darah <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                            {GOLDAR_OPTIONS.map(g => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, golongan_darah: g }))}
                                    className={`py-4 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 shadow-sm ${form.golongan_darah === g
                                        ? 'bg-red-50 border-red-500 text-red-700 shadow-red-500/20'
                                        : 'bg-white border-gray-100 text-gray-500 hover:text-gray-900 hover:border-gray-300'
                                        } ${g === 'Tidak Tahu' ? 'col-span-2 sm:col-span-2 text-xs' : ''}`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 mt-5">Status Donor <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {STATUS_OPTIONS.map(s => (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, status_donor: s.value }))}
                                    className={`py-4 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm ${form.status_donor === s.value
                                        ? `${s.color.replace('hover:bg', 'text-white border')} text-white shadow-md`
                                        : 'bg-white border-gray-100 text-gray-500 hover:text-gray-900 hover:border-gray-300'
                                        }`}
                                >
                                    <s.icon className={`w-5 h-5 ${form.status_donor !== s.value && s.value === 'berhasil' ? 'text-green-500' : form.status_donor !== s.value && s.value === 'gagal' ? 'text-red-500' : form.status_donor !== s.value && s.value === 'tidak_memenuhi_syarat' ? 'text-amber-500' : ''}`} />
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 mt-5">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
                        <textarea
                            value={form.catatan}
                            onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))}
                            rows={2}
                            placeholder="Catatan tambahan..."
                            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving || !form.nama_pendonor.trim()}
                        className="w-full mt-6 py-4 bg-gray-900 hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl text-base transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</> : <><Check className="w-5 h-5" /> Simpan Pencatatan</>}
                    </button>
                </form>
            )}
        </div>
    );
}

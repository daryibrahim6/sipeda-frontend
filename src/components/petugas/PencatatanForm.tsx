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
                className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
                <span className="w-4 h-4 text-lg leading-4">+</span> Catat Pendonor
            </button>
        );
    }

    return (
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

            {/* Mode toggle */}
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

            {/* Kode registrasi lookup */}
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
                    {lookupError && <p className="mt-2 text-xs text-red-400">{lookupError}</p>}
                </div>
            )}

            {/* Registrasi found */}
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

            {/* Form fields */}
            {(inputMode === 'walkin' || lookupResult) && (
                <form onSubmit={handleSubmit} className="space-y-3">
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
    );
}

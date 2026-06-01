'use client';

import { useState, useRef } from 'react';
import type { BloodType, StatusDonor } from '@/lib/types';
import type { RegistrasiLookup } from '@/lib/petugas-api';
import { lookupRegistrasiByKode, markRegistrasiHadir } from '@/lib/petugas-api';
import type { CreatePencatatanPayload } from '@/lib/petugas-api';
import {
    Loader2, Check, X, AlertTriangle,
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
    onCreatePencatatan: (data: CreatePencatatanPayload, petugasId: number) => Promise<unknown>;
};

export function PencatatanForm({ jadwalId, petugasId, onSaved, onCreatePencatatan }: PencatatanFormProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        nama_pendonor: '',
        golongan_darah: 'Tidak Tahu' as BloodType | 'Tidak Tahu',
        hemoglobin: '',
        tensi_sistolik: '',
        tensi_diastolik: '',
        berat_badan: '',
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
    const lookupReqId = useRef(0);

    async function handleLookup() {
        if (!kodeInput.trim()) return;
        const reqId = ++lookupReqId.current;
        setLookupLoading(true);
        setLookupError('');
        setLookupResult(null);

        const result = await lookupRegistrasiByKode(kodeInput.trim());
        if (reqId !== lookupReqId.current) return;
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
            const hb = parseFloat(form.hemoglobin);
            const sis = parseInt(form.tensi_sistolik);
            const dia = parseInt(form.tensi_diastolik);
            const bb = parseFloat(form.berat_badan);
            await onCreatePencatatan({
                jadwal_id: jadwalId,
                nama_pendonor: form.nama_pendonor.trim(),
                golongan_darah: form.golongan_darah,
                status_donor: form.status_donor,
                catatan: form.catatan.trim() || undefined,
                ...(form.hemoglobin && !isNaN(hb) && { hemoglobin: hb }),
                ...(form.tensi_sistolik && !isNaN(sis) && { tensi_sistolik: sis }),
                ...(form.tensi_diastolik && !isNaN(dia) && { tensi_diastolik: dia }),
                ...(form.berat_badan && !isNaN(bb) && { berat_badan: bb }),
                registrasi_id: lookupResult?.id,
            }, petugasId);

            if (lookupResult) {
                await markRegistrasiHadir(lookupResult.id).catch(err => console.error('[PencatatanForm] Gagal menandai hadir:', err));
            }

            const savedName = form.nama_pendonor.trim();
            setForm({ nama_pendonor: '', golongan_darah: 'Tidak Tahu', hemoglobin: '', tensi_sistolik: '', tensi_diastolik: '', berat_badan: '', status_donor: 'berhasil', catatan: '' });
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
                className="group w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-2xl text-base font-semibold transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/30 active:scale-[0.98] flex items-center justify-center gap-2"
            >
                <span className="text-xl leading-none font-light group-hover:scale-110 transition-transform">+</span> Catat Pendonor Baru
            </button>
        );
    }

    return (
        <div className="bg-white rounded-3xl shadow-[var(--shadow-card)] border border-[var(--color-border-muted)] p-6">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-[var(--color-primary)] rounded-full" />
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Input Pendonor</h3>
                </div>
                <button onClick={() => { setFormOpen(false); setLookupResult(null); setKodeInput(''); setLookupError(''); setForm(f => ({ ...f, hemoglobin: '', tensi_sistolik: '', tensi_diastolik: '', berat_badan: '' })); }} className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-section-alt)] transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-2 bg-[var(--color-section-alt)]/50 p-1 rounded-2xl border border-[var(--color-border-muted)] mb-6">
                <button
                    type="button"
                    onClick={() => { setInputMode('kode'); setLookupResult(null); setForm(f => ({ ...f, nama_pendonor: '', golongan_darah: 'Tidak Tahu', hemoglobin: '', tensi_sistolik: '', tensi_diastolik: '', berat_badan: '' })); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${inputMode === 'kode' ? 'bg-white text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border-muted)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
                >
                    <QrCode className="w-4 h-4" /> Kode Pendaftaran
                </button>
                <button
                    type="button"
                    onClick={() => { setInputMode('walkin'); setLookupResult(null); setKodeInput(''); setLookupError(''); setForm(f => ({ ...f, nama_pendonor: '', golongan_darah: 'Tidak Tahu', hemoglobin: '', tensi_sistolik: '', tensi_diastolik: '', berat_badan: '' })); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${inputMode === 'walkin' ? 'bg-white text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}
                >
                    <UserPlus className="w-4 h-4" /> Input Manual
                </button>
            </div>

            {/* Kode registrasi lookup */}
            {inputMode === 'kode' && !lookupResult && (
                <div className="mb-5">
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Kode Registrasi</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={kodeInput}
                            onChange={e => setKodeInput(e.target.value.toUpperCase())}
                            placeholder="REG-2026-XXXXX"
                            className="flex-1 rounded-2xl px-4 py-3 text-base font-mono font-bold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]/60 bg-white border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all uppercase"
                        />
                        <button
                            type="button"
                            onClick={handleLookup}
                            disabled={lookupLoading || !kodeInput.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-[var(--color-section-alt)] disabled:to-[var(--color-section-alt)] disabled:text-[var(--color-text-muted)] text-white rounded-2xl text-sm font-semibold transition-all shadow-md shadow-red-600/20 active:scale-[0.97] flex items-center gap-2"
                        >
                            {lookupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        </button>
                    </div>
                    {lookupError && <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1">• {lookupError}</p>}
                </div>
            )}

            {/* Registrasi found */}
            {lookupResult && (
                <div className="mb-5 bg-green-50 border border-green-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">Data Ditemukan</span>
                    </div>
                    <div className="text-base font-bold text-[var(--color-text-primary)]">{lookupResult.nama}</div>
                    <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mt-1">
                        <span>Goldar: <strong className="text-[var(--color-text-primary)]">{lookupResult.golongan_darah}</strong></span>
                        {lookupResult.nik && <span>NIK: {lookupResult.nik.slice(0, 6)}...{lookupResult.nik.slice(-4)}</span>}
                    </div>
                    <button
                        type="button"
                        onClick={() => { setLookupResult(null); setKodeInput(''); setForm(f => ({ ...f, nama_pendonor: '', golongan_darah: 'Tidak Tahu', hemoglobin: '', tensi_sistolik: '', tensi_diastolik: '', berat_badan: '' })); }}
                        className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                    >
                        ← Cari kode lain
                    </button>
                </div>
            )}

            {formError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-xs text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {formError}
                </div>
            )}
            {successMsg && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-xs text-green-700 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5" /> {successMsg}
                </div>
            )}

            {/* Form fields */}
            {(inputMode === 'walkin' || lookupResult) && (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-[var(--color-section-alt)]/50 rounded-3xl p-5 space-y-5">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-5 bg-[var(--color-primary)] rounded-full" />
                            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Data Pendonor</span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Nama Pendonor <span className="text-[var(--color-primary)]">*</span></label>
                            <input
                                type="text"
                                value={form.nama_pendonor}
                                onChange={e => setForm(f => ({ ...f, nama_pendonor: e.target.value }))}
                                required
                                placeholder="Nama lengkap pendonor"
                                autoFocus={inputMode === 'walkin'}
                                readOnly={!!lookupResult}
                                className={`w-full rounded-2xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] bg-white border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all ${lookupResult ? 'bg-[var(--color-section-alt)] text-[var(--color-text-muted)] cursor-not-allowed' : ''}`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Golongan Darah <span className="text-[var(--color-primary)]">*</span></label>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                {GOLDAR_OPTIONS.map(g => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, golongan_darah: g }))}
                                        className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all active:scale-[0.97] ${form.golongan_darah === g
                                            ? 'bg-red-50 border-red-500 text-red-700 shadow-sm'
                                            : 'bg-white border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]'
                                            } ${g === 'Tidak Tahu' ? 'col-span-2 sm:col-span-2 text-xs' : ''}`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* HB / Tensi / Berat Badan */}
                    <div className="bg-[var(--color-section-alt)]/50 rounded-3xl p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-5 bg-[var(--color-primary)] rounded-full" />
                            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Pemeriksaan Fisik <span className="text-[var(--color-text-muted)] font-normal">(opsional)</span></span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">HB (g/dL)</label>
                                <input
                                    type="number" step="0.1" min="5" max="20"
                                    value={form.hemoglobin}
                                    onChange={e => setForm(f => ({ ...f, hemoglobin: e.target.value }))}
                                    placeholder="12.5"
                                    className="w-full rounded-2xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] bg-white border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Tensi Sistolik</label>
                                <input
                                    type="number" min="80" max="220"
                                    value={form.tensi_sistolik}
                                    onChange={e => setForm(f => ({ ...f, tensi_sistolik: e.target.value }))}
                                    placeholder="120"
                                    className="w-full rounded-2xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] bg-white border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Tensi Diastolik</label>
                                <input
                                    type="number" min="40" max="140"
                                    value={form.tensi_diastolik}
                                    onChange={e => setForm(f => ({ ...f, tensi_diastolik: e.target.value }))}
                                    placeholder="80"
                                    className="w-full rounded-2xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] bg-white border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Berat Badan (kg)</label>
                            <input
                                type="number" step="0.5" min="30" max="200"
                                value={form.berat_badan}
                                onChange={e => setForm(f => ({ ...f, berat_badan: e.target.value }))}
                                placeholder="65"
                                className="w-full max-w-[160px] rounded-2xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] bg-white border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="bg-[var(--color-section-alt)]/50 rounded-3xl p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-5 bg-[var(--color-primary)] rounded-full" />
                            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Hasil Donor</span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Status Donor <span className="text-[var(--color-primary)]">*</span></label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {STATUS_OPTIONS.map(s => (
                                    <button
                                        key={s.value}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, status_donor: s.value }))}
                                        className={`py-3.5 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 active:scale-[0.97] ${form.status_donor === s.value
                                            ? `${s.color.replace('hover:bg', 'text-white border')} text-white shadow-md`
                                            : 'bg-white border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border)]'
                                            }`}
                                    >
                                        <s.icon className={`w-4 h-4 ${form.status_donor !== s.value && s.value === 'berhasil' ? 'text-green-500' : form.status_donor !== s.value && s.value === 'gagal' ? 'text-red-500' : form.status_donor !== s.value && s.value === 'tidak_memenuhi_syarat' ? 'text-amber-500' : ''}`} />
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Catatan <span className="text-[var(--color-text-muted)] font-normal">(opsional)</span></label>
                            <textarea
                                value={form.catatan}
                                onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))}
                                rows={2}
                                placeholder="Catatan tambahan..."
                                className="w-full rounded-2xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] bg-white border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all resize-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving || !form.nama_pendonor.trim()}
                        className="group w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-[var(--color-border)] disabled:to-[var(--color-border)] disabled:text-[var(--color-text-muted)] text-white font-semibold rounded-2xl text-base transition-all shadow-lg shadow-red-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</> : <><Check className="w-5 h-5" /> Simpan Pencatatan</>}
                    </button>
                </form>
            )}
        </div>
    );
}

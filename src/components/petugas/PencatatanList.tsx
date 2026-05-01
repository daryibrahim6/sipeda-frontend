'use client';

import { useState } from 'react';
import type { PencatatanDonor, BloodType, StatusDonor } from '@/lib/types';
import {
    Loader2, Check, X, AlertTriangle, Trash2, Edit3,
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

type PencatatanListProps = {
    pencatatan: PencatatanDonor[];
    loading: boolean;
    onUpdate: (id: number, data: {
        nama_pendonor: string;
        golongan_darah: BloodType | 'Tidak Tahu';
        status_donor: StatusDonor;
        catatan?: string;
    }) => Promise<unknown>;
    onDelete: (id: number) => Promise<unknown>;
    onRefresh: () => void;
};

export function PencatatanList({ pencatatan, loading, onUpdate, onDelete, onRefresh }: PencatatanListProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        nama_pendonor: '',
        golongan_darah: 'Tidak Tahu' as BloodType | 'Tidak Tahu',
        status_donor: 'berhasil' as StatusDonor,
        catatan: '',
    });
    const [editSaving, setEditSaving] = useState(false);

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
            await onUpdate(editingId, {
                nama_pendonor: editForm.nama_pendonor.trim(),
                golongan_darah: editForm.golongan_darah,
                status_donor: editForm.status_donor,
                catatan: editForm.catatan.trim() || undefined,
            });
            setEditingId(null);
            onRefresh();
        } catch { /* handled by parent */ }
        setEditSaving(false);
    }

    async function handleDelete(id: number) {
        if (!confirm('Hapus pencatatan ini?')) return;
        try {
            await onDelete(id);
            onRefresh();
        } catch { /* handled by parent */ }
    }

    return (
        <div>
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 mt-2">
                Pencatatan ({pencatatan.length})
            </h3>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                </div>
            ) : pencatatan.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-sm font-medium text-gray-500">
                    Belum ada pencatatan untuk jadwal ini.
                </div>
            ) : (
                <div className="space-y-2">
                    {pencatatan.map((p, idx) => (
                        <div key={p.id}>
                            {editingId === p.id ? (
                                <div className="bg-red-50 rounded-2xl border border-red-200 p-4 space-y-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                                            <Edit3 className="w-4 h-4" /> Edit Pencatatan
                                        </span>
                                        <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-gray-900 bg-white rounded-md shadow-sm">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={editForm.nama_pendonor}
                                        onChange={e => setEditForm(f => ({ ...f, nama_pendonor: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all"
                                    />
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {GOLDAR_OPTIONS.map(g => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setEditForm(f => ({ ...f, golongan_darah: g }))}
                                                className={`py-2 rounded-lg text-[10px] font-bold border-2 transition-all ${editForm.golongan_darah === g
                                                    ? 'bg-red-600 border-red-600 text-white shadow-sm'
                                                    : 'bg-white border-gray-100 text-gray-500 hover:text-gray-900 hover:border-gray-300'
                                                    } ${g === 'Tidak Tahu' ? 'col-span-2' : ''}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {STATUS_OPTIONS.map(s => (
                                            <button
                                                key={s.value}
                                                type="button"
                                                onClick={() => setEditForm(f => ({ ...f, status_donor: s.value }))}
                                                className={`py-2 rounded-lg text-[10px] font-bold border-2 transition-all flex items-center justify-center gap-1 ${editForm.status_donor === s.value
                                                    ? `${s.color.replace('hover:bg', 'text-white border')} text-white shadow-sm`
                                                    : 'bg-white border-gray-100 text-gray-500 hover:text-gray-900 hover:border-gray-300'
                                                    }`}
                                            >
                                                <s.icon className="w-3.5 h-3.5" />{s.label}
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={editForm.catatan}
                                        onChange={e => setEditForm(f => ({ ...f, catatan: e.target.value }))}
                                        rows={2}
                                        placeholder="Catatan..."
                                        className="w-full px-4 py-2 bg-white border-2 border-gray-100 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all resize-none"
                                    />
                                    <button
                                        onClick={handleEditSave}
                                        disabled={editSaving || !editForm.nama_pendonor.trim()}
                                        className="w-full py-3 bg-gray-900 hover:bg-red-600 disabled:bg-gray-300 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                                    >
                                        {editSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        {editSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3.5 flex items-center gap-4 transition-all hover:shadow-md">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-extrabold text-gray-500">
                                        {pencatatan.length - idx}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-gray-900 truncate">{p.nama_pendonor}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-bold text-gray-500">{p.golongan_darah}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${STATUS_BADGE[p.status_donor]}`}>
                                                {STATUS_LABEL[p.status_donor]}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => startEdit(p)}
                                            className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                            aria-label="Edit"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            aria-label="Hapus"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSidebarToggle } from '@/app/admin/layout';
import { TopBar } from '@/components/admin/TopBar';
import {
    Plus, Search, Pencil, X, Loader2, Check,
    MapPin, ChevronLeft, ChevronRight, Filter, RefreshCw,
    Power, PowerOff,
} from 'lucide-react';
import {
    getAdminLocations, createLocation, updateLocation, toggleLocationStatus,
    type AdminLocationPayload,
} from '@/lib/admin-api';
import type { Location, LocationType } from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const LOCATION_TYPES: LocationType[] = ['PMI', 'RS', 'Klinik', 'Puskesmas', 'Lainnya'];
const PER_PAGE = 15;

type FormData = {
    nama_lokasi: string;
    tipe: LocationType;
    alamat: string;
    kecamatan: string;
    kota: string;
    koordinat_lat: string;
    koordinat_lng: string;
    kontak: string;
    email: string;
    penanggung_jawab: string;
    deskripsi: string;
    aktif: boolean;
};

const EMPTY_FORM: FormData = {
    nama_lokasi: '', tipe: 'PMI', alamat: '', kecamatan: '', kota: 'Indramayu',
    koordinat_lat: '', koordinat_lng: '', kontak: '', email: '',
    penanggung_jawab: '', deskripsi: '', aktif: true,
};

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-sm font-medium ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {msg}
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
        </div>
    );
}

// ─── Toggle Modal ─────────────────────────────────────────────────────────────

function ToggleModal({ location, onConfirm, onCancel, loading }: {
    location: Location; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
    const willDeactivate = location.aktif;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                <div className="text-center mb-5">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${willDeactivate ? 'bg-amber-50' : 'bg-green-50'}`}>
                        {willDeactivate
                            ? <PowerOff className="w-6 h-6 text-amber-600" />
                            : <Power className="w-6 h-6 text-green-600" />
                        }
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">
                        {willDeactivate ? 'Nonaktifkan Lokasi?' : 'Aktifkan Lokasi?'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        <strong>{location.nama_lokasi}</strong> akan {willDeactivate
                            ? 'dinonaktifkan. Lokasi tidak akan muncul di peta publik dan dropdown jadwal.'
                            : 'diaktifkan kembali dan muncul di peta publik.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Batal
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${willDeactivate ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : willDeactivate ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        {willDeactivate ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

function FormModal({ editing, form, setForm, onSave, onClose, loading }: {
    editing: Location | null; form: FormData;
    setForm: React.Dispatch<React.SetStateAction<FormData>>;
    onSave: () => void; onClose: () => void; loading: boolean;
}) {
    const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all";
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">{editing ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}</h3>
                    <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-y-auto p-6 space-y-4 flex-1">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lokasi <span className="text-red-500">*</span></label>
                        <input type="text" required value={form.nama_lokasi} onChange={e => setForm(f => ({ ...f, nama_lokasi: e.target.value }))} placeholder="PMI Kabupaten Indramayu" className={inp} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe</label>
                            <select value={form.tipe} onChange={e => setForm(f => ({ ...f, tipe: e.target.value as LocationType }))} className={inp + ' bg-white'}>
                                {LOCATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                            <select value={form.aktif ? 'aktif' : 'nonaktif'} onChange={e => setForm(f => ({ ...f, aktif: e.target.value === 'aktif' }))} className={inp + ' bg-white'}>
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat <span className="text-red-500">*</span></label>
                        <input type="text" required value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))} placeholder="Jl. ..." className={inp} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kecamatan <span className="text-red-500">*</span></label>
                            <input type="text" required value={form.kecamatan} onChange={e => setForm(f => ({ ...f, kecamatan: e.target.value }))} placeholder="Indramayu" className={inp} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kota</label>
                            <input type="text" value={form.kota} onChange={e => setForm(f => ({ ...f, kota: e.target.value }))} placeholder="Indramayu" className={inp} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Latitude <span className="text-red-500">*</span></label>
                            <input type="number" step="any" required value={form.koordinat_lat} onChange={e => setForm(f => ({ ...f, koordinat_lat: e.target.value }))} placeholder="-6.327" className={inp} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Longitude <span className="text-red-500">*</span></label>
                            <input type="number" step="any" required value={form.koordinat_lng} onChange={e => setForm(f => ({ ...f, koordinat_lng: e.target.value }))} placeholder="108.324" className={inp} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 -mt-2">Buka Google Maps → klik kanan lokasi → salin koordinat.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kontak / Telepon</label>
                            <input type="text" value={form.kontak} onChange={e => setForm(f => ({ ...f, kontak: e.target.value }))} placeholder="0234-xxx" className={inp} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="info@..." className={inp} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Penanggung Jawab</label>
                        <input type="text" value={form.penanggung_jawab} onChange={e => setForm(f => ({ ...f, penanggung_jawab: e.target.value }))} placeholder="Nama PJ" className={inp} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
                        <textarea rows={2} value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} placeholder="Info tambahan (opsional)" className={inp + ' resize-none'} />
                    </div>
                </div>
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Batal</button>
                    <button onClick={onSave} disabled={loading || !form.nama_lokasi || !form.alamat || !form.kecamatan || !form.koordinat_lat || !form.koordinat_lng}
                        className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {editing ? 'Simpan Perubahan' : 'Tambah Lokasi'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminLokasiPage() {
    const toggle = useSidebarToggle();
    const [locations, setLocations] = useState<Location[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'semua' | 'aktif' | 'nonaktif'>('semua');
    const [dataLoading, setDataLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Location | null>(null);
    const [toggling, setToggling] = useState<Location | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const totalPages = Math.ceil(total / PER_PAGE);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const loadData = useCallback(async () => {
        setDataLoading(true);
        try {
            const res = await getAdminLocations({ page, perPage: PER_PAGE, search, status: statusFilter });
            setLocations(res.data);
            setTotal(res.total);
        } catch {
            showToast('Gagal memuat data lokasi.', 'error');
        } finally {
            setDataLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, search, statusFilter]);

    useEffect(() => { loadData(); }, [loadData]);

    function openCreate() {
        setEditing(null);
        setForm(EMPTY_FORM);
        setShowForm(true);
    }

    function openEdit(loc: Location) {
        setEditing(loc);
        setForm({
            nama_lokasi: loc.nama_lokasi,
            tipe: loc.tipe,
            alamat: loc.alamat,
            kecamatan: loc.kecamatan,
            kota: loc.kota,
            koordinat_lat: String(loc.koordinat_lat),
            koordinat_lng: String(loc.koordinat_lng),
            kontak: loc.kontak ?? '',
            email: loc.email ?? '',
            penanggung_jawab: loc.penanggung_jawab ?? '',
            deskripsi: loc.deskripsi ?? '',
            aktif: loc.aktif,
        });
        setShowForm(true);
    }

    async function handleSave() {
        setLoading(true);
        try {
            const payload: AdminLocationPayload = {
                nama_lokasi: form.nama_lokasi,
                tipe: form.tipe,
                alamat: form.alamat,
                kecamatan: form.kecamatan,
                kota: form.kota,
                koordinat_lat: parseFloat(form.koordinat_lat),
                koordinat_lng: parseFloat(form.koordinat_lng),
                kontak: form.kontak || undefined,
                email: form.email || undefined,
                penanggung_jawab: form.penanggung_jawab || undefined,
                deskripsi: form.deskripsi || undefined,
                aktif: form.aktif,
            };
            if (editing) {
                await updateLocation(editing.id, payload);
                showToast('Lokasi berhasil diperbarui.');
            } else {
                await createLocation(payload);
                showToast('Lokasi baru berhasil ditambahkan.');
            }
            setShowForm(false);
            setEditing(null);
            await loadData();
        } catch (err) {
            showToast((err as Error).message || 'Gagal menyimpan lokasi.', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function handleToggle() {
        if (!toggling) return;
        setLoading(true);
        try {
            await toggleLocationStatus(toggling.id, !toggling.aktif);
            setToggling(null);
            showToast(`Lokasi berhasil ${toggling.aktif ? 'dinonaktifkan' : 'diaktifkan'}.`);
            await loadData();
        } catch {
            showToast('Gagal mengubah status lokasi.', 'error');
        } finally {
            setLoading(false);
        }
    }

    const typeBadgeColor = (t: LocationType) => {
        switch (t) {
            case 'PMI': return 'bg-red-50 text-red-700 border-red-200';
            case 'RS': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Klinik': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Puskesmas': return 'bg-green-50 text-green-700 border-green-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="flex flex-col min-h-full">
            <TopBar
                title="Lokasi Donor"
                subtitle={`${total} lokasi total`}
                onMenuClick={toggle}
                actions={
                    <div className="flex gap-2">
                        <button onClick={loadData} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" title="Refresh">
                            <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin text-red-500' : ''}`} />
                        </button>
                        <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Tambah Lokasi</span>
                        </button>
                    </div>
                }
            />

            <main className="flex-1 p-4 sm:p-6 space-y-4">

                {/* Search + filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Cari nama, alamat, kecamatan..."
                            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        {(['semua', 'aktif', 'nonaktif'] as const).map(s => (
                            <button key={s}
                                onClick={() => { setStatusFilter(s); setPage(1); }}
                                className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'}`}>
                                {s === 'semua' ? 'Semua' : s === 'aktif' ? 'Aktif' : 'Nonaktif'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Lokasi</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden sm:table-cell">Kecamatan</th>
                                    <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Tipe</th>
                                    <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden lg:table-cell">Koordinat</th>
                                    <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                                    <th className="text-right px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {dataLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            {[...Array(6)].map((_, j) => (
                                                <td key={j} className="px-5 py-4">
                                                    <div className="h-4 bg-gray-100 animate-pulse rounded w-full" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : locations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-16 text-gray-400">
                                            <MapPin className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                                            {search ? 'Tidak ada lokasi yang cocok.' : 'Belum ada lokasi. Klik "Tambah Lokasi" untuk memulai.'}
                                        </td>
                                    </tr>
                                ) : locations.map(loc => (
                                    <tr key={loc.id} className={`hover:bg-gray-50/50 transition-colors ${!loc.aktif ? 'opacity-60' : ''}`}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <div className="font-semibold text-gray-900 text-sm">{loc.nama_lokasi}</div>
                                                    <div className="text-xs text-gray-400 line-clamp-1">{loc.alamat}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 hidden sm:table-cell text-gray-600">{loc.kecamatan}</td>
                                        <td className="px-5 py-4 hidden md:table-cell">
                                            <div className="flex justify-center">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeBadgeColor(loc.tipe)}`}>
                                                    {loc.tipe}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 hidden lg:table-cell text-center">
                                            <span className="text-xs font-mono text-gray-500">{loc.koordinat_lat.toFixed(4)}, {loc.koordinat_lng.toFixed(4)}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-center">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${loc.aktif
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : 'bg-gray-50 text-gray-500 border-gray-200'
                                                    }`}>
                                                    {loc.aktif ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(loc)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setToggling(loc)}
                                                    className={`p-2 rounded-lg transition-colors ${loc.aktif
                                                        ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                                                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                                        }`}
                                                    title={loc.aktif ? 'Nonaktifkan' : 'Aktifkan'}>
                                                    {loc.aktif ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                            <span className="text-xs text-gray-400">{total} lokasi · halaman {page} dari {totalPages}</span>
                            <div className="flex gap-1">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {showForm && (
                <FormModal editing={editing} form={form} setForm={setForm} onSave={handleSave}
                    onClose={() => { setShowForm(false); setEditing(null); }} loading={loading} />
            )}
            {toggling && (
                <ToggleModal location={toggling} onConfirm={handleToggle} onCancel={() => setToggling(null)} loading={loading} />
            )}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

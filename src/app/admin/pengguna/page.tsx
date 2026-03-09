'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSidebarToggle } from '@/app/admin/layout';
import { TopBar } from '@/components/admin/TopBar';
import {
    Plus, Search, Pencil, X, Loader2, Check,
    Users, ChevronLeft, ChevronRight, Filter, RefreshCw,
    Power, PowerOff, Shield, UserCheck, Eye, EyeOff,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminUser = {
    id: number;
    auth_user_id: string;
    name: string;
    email: string;
    role: 'superadmin' | 'admin' | 'petugas_lapangan';
    aktif: boolean;
    last_login: string | null;
    created_at: string;
};

type FormData = {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'petugas_lapangan' | 'superadmin';
};

const EMPTY_FORM: FormData = { name: '', email: '', password: '', role: 'petugas_lapangan' };

const ROLE_LABELS: Record<string, string> = {
    superadmin: 'Superadmin',
    admin: 'Admin',
    petugas_lapangan: 'Petugas Lapangan',
};
const ROLE_COLORS: Record<string, string> = {
    superadmin: 'bg-purple-50 text-purple-700 border-purple-200',
    admin: 'bg-blue-50 text-blue-700 border-blue-200',
    petugas_lapangan: 'bg-green-50 text-green-700 border-green-200',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? '';
}

async function apiCall(method: string, body?: Record<string, unknown>) {
    const res = await fetch('/api/admin/users', {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await getToken()}`,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Terjadi kesalahan.');
    return json;
}

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPenggunaPage() {
    const toggle = useSidebarToggle();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<'semua' | 'admin' | 'petugas_lapangan' | 'superadmin'>('semua');

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<AdminUser | null>(null);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [toggling, setToggling] = useState<AdminUser | null>(null);
    const [toggleLoading, setToggleLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiCall('GET');
            setUsers(res.data ?? []);
        } catch {
            showToast('Gagal memuat data pengguna.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Filter
    const filtered = users.filter(u => {
        if (roleFilter !== 'semua' && u.role !== roleFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        }
        return true;
    });

    function openCreate() {
        setEditing(null);
        setForm(EMPTY_FORM);
        setShowPw(false);
        setShowForm(true);
    }

    function openEdit(u: AdminUser) {
        setEditing(u);
        setForm({ name: u.name, email: u.email, password: '', role: u.role });
        setShowPw(false);
        setShowForm(true);
    }

    async function handleSave() {
        setSaving(true);
        try {
            if (editing) {
                await apiCall('PUT', {
                    id: editing.id,
                    name: form.name,
                    email: form.email,
                    role: form.role,
                    ...(form.password ? { password: form.password } : {}),
                });
                showToast('Pengguna berhasil diperbarui.');
            } else {
                if (!form.password) throw new Error('Password wajib diisi untuk akun baru.');
                await apiCall('POST', form);
                showToast('Pengguna baru berhasil ditambahkan.');
            }
            setShowForm(false);
            setEditing(null);
            await loadData();
        } catch (err) {
            showToast((err as Error).message, 'error');
        } finally {
            setSaving(false);
        }
    }

    async function handleToggle() {
        if (!toggling) return;
        setToggleLoading(true);
        try {
            await apiCall('PATCH', { id: toggling.id, aktif: !toggling.aktif });
            showToast(`Akun ${toggling.aktif ? 'dinonaktifkan' : 'diaktifkan'}.`);
            setToggling(null);
            await loadData();
        } catch (err) {
            showToast((err as Error).message, 'error');
        } finally {
            setToggleLoading(false);
        }
    }

    const inp = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all";

    return (
        <div className="flex flex-col min-h-full">
            <TopBar
                title="Kelola Pengguna"
                subtitle={`${users.length} pengguna terdaftar`}
                onMenuClick={toggle}
                actions={
                    <div className="flex gap-2">
                        <button onClick={loadData} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" title="Refresh">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
                        </button>
                        <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Tambah Pengguna</span>
                        </button>
                    </div>
                }
            />

            <main className="flex-1 p-4 sm:p-6 space-y-4">
                {/* Search + filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Cari nama atau email..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        {(['semua', 'superadmin', 'admin', 'petugas_lapangan'] as const).map(r => (
                            <button key={r}
                                onClick={() => setRoleFilter(r)}
                                className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${roleFilter === r ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'}`}>
                                {r === 'semua' ? 'Semua' : ROLE_LABELS[r]}
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
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Nama</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden sm:table-cell">Email</th>
                                    <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Role</th>
                                    <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                                    <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Login Terakhir</th>
                                    <th className="text-right px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    [...Array(4)].map((_, i) => (
                                        <tr key={i}>
                                            {[...Array(6)].map((_, j) => (
                                                <td key={j} className="px-5 py-4">
                                                    <div className="h-4 bg-gray-100 animate-pulse rounded w-full" />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-16 text-gray-400">
                                            <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                                            {search ? 'Tidak ada pengguna yang cocok.' : 'Belum ada pengguna.'}
                                        </td>
                                    </tr>
                                ) : filtered.map(u => (
                                    <tr key={u.id} className={`hover:bg-gray-50/50 transition-colors ${!u.aktif ? 'opacity-50' : ''}`}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                                                    {u.role === 'superadmin' ? <Shield className="w-4 h-4 text-purple-500" /> :
                                                        u.role === 'admin' ? <UserCheck className="w-4 h-4 text-blue-500" /> :
                                                            <Users className="w-4 h-4 text-green-500" />}
                                                </div>
                                                <span className="font-semibold text-gray-900">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-gray-500 hidden sm:table-cell">{u.email}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-center">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${ROLE_COLORS[u.role]}`}>
                                                    {ROLE_LABELS[u.role]}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-center">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${u.aktif
                                                    ? 'bg-green-50 text-green-700 border-green-200'
                                                    : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                                    {u.aktif ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center text-xs text-gray-400 hidden md:table-cell">
                                            {u.last_login
                                                ? new Date(u.last_login).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : '—'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEdit(u)} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setToggling(u)}
                                                    className={`p-2 rounded-lg transition-colors ${u.aktif
                                                        ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                                                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                                                    title={u.aktif ? 'Nonaktifkan' : 'Aktifkan'}>
                                                    {u.aktif ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowForm(false); setEditing(null); }} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">{editing ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
                            <button onClick={() => { setShowForm(false); setEditing(null); }} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama <span className="text-red-500">*</span></label>
                                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama lengkap" className={inp} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@sipeda.id" className={inp} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Password {!editing && <span className="text-red-500">*</span>}
                                    {editing && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
                                </label>
                                <div className="relative">
                                    <input type={showPw ? 'text' : 'password'} value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        placeholder={editing ? '••••••••' : 'Min. 6 karakter'} className={inp + ' pr-10'} />
                                    <button type="button" onClick={() => setShowPw(!showPw)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as FormData['role'] }))} className={inp + ' bg-white'}>
                                    <option value="petugas_lapangan">Petugas Lapangan</option>
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Superadmin</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                            <button onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Batal</button>
                            <button onClick={handleSave} disabled={saving || !form.name || !form.email || (!editing && !form.password)}
                                className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                {editing ? 'Simpan' : 'Tambah'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Modal */}
            {toggling && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setToggling(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
                        <div className="text-center mb-5">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${toggling.aktif ? 'bg-amber-50' : 'bg-green-50'}`}>
                                {toggling.aktif ? <PowerOff className="w-6 h-6 text-amber-600" /> : <Power className="w-6 h-6 text-green-600" />}
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">
                                {toggling.aktif ? 'Nonaktifkan Akun?' : 'Aktifkan Akun?'}
                            </h3>
                            <p className="text-sm text-gray-500">
                                <strong>{toggling.name}</strong> ({ROLE_LABELS[toggling.role]}) akan
                                {toggling.aktif ? ' dinonaktifkan dan tidak bisa login lagi.' : ' diaktifkan dan bisa login kembali.'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setToggling(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Batal</button>
                            <button onClick={handleToggle} disabled={toggleLoading}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${toggling.aktif ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                {toggleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : toggling.aktif ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                                {toggling.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}

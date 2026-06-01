'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSidebarToggle } from '@/lib/admin-context';
import { TopBar } from '@/components/admin/TopBar';
import {
  Plus, Search, Pencil, Trash2, X, Loader2, Check,
  Megaphone, ChevronLeft, ChevronRight, RefreshCw,
} from 'lucide-react';
import {
  getAdminAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  type AdminAnnouncement, type AdminAnnouncementPayload,
} from '@/lib/admin-api';
import { requireAdminAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

function SkeletonRow() {
  return (
    <tr>
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-5 py-4"><div className="h-4 bg-[var(--color-section-alt)] animate-pulse-soft rounded" /></td>
      ))}
    </tr>
  );
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-sm font-medium ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}>
      {type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {msg}
      <button onClick={onClose} className="p-2"><X className="w-3.5 h-3.5 opacity-70" /></button>
    </div>
  );
}

function DeleteModal({ announcement, onConfirm, onCancel, loading }: {
  announcement: AdminAnnouncement; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-[var(--shadow-elevated)] p-6 w-full max-w-sm text-center">
        <div className="w-14 h-14 bg-[var(--color-primary-subtle)] rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-[var(--color-primary)]" />
        </div>
        <h3 className="font-bold text-[var(--color-text-primary)] mb-2">Hapus Pengumuman?</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-6 line-clamp-2">&quot;{announcement.judul}&quot;</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-[var(--color-border-muted)] rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-section-alt)]">Batal</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

type FormData = {
  judul: string; isi: string; tipe: string;
  link: string; link_teks: string; aktif: boolean;
};

const EMPTY_FORM: FormData = {
  judul: '', isi: '', tipe: 'info',
  link: '', link_teks: '', aktif: true,
};

const TIPE_LABEL: Record<string, string> = {
  darurat: 'Darurat',
  info: 'Info',
  sukses: 'Sukses',
  peringatan: 'Peringatan',
};

const TIPE_CLASS: Record<string, string> = {
  darurat: 'bg-red-50 text-red-700 border border-red-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  sukses: 'bg-green-50 text-green-700 border border-green-200',
  peringatan: 'bg-amber-50 text-amber-700 border border-amber-200',
};

function FormModal({ editing, form, setForm, onSave, onClose, loading }: {
  editing: AdminAnnouncement | null; form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  onSave: () => void; onClose: () => void; loading: boolean;
}) {
  const inputClass = "w-full border border-[var(--color-border-muted)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-[var(--color-primary)] transition-all";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-[var(--shadow-elevated)] w-full max-w-xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-muted)] flex-shrink-0">
          <h3 className="font-bold text-[var(--color-text-primary)]">{editing ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}</h3>
          <button onClick={onClose} className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-section-alt)]"><X className="w-4 h-4" /></button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Judul <span className="text-red-500">*</span></label>
            <input type="text" required value={form.judul}
              onChange={e => setForm(f => ({ ...f, judul: e.target.value }))}
              placeholder="Judul pengumuman..." className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Isi Pengumuman <span className="text-red-500">*</span></label>
            <textarea rows={4} value={form.isi}
              onChange={e => setForm(f => ({ ...f, isi: e.target.value }))}
              placeholder="Isi / deskripsi pengumuman..."
              className={inputClass + ' resize-none'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Tipe <span className="text-red-500">*</span></label>
              <select value={form.tipe}
                onChange={e => setForm(f => ({ ...f, tipe: e.target.value }))}
                className={inputClass + ' bg-white'}>
                <option value="info">Info</option>
                <option value="sukses">Sukses</option>
                <option value="peringatan">Peringatan</option>
                <option value="darurat">Darurat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Status</label>
              <div className="flex items-center h-full pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.aktif}
                    onChange={e => setForm(f => ({ ...f, aktif: e.target.checked }))}
                    className="w-4 h-4 accent-red-600 rounded" />
                  <span className="text-sm text-[var(--color-text-secondary)] font-medium">Aktif</span>
                </label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Link (opsional)</label>
              <input type="text" value={form.link}
                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Teks Link (opsional)</label>
              <input type="text" value={form.link_teks}
                onChange={e => setForm(f => ({ ...f, link_teks: e.target.value }))}
                placeholder="Selengkapnya" className={inputClass} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-[var(--color-border-muted)] flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--color-border-muted)] rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-section-alt)]">Batal</button>
          <button onClick={onSave} disabled={loading || !form.judul || !form.isi}
            className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {editing ? 'Simpan Perubahan' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

const PER_PAGE = 10;

export default function AdminPengumumanPage() {
  const toggle = useSidebarToggle();
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tipeFilter, setTipeFilter] = useState('semua');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminAnnouncement | null>(null);
  const [deleting, setDeleting] = useState<AdminAnnouncement | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { requireAdminAuth(); }, []);

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const fetchData = useCallback(async (p = page, s = search, tf = tipeFilter) => {
    setLoading(true);
    try {
      const result = await getAdminAnnouncements({ page: p, perPage: PER_PAGE, search: s, tipe: tf });
      setAnnouncements(result.data);
      setTotal(result.total);
    } catch {
      showToast('Gagal memuat data pengumuman.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, tipeFilter]);

  useEffect(() => { fetchData(); }, [page, fetchData]);
  useEffect(() => { setPage(1); fetchData(1, search, tipeFilter); }, [search, tipeFilter, fetchData]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  }

  function openEdit(a: AdminAnnouncement) {
    setEditing(a);
    setForm({
      judul: a.judul, isi: a.isi, tipe: a.tipe,
      link: a.link ?? '', link_teks: a.link_teks ?? '',
      aktif: a.aktif,
    });
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: AdminAnnouncementPayload = {
        judul: form.judul, isi: form.isi,
        tipe: form.tipe as AdminAnnouncementPayload['tipe'],
        link: form.link || undefined,
        link_teks: form.link_teks || undefined,
        aktif: form.aktif,
      };
      if (editing) {
        await updateAnnouncement(editing.id, payload);
        showToast('Pengumuman berhasil diperbarui.');
      } else {
        await createAnnouncement(payload);
        showToast('Pengumuman berhasil disimpan.');
      }
      setShowForm(false);
      setEditing(null);
      fetchData(1, search, tipeFilter);
      setPage(1);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal menyimpan.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    try {
      await deleteAnnouncement(deleting.id);
      setDeleting(null);
      showToast('Pengumuman berhasil dihapus.');
      fetchData(page, search, tipeFilter);
    } catch {
      showToast('Gagal menghapus pengumuman.', 'error');
    } finally {
      setSaving(false);
    }
  }

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Pengumuman"
        subtitle={`${total} pengumuman total`}
        onMenuClick={toggle}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => fetchData()} title="Refresh" icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />} />
            <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>
              <span className="hidden sm:inline">Buat Pengumuman</span>
            </Button>
          </div>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input type="text" placeholder="Cari judul pengumuman..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-border-muted)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30" />
          </div>
          <select value={tipeFilter} onChange={e => setTipeFilter(e.target.value)}
            className="border border-[var(--color-border-muted)] rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-red-500/30 bg-white">
            <option value="semua">Semua Tipe</option>
            <option value="darurat">Darurat</option>
            <option value="info">Info</option>
            <option value="sukses">Sukses</option>
            <option value="peringatan">Peringatan</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--color-border-muted)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-muted)] bg-[var(--color-section-alt)]/50">
                  <th className="text-left px-5 py-3.5 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wide">Judul</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wide hidden sm:table-cell">Tipe</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wide hidden md:table-cell">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wide hidden lg:table-cell">Tanggal</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-muted)]">
                {loading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : announcements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-[var(--color-text-muted)]">
                      <Megaphone className="w-10 h-10 mx-auto mb-3 text-[var(--color-border-muted)]" />
                      {search ? 'Tidak ada pengumuman yang cocok.' : 'Belum ada pengumuman.'}
                    </td>
                  </tr>
                ) : announcements.map(a => (
                  <tr key={a.id} className="hover:bg-[var(--color-section-alt)]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[var(--color-text-primary)] leading-snug line-clamp-1 max-w-xs">{a.judul}</div>
                      {a.isi && <div className="text-xs text-[var(--color-text-muted)] line-clamp-1 mt-0.5">{a.isi}</div>}
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${TIPE_CLASS[a.tipe]}`}>{TIPE_LABEL[a.tipe]}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${a.aktif ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-[var(--color-section-alt)] text-[var(--color-text-muted)]'}`}>
                        {a.aktif ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-xs text-[var(--color-text-muted)]">{formatDate(a.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(a)}
                          className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleting(a)}
                          className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--color-border-muted)]">
              <span className="text-xs text-[var(--color-text-muted)]">{total} pengumuman · halaman {page} dari {totalPages}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-section-alt)] disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-section-alt)] disabled:opacity-30">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <FormModal
          editing={editing} form={form} setForm={setForm}
          onSave={handleSave} onClose={() => { setShowForm(false); setEditing(null); }}
          loading={saving}
        />
      )}
      {deleting && (
        <DeleteModal announcement={deleting} onConfirm={handleDelete}
          onCancel={() => setDeleting(null)} loading={saving} />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

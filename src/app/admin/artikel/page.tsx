'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSidebarToggle } from '@/app/admin/layout';
import { TopBar } from '@/components/admin/TopBar';
import {
  Plus, Search, Pencil, Trash2, X, Loader2, Check,
  FileText, Eye, ChevronLeft, ChevronRight, RefreshCw,
} from 'lucide-react';
import {
  getAdminArtikel, createArtikel, updateArtikel, deleteArtikel,
  getKategoriArtikel, type AdminArtikel, type AdminArtikelPayload,
} from '@/lib/admin-api';
import { requireAdminAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-5 py-4"><div className="h-4 bg-gray-100 animate-pulse rounded" /></td>
      ))}
    </tr>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-sm font-medium ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}>
      {type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {msg}
      <button onClick={onClose}><X className="w-3.5 h-3.5 opacity-70" /></button>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ article, onConfirm, onCancel, loading }: {
  article: AdminArtikel; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2">Hapus Artikel?</h3>
        <p className="text-sm text-gray-500 mb-6 line-clamp-2">&quot;{article.judul}&quot;</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
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

// ─── Form Modal ───────────────────────────────────────────────────────────────
type FormData = {
  judul: string; slug: string; kategori_id: string; penulis: string;
  excerpt: string; konten: string; unggulan: boolean;
  tampilkan_beranda: boolean; status: 'draft' | 'published' | 'archived';
};

const EMPTY_FORM: FormData = {
  judul: '', slug: '', kategori_id: '1', penulis: 'Admin SIPEDA',
  excerpt: '', konten: '', unggulan: false, tampilkan_beranda: false, status: 'published',
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

function FormModal({ editing, form, setForm, onSave, onClose, loading, kategoris }: {
  editing: AdminArtikel | null; form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  onSave: () => void; onClose: () => void; loading: boolean;
  kategoris: { id: number; nama: string }[];
}) {
  const inputClass = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-900">{editing ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h3>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Judul <span className="text-red-500">*</span></label>
            <input type="text" required value={form.judul}
              onChange={e => setForm(f => ({ ...f, judul: e.target.value, slug: editing ? f.slug : slugify(e.target.value) }))}
              placeholder="Tulis judul yang menarik..." className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug URL</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-500">
              <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-xs border-r border-gray-200 flex-shrink-0">/artikel/</span>
              <input type="text" value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                className="flex-1 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
              <select value={form.kategori_id}
                onChange={e => setForm(f => ({ ...f, kategori_id: e.target.value }))}
                className={inputClass + ' bg-white'}>
                {kategoris.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as FormData['status'] }))}
                className={inputClass + ' bg-white'}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Penulis <span className="text-red-500">*</span></label>
            <input type="text" required value={form.penulis}
              onChange={e => setForm(f => ({ ...f, penulis: e.target.value }))}
              className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Excerpt / Ringkasan</label>
            <textarea rows={2} value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              placeholder="Rangkuman singkat (tampil di daftar artikel)"
              className={inputClass + ' resize-none'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Konten</label>
            <textarea rows={8} value={form.konten}
              onChange={e => setForm(f => ({ ...f, konten: e.target.value }))}
              placeholder="Konten artikel. HTML sederhana didukung (<h2>, <p>, <ul>)."
              className={inputClass + ' resize-y font-mono text-xs'} />
          </div>
          <div className="flex gap-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.unggulan}
                onChange={e => setForm(f => ({ ...f, unggulan: e.target.checked }))}
                className="w-4 h-4 accent-red-600 rounded" />
              <span className="text-sm text-gray-700 font-medium">Artikel unggulan ★</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.tampilkan_beranda}
                onChange={e => setForm(f => ({ ...f, tampilkan_beranda: e.target.checked }))}
                className="w-4 h-4 accent-red-600 rounded" />
              <span className="text-sm text-gray-700 font-medium">Tampil di beranda</span>
            </label>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
          <button onClick={onSave} disabled={loading || !form.judul || !form.penulis}
            className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {editing ? 'Simpan Perubahan' : 'Simpan & Publikasikan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const PER_PAGE = 10;

export default function AdminArtikelPage() {
  const toggle = useSidebarToggle();
  const [articles, setArticles] = useState<AdminArtikel[]>([]);
  const [total, setTotal] = useState(0);
  const [kategoris, setKategoris] = useState<{ id: number; nama: string }[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminArtikel | null>(null);
  const [deleting, setDeleting] = useState<AdminArtikel | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Auth guard (middleware disabled — Supabase v2 uses localStorage)
  useEffect(() => { requireAdminAuth(); }, []);

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const fetchData = useCallback(async (p = page, s = search, sf = statusFilter) => {
    setLoading(true);
    try {
      const [result, cats] = await Promise.all([
        getAdminArtikel({ page: p, perPage: PER_PAGE, search: s, status: sf }),
        kategoris.length === 0 ? getKategoriArtikel() : Promise.resolve(kategoris),
      ]);
      setArticles(result.data);
      setTotal(result.total);
      if (cats.length > 0) setKategoris(cats);
    } catch {
      showToast('Gagal memuat data artikel.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, kategoris]);

  useEffect(() => { fetchData(); }, [page]); // eslint-disable-line
  useEffect(() => { setPage(1); fetchData(1, search, statusFilter); }, [search, statusFilter]); // eslint-disable-line

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, kategori_id: String(kategoris[0]?.id ?? 1) });
    setShowForm(true);
  }

  function openEdit(a: AdminArtikel) {
    setEditing(a);
    setForm({
      judul: a.judul, slug: a.slug,
      kategori_id: String(a.kategori.id),
      penulis: a.penulis, excerpt: a.excerpt ?? '',
      konten: a.konten, unggulan: a.unggulan,
      tampilkan_beranda: a.tampilkan_beranda, status: a.status,
    });
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: AdminArtikelPayload = {
        judul: form.judul, slug: form.slug,
        kategori_id: parseInt(form.kategori_id),
        penulis: form.penulis, excerpt: form.excerpt,
        konten: form.konten, unggulan: form.unggulan,
        tampilkan_beranda: form.tampilkan_beranda, status: form.status,
      };
      if (editing) {
        await updateArtikel(editing.id, payload);
        showToast('Artikel berhasil diperbarui.');
      } else {
        await createArtikel(payload);
        showToast('Artikel berhasil disimpan.');
      }
      setShowForm(false);
      setEditing(null);
      fetchData(1, search, statusFilter);
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
      await deleteArtikel(deleting.id);
      setDeleting(null);
      showToast('Artikel berhasil dihapus.');
      fetchData(page, search, statusFilter);
    } catch {
      showToast('Gagal menghapus artikel.', 'error');
    } finally {
      setSaving(false);
    }
  }

  const totalPages = Math.ceil(total / PER_PAGE);

  const statusBadge = (s: string) => {
    if (s === 'published') return 'bg-green-50 text-green-700 border border-green-200';
    if (s === 'draft') return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Artikel"
        subtitle={`${total} artikel total`}
        onMenuClick={toggle}
        actions={
          <div className="flex gap-2">
            <button onClick={() => fetchData()} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={openCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tulis Artikel</span>
            </button>
          </div>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Cari judul artikel..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
            <option value="semua">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Judul</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden sm:table-cell">Kategori</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden lg:table-cell">Tanggal</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : articles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-400">
                      <FileText className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                      {search ? 'Tidak ada artikel yang cocok.' : 'Belum ada artikel.'}
                    </td>
                  </tr>
                ) : articles.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        {a.unggulan && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5">★</span>}
                        <div>
                          <div className="font-semibold text-gray-900 leading-snug line-clamp-1 max-w-xs">{a.judul}</div>
                          {a.excerpt && <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">{a.excerpt}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">{a.kategori.nama}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusBadge(a.status)}`}>{a.status}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-xs text-gray-500">{formatDate(a.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <a href={`/artikel/${a.slug}`} target="_blank"
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Lihat di situs">
                          <Eye className="w-4 h-4" />
                        </a>
                        <button onClick={() => openEdit(a)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleting(a)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus">
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
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">{total} artikel · halaman {page} dari {totalPages}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30">
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
          loading={saving} kategoris={kategoris}
        />
      )}
      {deleting && (
        <DeleteModal article={deleting} onConfirm={handleDelete}
          onCancel={() => setDeleting(null)} loading={saving} />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
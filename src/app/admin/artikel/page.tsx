'use client';

import { useState, useMemo } from 'react';
import { useSidebarToggle } from '@/app/admin/layout';
import { TopBar } from '@/components/admin/TopBar';
import {
  Plus, Search, Pencil, Trash2, X, Loader2, Check,
  FileText, Eye, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { MOCK_ARTICLES } from '@/lib/mockData';
import type { Article } from '@/lib/types';
import { formatDate } from '@/lib/utils';

type FormData = {
  judul:         string;
  slug:          string;
  kategori_nama: string;
  penulis:       string;
  excerpt:       string;
  konten:        string;
  unggulan:      boolean;
};

const EMPTY_FORM: FormData = {
  judul:         '',
  slug:          '',
  kategori_nama: 'Edukasi',
  penulis:       '',
  excerpt:       '',
  konten:        '',
  unggulan:      false,
};

const KATEGORIS = ['Edukasi', 'Kesehatan', 'Panduan', 'Tips', 'Berita', 'Pengumuman'];
const PER_PAGE  = 8;

function slugify(text: string) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-sm font-medium ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {msg}
      <button onClick={onClose}><X className="w-3.5 h-3.5 opacity-70" /></button>
    </div>
  );
}

function DeleteModal({ article, onConfirm, onCancel, loading }: {
  article: Article;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="font-bold text-gray-900 mb-2">Hapus Artikel?</h3>
        <p className="text-sm text-gray-500 mb-6 line-clamp-2">"{article.judul}"</p>
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

function FormModal({
  editing, form, setForm, onSave, onClose, loading,
}: {
  editing: Article | null;
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  onSave: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  const inputClass = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all";

  function handleJudulChange(e: React.ChangeEvent<HTMLInputElement>) {
    const judul = e.target.value;
    setForm(f => ({
      ...f,
      judul,
      slug: editing ? f.slug : slugify(judul),
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-900">{editing ? 'Edit Artikel' : 'Tulis Artikel Baru'}</h3>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">

          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Judul Artikel <span className="text-red-500">*</span>
            </label>
            <input type="text" required value={form.judul}
              onChange={handleJudulChange}
              placeholder="Tulis judul yang menarik..."
              className={inputClass} />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug URL</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-500">
              <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-xs border-r border-gray-200 flex-shrink-0">/artikel/</span>
              <input type="text" value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                className="flex-1 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none" />
            </div>
          </div>

          {/* Kategori + Penulis */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
              <select value={form.kategori_nama}
                onChange={e => setForm(f => ({ ...f, kategori_nama: e.target.value }))}
                className={inputClass + ' bg-white'}>
                {KATEGORIS.map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Penulis <span className="text-red-500">*</span>
              </label>
              <input type="text" required value={form.penulis}
                onChange={e => setForm(f => ({ ...f, penulis: e.target.value }))}
                placeholder="Nama penulis"
                className={inputClass} />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ringkasan / Excerpt</label>
            <textarea rows={2} value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              placeholder="Ringkasan singkat artikel (tampil di list)"
              className={inputClass + ' resize-none'} />
          </div>

          {/* Konten */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Konten Artikel</label>
            <textarea rows={8} value={form.konten}
              onChange={e => setForm(f => ({ ...f, konten: e.target.value }))}
              placeholder="Tulis konten artikel di sini. HTML sederhana didukung (<h2>, <p>, <ul>, <li>)."
              className={inputClass + ' resize-y font-mono text-xs'} />
          </div>

          {/* Unggulan */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.unggulan}
              onChange={e => setForm(f => ({ ...f, unggulan: e.target.checked }))}
              className="w-4 h-4 accent-red-600 rounded" />
            <span className="text-sm text-gray-700 font-medium">Tandai sebagai artikel unggulan</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
          <button onClick={onSave}
            disabled={loading || !form.judul || !form.penulis}
            className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {editing ? 'Simpan Perubahan' : 'Publikasikan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminArtikelPage() {
  const toggle = useSidebarToggle();

  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<Article | null>(null);
  const [deleting, setDeleting] = useState<Article | null>(null);
  const [form,     setForm]     = useState<FormData>(EMPTY_FORM);
  const [loading,  setLoading]  = useState(false);
  const [toast,    setToast]    = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const filtered = useMemo(() =>
    articles.filter(a =>
      search === '' ||
      a.judul.toLowerCase().includes(search.toLowerCase()) ||
      a.kategori_nama.toLowerCase().includes(search.toLowerCase()) ||
      a.penulis.toLowerCase().includes(search.toLowerCase())
    ), [articles, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(a: Article) {
    setEditing(a);
    setForm({
      judul:         a.judul,
      slug:          a.slug,
      kategori_nama: a.kategori_nama,
      penulis:       a.penulis,
      excerpt:       a.excerpt ?? '',
      konten:        a.konten  ?? '',
      unggulan:      a.unggulan,
    });
    setShowForm(true);
  }

  async function handleSave() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    if (editing) {
      setArticles(prev => prev.map(a => a.id === editing.id ? {
        ...a, ...form, kategori_id: a.kategori_id,
        gambar: a.gambar, gambar_alt: a.gambar_alt,
        views: a.views, published_at: a.published_at,
      } : a));
      showToast('Artikel berhasil diperbarui.');
    } else {
      const newArticle: Article = {
        id:            Math.max(...articles.map(a => a.id)) + 1,
        ...form,
        kategori_id:   1,
        gambar:        null,
        gambar_alt:    null,
        views:         0,
        published_at:  new Date().toISOString(),
      };
      setArticles(prev => [newArticle, ...prev]);
      showToast('Artikel berhasil dipublikasikan.');
    }

    setLoading(false);
    setShowForm(false);
    setEditing(null);
  }

  async function handleDelete() {
    if (!deleting) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setArticles(prev => prev.filter(a => a.id !== deleting.id));
    setDeleting(null);
    setLoading(false);
    showToast('Artikel berhasil dihapus.');
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Artikel"
        subtitle={`${articles.length} artikel dipublikasikan`}
        onMenuClick={toggle}
        actions={
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tulis Artikel</span>
          </button>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-4">

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari judul, kategori, penulis..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Judul</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden sm:table-cell">Kategori</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Penulis</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden lg:table-cell">Views</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden lg:table-cell">Tanggal</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400">
                      <FileText className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                      {search ? 'Tidak ada artikel yang cocok.' : 'Belum ada artikel.'}
                    </td>
                  </tr>
                ) : paginated.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        {a.unggulan && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                            ★
                          </span>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900 leading-snug line-clamp-2 max-w-xs">{a.judul}</div>
                          {a.excerpt && (
                            <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">{a.excerpt}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        {a.kategori_nama}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-gray-600 text-xs">{a.penulis}</td>
                    <td className="px-5 py-4 hidden lg:table-cell text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                        <Eye className="w-3 h-3" />
                        {a.views.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-xs text-gray-500">
                      {formatDate(a.published_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <a href={`/artikel/${a.slug}`} target="_blank"
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Lihat di situs">
                          <Eye className="w-4 h-4" />
                        </a>
                        <button onClick={() => openEdit(a)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleting(a)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus">
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
              <span className="text-xs text-gray-400">
                {filtered.length} artikel · halaman {page} dari {totalPages}
              </span>
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
          editing={editing}
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
          loading={loading}
        />
      )}

      {deleting && (
        <DeleteModal
          article={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={loading}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
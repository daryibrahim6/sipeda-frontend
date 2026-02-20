'use client';

import { useState, useMemo } from 'react';
import { useSidebarToggle } from '@/app/admin/layout';
import { TopBar } from '@/components/admin/TopBar';
import {
  Plus, Search, Pencil, Trash2, X, Loader2, Check,
  Calendar, ChevronLeft, ChevronRight, Filter,
} from 'lucide-react';
import { MOCK_SCHEDULES, MOCK_LOCATIONS } from '@/lib/mockData';
import type { Schedule, ScheduleStatus } from '@/lib/types';
import { formatDate, formatTime, scheduleStatusLabel, scheduleStatusColor } from '@/lib/utils';

type FormData = {
  lokasi_id:     string;
  tanggal:       string;
  waktu_mulai:   string;
  waktu_selesai: string;
  kuota:         string;
  deskripsi:     string;
  status:        ScheduleStatus;
};

const EMPTY_FORM: FormData = {
  lokasi_id:     '',
  tanggal:       '',
  waktu_mulai:   '08:00',
  waktu_selesai: '14:00',
  kuota:         '50',
  deskripsi:     '',
  status:        'aktif',
};

const STATUS_OPTIONS: ScheduleStatus[] = ['aktif', 'penuh', 'dibatalkan', 'selesai'];
const PER_PAGE = 8;

// ─── Toast — FIX: pakai style inline animation bukan tailwindcss-animate ──────
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-sm font-medium ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
      style={{ animation: 'toastIn 0.25s ease-out' }}
    >
      {type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ schedule, onConfirm, onCancel, loading }: {
  schedule: Schedule;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Hapus Jadwal?</h3>
          <p className="text-sm text-gray-500">
            Jadwal di <strong>{schedule.lokasi?.nama_lokasi}</strong> pada{' '}
            <strong>{formatDate(schedule.tanggal)}</strong> akan dihapus permanen.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Form Modal ────────────────────────────────────────────────────────────────
function FormModal({
  editing, form, setForm, onSave, onClose, loading,
}: {
  editing: Schedule | null;
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  onSave: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  const inputClass = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{editing ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</h3>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Lokasi <span className="text-red-500">*</span>
            </label>
            <select required value={form.lokasi_id}
              onChange={e => setForm(f => ({ ...f, lokasi_id: e.target.value }))}
              className={inputClass + ' bg-white'}>
              <option value="">Pilih lokasi...</option>
              {MOCK_LOCATIONS.filter(l => l.aktif).map(l => (
                <option key={l.id} value={l.id}>{l.nama_lokasi}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <input type="date" required value={form.tanggal}
              onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))}
              className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Waktu Mulai</label>
              <input type="time" value={form.waktu_mulai}
                onChange={e => setForm(f => ({ ...f, waktu_mulai: e.target.value }))}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Waktu Selesai</label>
              <input type="time" value={form.waktu_selesai}
                onChange={e => setForm(f => ({ ...f, waktu_selesai: e.target.value }))}
                className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kuota</label>
              <input type="number" min="1" max="500" value={form.kuota}
                onChange={e => setForm(f => ({ ...f, kuota: e.target.value }))}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as ScheduleStatus }))}
                className={inputClass + ' bg-white'}>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{scheduleStatusLabel(s)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
            <textarea rows={3} value={form.deskripsi}
              onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))}
              placeholder="Info tambahan kegiatan (opsional)"
              className={inputClass + ' resize-none'} />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Batal
          </button>
          <button onClick={onSave} disabled={loading || !form.lokasi_id || !form.tanggal}
            className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {editing ? 'Simpan Perubahan' : 'Tambah Jadwal'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminJadwalPage() {
  const toggle = useSidebarToggle();

  const [schedules, setSchedules] = useState<Schedule[]>(MOCK_SCHEDULES);
  const [search,    setSearch]    = useState('');
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | 'semua'>('semua');
  const [page,      setPage]      = useState(1);

  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState<Schedule | null>(null);
  const [deleting,   setDeleting]   = useState<Schedule | null>(null);
  const [form,       setForm]       = useState<FormData>(EMPTY_FORM);
  const [loading,    setLoading]    = useState(false);
  const [toast,      setToast]      = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const filtered = useMemo(() => {
    return schedules.filter(s => {
      const matchSearch = search === '' ||
        (s.lokasi?.nama_lokasi ?? '').toLowerCase().includes(search.toLowerCase()) ||
        s.tanggal.includes(search);
      const matchStatus = statusFilter === 'semua' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [schedules, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(s: Schedule) {
    setEditing(s);
    setForm({
      lokasi_id:     String(s.lokasi_id),
      tanggal:       s.tanggal,
      waktu_mulai:   s.waktu_mulai.substring(0, 5),
      waktu_selesai: s.waktu_selesai.substring(0, 5),
      kuota:         String(s.kuota),
      deskripsi:     s.deskripsi ?? '',
      status:        s.status,
    });
    setShowForm(true);
  }

  async function handleSave() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const lokasi = MOCK_LOCATIONS.find(l => l.id === parseInt(form.lokasi_id));

    if (editing) {
      setSchedules(prev => prev.map(s => s.id === editing.id ? {
        ...s,
        lokasi_id:     parseInt(form.lokasi_id),
        lokasi:        lokasi ? {
          id: lokasi.id, nama_lokasi: lokasi.nama_lokasi,
          alamat: lokasi.alamat, kecamatan: lokasi.kecamatan,
          koordinat_lat: lokasi.koordinat_lat, koordinat_lng: lokasi.koordinat_lng,
        } : s.lokasi,
        tanggal:       form.tanggal,
        waktu_mulai:   form.waktu_mulai + ':00',
        waktu_selesai: form.waktu_selesai + ':00',
        kuota:         parseInt(form.kuota),
        sisa_kuota:    s.sisa_kuota,
        deskripsi:     form.deskripsi || null,
        status:        form.status,
      } : s));
      showToast('Jadwal berhasil diperbarui.');
    } else {
      const newSchedule: Schedule = {
        id:            Math.max(...schedules.map(s => s.id)) + 1,
        lokasi_id:     parseInt(form.lokasi_id),
        lokasi:        lokasi ? {
          id: lokasi.id, nama_lokasi: lokasi.nama_lokasi,
          alamat: lokasi.alamat, kecamatan: lokasi.kecamatan,
          koordinat_lat: lokasi.koordinat_lat, koordinat_lng: lokasi.koordinat_lng,
        } : undefined,
        tanggal:       form.tanggal,
        waktu_mulai:   form.waktu_mulai + ':00',
        waktu_selesai: form.waktu_selesai + ':00',
        kuota:         parseInt(form.kuota),
        sisa_kuota:    parseInt(form.kuota),
        deskripsi:     form.deskripsi || null,
        status:        form.status,
      };
      setSchedules(prev => [newSchedule, ...prev]);
      showToast('Jadwal baru berhasil ditambahkan.');
    }

    setLoading(false);
    setShowForm(false);
    setEditing(null);
  }

  async function handleDelete() {
    if (!deleting) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setSchedules(prev => prev.filter(s => s.id !== deleting.id));
    setDeleting(null);
    setLoading(false);
    showToast('Jadwal berhasil dihapus.');
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Jadwal Donor"
        subtitle={`${schedules.length} jadwal total`}
        onMenuClick={toggle}
        actions={
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Jadwal</span>
          </button>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-4">

        {/* Filter row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari lokasi atau tanggal..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex gap-1.5 overflow-x-auto">
              {(['semua', ...STATUS_OPTIONS] as const).map(s => (
                <button key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    statusFilter === s
                      ? 'bg-red-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'
                  }`}>
                  {s === 'semua' ? 'Semua' : scheduleStatusLabel(s)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Lokasi</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Tanggal</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden sm:table-cell">Waktu</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Kuota</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400">
                      <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                      {search || statusFilter !== 'semua' ? 'Tidak ada jadwal yang cocok dengan filter.' : 'Belum ada jadwal.'}
                    </td>
                  </tr>
                ) : paginated.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900 text-sm">{s.lokasi?.nama_lokasi ?? `Jadwal #${s.id}`}</div>
                      <div className="text-xs text-gray-400">{s.lokasi?.kecamatan}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-800">{formatDate(s.tanggal)}</div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell text-gray-600 text-xs">
                      {formatTime(s.waktu_mulai)} – {formatTime(s.waktu_selesai)}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">{s.kuota - s.sisa_kuota}/{s.kuota}</div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-20 mx-auto">
                          <div
                            className={`h-full rounded-full ${
                              (1 - s.sisa_kuota / s.kuota) >= 0.9 ? 'bg-red-500' :
                              (1 - s.sisa_kuota / s.kuota) >= 0.6 ? 'bg-amber-400' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.round(((s.kuota - s.sisa_kuota) / s.kuota) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${scheduleStatusColor(s.status)}`}>
                          {scheduleStatusLabel(s.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(s)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleting(s)}
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
                {filtered.length} jadwal · halaman {page} dari {totalPages}
              </span>
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
          schedule={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
          loading={loading}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
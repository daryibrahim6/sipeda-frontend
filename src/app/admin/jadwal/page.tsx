'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSidebarToggle } from '@/lib/admin-context';
import { TopBar } from '@/components/admin/TopBar';
import {
  Plus, Pencil, Trash2, Check,
  Calendar, ChevronLeft, ChevronRight, Filter, RefreshCw,
} from 'lucide-react';
import {
  getAdminSchedules, createSchedule, updateSchedule, deleteSchedule,
  type AdminSchedulePayload,
} from '@/lib/admin-api';
import { getLocations } from '@/lib/api';
import type { Schedule, Location } from '@/lib/types';
import { formatDate, formatTime, scheduleStatusLabel, scheduleStatusColor } from '@/lib/utils';
import type { ScheduleStatus } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/lib/toast';

type FormData = {
  lokasi_id: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  kuota: string;
  deskripsi: string;
  status: ScheduleStatus;
};

const EMPTY_FORM: FormData = {
  lokasi_id: '', tanggal: '', waktu_mulai: '08:00',
  waktu_selesai: '14:00', kuota: '50', deskripsi: '', status: 'aktif',
};

const STATUS_OPTIONS: ScheduleStatus[] = ['aktif', 'penuh', 'dibatalkan', 'selesai'];
const PER_PAGE = 15;

function DeleteModal({ schedule, onConfirm, onCancel, loading }: {
  schedule: Schedule; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <Modal open title="Hapus Jadwal?" onClose={onCancel}>
      <div className="text-center mb-5">
        <div className="w-14 h-14 bg-[var(--color-primary-subtle)] rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-[var(--color-primary)]" />
        </div>
        <div className="text-sm text-[var(--color-text-muted)]">
          Jadwal di <strong>{(schedule.lokasi as { nama_lokasi?: string })?.nama_lokasi}</strong> pada{' '}
          <strong>{formatDate(schedule.tanggal)}</strong> akan dihapus permanen.{' '}
          Semua registrasi terkait juga akan terhapus.
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Batal</Button>
        <Button variant="danger" className="flex-1" onClick={onConfirm} loading={loading} icon={<Trash2 className="w-4 h-4" />}>Hapus</Button>
      </div>
    </Modal>
  );
}

function FormModal({ editing, form, setForm, onSave, onClose, loading, locations }: {
  editing: Schedule | null; form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  onSave: () => void; onClose: () => void; loading: boolean;
  locations: Location[];
}) {
  const inp = "w-full border border-[var(--color-border-muted)] rounded-2xl px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-transparent transition-all";
  return (
    <Modal open title={editing ? 'Edit Jadwal' : 'Tambah Jadwal Baru'} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Lokasi <span className="text-red-500">*</span></label>
          <select required value={form.lokasi_id} onChange={e => setForm(f => ({ ...f, lokasi_id: e.target.value }))} className={inp + ' bg-white'}>
            <option value="">Pilih lokasi...</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.nama_lokasi}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Tanggal <span className="text-red-500">*</span></label>
          <input type="date" required value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} className={inp} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Waktu Mulai</label>
            <input type="time" value={form.waktu_mulai} onChange={e => setForm(f => ({ ...f, waktu_mulai: e.target.value }))} className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Waktu Selesai</label>
            <input type="time" value={form.waktu_selesai} onChange={e => setForm(f => ({ ...f, waktu_selesai: e.target.value }))} className={inp} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Kuota</label>
            <input type="number" min="1" max="500" value={form.kuota} onChange={e => setForm(f => ({ ...f, kuota: e.target.value }))} className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ScheduleStatus }))} className={inp + ' bg-white'}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{scheduleStatusLabel(s)}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Deskripsi</label>
          <textarea rows={3} value={form.deskripsi} onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))} placeholder="Info tambahan (opsional)" className={inp + ' resize-none'} />
        </div>
      </div>
      <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--color-border-muted)]">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Batal</Button>
        <Button onClick={onSave} disabled={loading || !form.lokasi_id || !form.tanggal} className="flex-1" loading={loading} icon={<Check className="w-4 h-4" />}>
          {editing ? 'Simpan Perubahan' : 'Tambah Jadwal'}
        </Button>
      </div>
    </Modal>
  );
}

export default function AdminJadwalPage() {
  const toggle = useSidebarToggle();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | 'semua'>('semua');
  const [dataLoading, setDataLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [deleting, setDeleting] = useState<Schedule | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / PER_PAGE);

  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [res, locs] = await Promise.all([
        getAdminSchedules({ page, perPage: PER_PAGE, status: statusFilter }),
        locations.length === 0 ? getLocations() : Promise.resolve(locations),
      ]);
      setSchedules(res.data);
      setTotal(res.total);
      if (locations.length === 0) setLocations(locs);
    } catch {
      toast('Gagal memuat data jadwal.', 'error');
    } finally {
      setDataLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }
  function openEdit(s: Schedule) {
    setEditing(s);
    setForm({
      lokasi_id: String(s.lokasi_id),
      tanggal: s.tanggal,
      waktu_mulai: s.waktu_mulai.substring(0, 5),
      waktu_selesai: s.waktu_selesai.substring(0, 5),
      kuota: String(s.kuota),
      deskripsi: s.deskripsi ?? '',
      status: s.status,
    });
    setShowForm(true);
  }

  async function handleSave() {
    setLoading(true);
    try {
      const payload: AdminSchedulePayload = {
        lokasi_id: parseInt(form.lokasi_id),
        tanggal: form.tanggal,
        waktu_mulai: form.waktu_mulai,
        waktu_selesai: form.waktu_selesai,
        kuota: parseInt(form.kuota),
        deskripsi: form.deskripsi || undefined,
        status: form.status,
      };
      if (editing) {
        await updateSchedule(editing.id, payload);
        toast('Jadwal berhasil diperbarui.');
      } else {
        await createSchedule(payload);
        toast('Jadwal baru berhasil ditambahkan.');
      }
      setShowForm(false);
      setEditing(null);
      await loadData();
    } catch (err) {
      toast((err as Error).message || 'Gagal menyimpan jadwal.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setLoading(true);
    try {
      await deleteSchedule(deleting.id);
      setDeleting(null);
      toast('Jadwal berhasil dihapus.');
      await loadData();
    } catch {
      toast('Gagal menghapus jadwal.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Jadwal Donor"
        subtitle={`${total} jadwal total`}
        onMenuClick={toggle}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={loadData} title="Refresh" icon={<RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin text-red-500' : ''}`} />} />
            <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>
              <span className="hidden sm:inline">Tambah Jadwal</span>
            </Button>
          </div>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-4">
        {/* Filter status */}
        <Card variant="flush" className="!p-2 flex items-center gap-2 flex-wrap w-fit">
          <Filter className="w-4 h-4 text-[var(--color-text-muted)] ml-2" />
          <div className="w-px h-6 bg-[var(--color-border-muted)] mx-1" />
          {(['semua', ...STATUS_OPTIONS] as const).map(s => (
            <button key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-2 text-xs font-bold rounded-2xl whitespace-nowrap transition-all ${statusFilter === s ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary-dark)] shadow-[var(--shadow-card)]' : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-section-alt)]'
                }`}>
              {s === 'semua' ? 'Semua' : scheduleStatusLabel(s)}
            </button>
          ))}
        </Card>

        {/* Table */}
        <Card variant="elevated" padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-muted)] bg-[var(--color-section-alt)]/50">
                  <th className="text-left px-5 py-3.5 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wide">Lokasi</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wide">Tanggal</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wide hidden sm:table-cell">Waktu</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wide hidden md:table-cell">Kuota</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-muted)]">
                {dataLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-[var(--color-section-alt)] animate-pulse-soft rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : schedules.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState icon={<Calendar />} title="Belum ada jadwal" description="Klik 'Tambah Jadwal' untuk memulai." />
                    </td>
                  </tr>
                ) : schedules.map(s => {
                  const lokasi = s.lokasi as { nama_lokasi?: string; kecamatan?: string } | undefined;
                  return (
                    <tr key={s.id} className="hover:bg-[var(--color-section-alt)]/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-extrabold text-[var(--color-text-primary)] text-sm tracking-tight">{lokasi?.nama_lokasi ?? `Jadwal #${s.id}`}</div>
                        <div className="text-xs font-bold text-[var(--color-text-muted)] mt-0.5">{lokasi?.kecamatan}</div>
                      </td>
                      <td className="px-6 py-5 font-bold text-[var(--color-text-secondary)]">{formatDate(s.tanggal)}</td>
                      <td className="px-6 py-5 hidden sm:table-cell text-[var(--color-text-muted)] font-semibold text-xs">
                        {formatTime(s.waktu_mulai)} – {formatTime(s.waktu_selesai)}
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell">
                        <div className="text-center">
                          <div className="text-[10px] font-extrabold text-[var(--color-text-muted)] mb-1.5">{s.kuota - s.sisa_kuota}/{s.kuota}</div>
                          <div className="h-2 bg-[var(--color-section-alt)] rounded-full overflow-hidden w-20 mx-auto">
                            <div className={`h-full rounded-full ${(1 - s.sisa_kuota / s.kuota) >= 0.9 ? 'bg-red-500' :
                                (1 - s.sisa_kuota / s.kuota) >= 0.6 ? 'bg-amber-400' : 'bg-green-500'
                              }`} style={{ width: `${Math.round(((s.kuota - s.sisa_kuota) / s.kuota) * 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${scheduleStatusColor(s.status).replace('border-', '')}`}>
                            {scheduleStatusLabel(s.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(s)} className="!p-2" title="Edit" icon={<Pencil className="w-4 h-4" />} />
                          <Button variant="ghost" size="sm" onClick={() => setDeleting(s)} className="!p-2 hover:!bg-[var(--color-primary-subtle)] hover:!text-[var(--color-primary)]" title="Hapus" icon={<Trash2 className="w-4 h-4" />} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--color-border-muted)]">
              <span className="text-xs text-[var(--color-text-muted)]">{total} jadwal · halaman {page} dari {totalPages}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-section-alt)] disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-section-alt)] disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </main>

      {showForm && (
        <FormModal editing={editing} form={form} setForm={setForm} onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }} loading={loading} locations={locations} />
      )}
      {deleting && (
        <DeleteModal schedule={deleting} onConfirm={handleDelete} onCancel={() => setDeleting(null)} loading={loading} />
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSidebarToggle } from '@/lib/admin-context';
import { TopBar } from '@/components/admin/TopBar';
import {
  Search, Download, ChevronLeft, ChevronRight,
  ClipboardList, Check, Loader2, Filter, RefreshCw,
} from 'lucide-react';
import {
  getAdminRegistrasi, updateRegistrasiStatus,
  type AdminRegistrasi,
} from '@/lib/admin-api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/toast';

type RegStatus = AdminRegistrasi['status'];
const ALL_STATUSES: RegStatus[] = ['pending', 'confirmed', 'hadir', 'tidak_hadir', 'dibatalkan'];
const PER_PAGE = 10;

const STATUS_LABELS: Record<RegStatus, string> = {
  pending: 'Pending',
  confirmed: 'Terkonfirmasi',
  hadir: 'Hadir',
  tidak_hadir: 'Tidak Hadir',
  dibatalkan: 'Dibatalkan',
};

const STATUS_COLORS: Record<RegStatus, string> = {
  pending: 'text-amber-700  bg-amber-50  border-amber-200',
  confirmed: 'text-blue-700   bg-blue-50   border-blue-200',
  hadir: 'text-green-700  bg-green-50  border-green-200',
  tidak_hadir: 'text-red-700    bg-red-50    border-red-200',
  dibatalkan: 'text-[var(--color-text-muted)]   bg-[var(--color-section-alt)]   border-[var(--color-border)]',
};

function exportCSV(regs: AdminRegistrasi[]) {
  const headers = ['Kode', 'Nama', 'Email', 'Telepon', 'Golongan Darah', 'Riwayat Donor', 'Lokasi', 'Tanggal Jadwal', 'Status', 'Terdaftar Pada'];
  const rows = regs.map(r => [
    r.kode_registrasi, r.nama, r.email ?? '', r.telepon,
    r.golongan_darah, r.riwayat_donor ? 'Ya' : 'Tidak',
    (r.jadwal?.lokasi as { nama_lokasi?: string })?.nama_lokasi ?? '',
    formatDate(r.jadwal?.tanggal ?? ''),
    STATUS_LABELS[r.status],
    new Date(r.created_at).toLocaleString('id-ID'),
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `registrasi-sipeda-${new Date().toISOString().split('T')[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

function StatusModal({ reg, onSave, onClose }: {
  reg: AdminRegistrasi;
  onSave: (reg: AdminRegistrasi, status: RegStatus) => Promise<void>;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<RegStatus>(reg.status);
  const [loading, setLoading] = useState(false);
  async function handleSave() {
    setLoading(true);
    await onSave(reg, selected);
    setLoading(false);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-[var(--shadow-elevated)] p-6 w-full max-w-sm">
        <h3 className="font-bold text-[var(--color-text-primary)] mb-1">Update Status</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-5">{reg.nama} · <span className="font-mono text-xs">{reg.kode_registrasi}</span></p>
        <div className="space-y-2 mb-6">
          {ALL_STATUSES.map(s => (
            <label key={s} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 cursor-pointer transition-all ${selected === s ? 'border-[var(--color-primary)] bg-[var(--color-primary-subtle)]' : 'border-[var(--color-border-muted)] hover:border-[var(--color-border)] hover:bg-[var(--color-section-alt)]'
              }`}>
              <input type="radio" name="status" value={s} checked={selected === s} onChange={() => setSelected(s)} className="accent-red-600" />
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[s]}`}>{STATUS_LABELS[s]}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[var(--color-border-muted)] rounded-2xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-section-alt)] transition-all active:scale-[0.98]">Batal</button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-2xl hover:from-red-700 hover:to-red-800 disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-black/10 active:scale-[0.98] transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRegistrasiPage() {
  const toggle = useSidebarToggle();
  const { toast } = useToast();
  const [regs, setRegs] = useState<AdminRegistrasi[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RegStatus | 'semua'>('semua');
  const [dataLoading, setDataLoading] = useState(true);
  const [editing, setEditing] = useState<AdminRegistrasi | null>(null);

  const totalPages = Math.ceil(total / PER_PAGE);

  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const res = await getAdminRegistrasi({ page, perPage: PER_PAGE, search, status: statusFilter });
      setRegs(res.data);
      setTotal(res.total);
    } catch {
      toast('Gagal memuat data registrasi.');
    } finally {
      setDataLoading(false);
    }
  }, [page, search, statusFilter, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleStatusSave(reg: AdminRegistrasi, status: RegStatus) {
    try {
      await updateRegistrasiStatus(reg.id, status);
      setEditing(null);
      toast('Status registrasi berhasil diperbarui.');
      await loadData();

      const STATUS_WA_LABELS: Record<RegStatus, string> = {
        pending: '⏳ Menunggu Konfirmasi',
        confirmed: '✅ Dikonfirmasi',
        hadir: '📍 Sudah Hadir',
        tidak_hadir: '❌ Tidak Hadir',
        dibatalkan: '🗑️ Dibatalkan',
      };

      const message =
        `*Update Status Pendaftaran Donor Darah*\n\n` +
        `Halo ${reg.nama},\n\n` +
        `Status pendaftaran kamu (${reg.kode_registrasi}) sekarang: *${STATUS_WA_LABELS[status]}*\n\n` +
        `Terima kasih telah mendukung kegiatan donor darah PMI Kabupaten Indramayu. ❤️`;

      try {
        const res = await fetch('/api/send-wa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: reg.telepon, message }),
        });
        if (res.ok) {
          toast('Notifikasi WA berhasil dikirim.');
        } else {
          const data = await res.json().catch(() => ({}));
          toast(`WA gagal dikirim: ${data.error ?? 'unknown error'}`, 'error');
        }
      } catch {
        toast('WA gagal: jaringan error', 'error');
      }
    } catch {
      toast('Gagal update status.');
    }
  }

  // Status summary counts dari data yang sudah diload
  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = regs.filter(r => r.status === s).length;
    return acc;
  }, {} as Record<RegStatus, number>);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Registrasi Donor"
        subtitle={`${total} registrasi total`}
        onMenuClick={toggle}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={loadData} title="Refresh" icon={<RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />} />
            <Button variant="secondary" size="sm" onClick={() => exportCSV(regs)} icon={<Download className="w-4 h-4" />}>
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </div>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-4">
        {/* Status summary */}
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map(s => (
            <div key={s} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[s]}`}>
              {STATUS_LABELS[s]} <span className="font-bold">{counts[s]}</span>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input type="text" placeholder="Cari nama, kode, telepon..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-border-muted)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-[var(--color-primary)] transition-all" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
            <div className="flex gap-1.5 overflow-x-auto">
              {(['semua', ...ALL_STATUSES] as const).map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-2.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${statusFilter === s ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[var(--shadow-card)]' : 'bg-white border border-[var(--color-border-muted)] text-[var(--color-text-secondary)] hover:border-red-300 hover:text-[var(--color-primary)]'
                    }`}>
                  {s === 'semua' ? 'Semua' : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-[var(--color-border-muted)] overflow-hidden shadow-[var(--shadow-card)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-muted)] bg-[var(--color-section-alt)]/50 backdrop-blur-sm sticky top-0 z-10">
                  <th className="text-left px-5 py-3.5 font-semibold text-[var(--color-text-muted)] text-xs uppercase tracking-wide">Kode</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[var(--color-text-muted)] text-xs uppercase tracking-wide">Nama</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[var(--color-text-muted)] text-xs uppercase tracking-wide hidden md:table-cell">Telepon</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-[var(--color-text-muted)] text-xs uppercase tracking-wide hidden sm:table-cell">Gol. Darah</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[var(--color-text-muted)] text-xs uppercase tracking-wide hidden lg:table-cell">Jadwal</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-[var(--color-text-muted)] text-xs uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-[var(--color-text-muted)] text-xs uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-muted)]">
                {dataLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-[var(--color-section-alt)] animate-pulse-soft rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : regs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-[var(--color-text-muted)]">
                      <ClipboardList className="w-10 h-10 mx-auto mb-3 text-[var(--color-border-muted)]" />
                      Tidak ada registrasi yang cocok.
                    </td>
                  </tr>
                ) : regs.map(r => (
                  <tr key={r.id} className="hover:bg-[var(--color-section-alt)]/30 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-[var(--color-text-muted)] bg-[var(--color-section-alt)] px-2 py-1 rounded-lg">{r.kode_registrasi}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[var(--color-text-primary)]">{r.nama}</div>
                      {r.email && <div className="text-xs text-[var(--color-text-muted)]">{r.email}</div>}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-[var(--color-text-secondary)] text-xs">{r.telepon}</td>
                    <td className="px-5 py-4 hidden sm:table-cell text-center">
                      <span className="font-mono text-xs font-bold text-[var(--color-text-primary)] bg-[var(--color-section-alt)] px-2 py-1 rounded">{r.golongan_darah}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="text-xs text-[var(--color-text-secondary)] font-medium">{(r.jadwal?.lokasi as { nama_lokasi?: string })?.nama_lokasi}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{formatDate(r.jadwal?.tanggal ?? '')}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button onClick={() => setEditing(r)}
                          className="px-3 py-2 text-xs font-medium border border-[var(--color-border-muted)] rounded-2xl text-[var(--color-text-secondary)] hover:border-red-300 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] transition-all whitespace-nowrap">
                          Update Status
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
              <span className="text-xs text-[var(--color-text-muted)]">{total} registrasi · halaman {page} dari {totalPages}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-2xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-section-alt)] disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-2xl text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-section-alt)] disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-[var(--color-text-muted)] text-center">Export CSV akan mengunduh data sesuai filter aktif ({regs.length} baris).</p>
      </main>

      {editing && <StatusModal reg={editing} onSave={handleStatusSave} onClose={() => setEditing(null)} />}
    </div>
  );
}
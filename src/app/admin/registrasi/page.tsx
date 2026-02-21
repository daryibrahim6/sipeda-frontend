'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSidebarToggle } from '@/app/admin/layout';
import { TopBar } from '@/components/admin/TopBar';
import {
  Search, Download, ChevronLeft, ChevronRight,
  ClipboardList, Check, X, Loader2, Filter, RefreshCw,
} from 'lucide-react';
import {
  getAdminRegistrasi, updateRegistrasiStatus,
  type AdminRegistrasi,
} from '@/lib/admin-api';
import { formatDate } from '@/lib/utils';

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
  dibatalkan: 'text-gray-500   bg-gray-50   border-gray-200',
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
  onSave: (id: number, status: RegStatus) => Promise<void>;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<RegStatus>(reg.status);
  const [loading, setLoading] = useState(false);
  async function handleSave() {
    setLoading(true);
    await onSave(reg.id, selected);
    setLoading(false);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-gray-900 mb-1">Update Status</h3>
        <p className="text-sm text-gray-500 mb-5">{reg.nama} · <span className="font-mono text-xs">{reg.kode_registrasi}</span></p>
        <div className="space-y-2 mb-6">
          {ALL_STATUSES.map(s => (
            <label key={s} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${selected === s ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-gray-200'
              }`}>
              <input type="radio" name="status" value={s} checked={selected === s} onChange={() => setSelected(s)} className="accent-red-600" />
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[s]}`}>{STATUS_LABELS[s]}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-green-600 text-white text-sm font-medium shadow-lg">
      <Check className="w-4 h-4" />{msg}
      <button onClick={onClose}><X className="w-3.5 h-3.5 opacity-70" /></button>
    </div>
  );
}

export default function AdminRegistrasiPage() {
  const toggle = useSidebarToggle();
  const [regs, setRegs] = useState<AdminRegistrasi[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RegStatus | 'semua'>('semua');
  const [dataLoading, setDataLoading] = useState(true);
  const [editing, setEditing] = useState<AdminRegistrasi | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const totalPages = Math.ceil(total / PER_PAGE);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const res = await getAdminRegistrasi({ page, perPage: PER_PAGE, search, status: statusFilter });
      setRegs(res.data);
      setTotal(res.total);
    } catch {
      showToast('Gagal memuat data registrasi.');
    } finally {
      setDataLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleStatusSave(id: number, status: RegStatus) {
    try {
      await updateRegistrasiStatus(id, status);
      setEditing(null);
      showToast('Status registrasi berhasil diperbarui.');
      await loadData();
    } catch {
      showToast('Gagal update status.');
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
            <button onClick={loadData} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin text-red-500' : ''}`} />
            </button>
            <button onClick={() => exportCSV(regs)} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 text-green-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Cari nama, kode, telepon..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex gap-1.5 overflow-x-auto">
              {(['semua', ...ALL_STATUSES] as const).map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'
                    }`}>
                  {s === 'semua' ? 'Semua' : STATUS_LABELS[s]}
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
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Kode</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Nama</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Telepon</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden sm:table-cell">Gol. Darah</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden lg:table-cell">Jadwal</th>
                  <th className="text-center px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dataLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-gray-100 animate-pulse rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : regs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                      Tidak ada registrasi yang cocok.
                    </td>
                  </tr>
                ) : regs.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{r.kode_registrasi}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">{r.nama}</div>
                      {r.email && <div className="text-xs text-gray-400">{r.email}</div>}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-gray-600 text-xs">{r.telepon}</td>
                    <td className="px-5 py-4 hidden sm:table-cell text-center">
                      <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">{r.golongan_darah}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="text-xs text-gray-700 font-medium">{(r.jadwal?.lokasi as { nama_lokasi?: string })?.nama_lokasi}</div>
                      <div className="text-xs text-gray-400">{formatDate(r.jadwal?.tanggal ?? '')}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button onClick={() => setEditing(r)}
                          className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors whitespace-nowrap">
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
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">{total} registrasi · halaman {page} dari {totalPages}</span>
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
        <p className="text-xs text-gray-400 text-center">Export CSV akan mengunduh data sesuai filter aktif ({regs.length} baris).</p>
      </main>

      {editing && <StatusModal reg={editing} onSave={handleStatusSave} onClose={() => setEditing(null)} />}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
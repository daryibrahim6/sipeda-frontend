'use client';

import { useState, useMemo } from 'react';
import { useSidebarToggle } from '@/app/admin/layout';
import { TopBar } from '@/components/admin/TopBar';
import {
  Search, Download, ChevronLeft, ChevronRight,
  ClipboardList, Check, X, Loader2, Filter,
} from 'lucide-react';
import { MOCK_SCHEDULES } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';

// ─── Generate mock registrations from schedules ────────────────────────────────
type RegStatus = 'pending' | 'confirmed' | 'hadir' | 'tidak_hadir' | 'dibatalkan';

type Registration = {
  id:               number;
  kode_registrasi:  string;
  jadwal_id:        number;
  jadwal_tanggal:   string;
  lokasi_nama:      string;
  nama:             string;
  email:            string | null;
  telepon:          string;
  golongan_darah:   string;
  riwayat_donor:    boolean;
  status:           RegStatus;
  created_at:       string;
};

const NAMES    = ['Siti Rahayu', 'Budi Santoso', 'Dewi Lestari', 'Ahmad Fauzi', 'Rina Wati', 'Joko Purnomo', 'Ani Susanti', 'Dian Pratama', 'Hendra Wijaya', 'Mega Sari', 'Rizki Pratama', 'Fitri Handayani'];
const BLOOD    = ['A+', 'A-', 'B+', 'B-', 'AB+', 'O+', 'O-', 'Tidak Tahu'];
const STATUSES: RegStatus[] = ['confirmed', 'hadir', 'pending', 'tidak_hadir', 'dibatalkan'];
const PHONES   = ['085712345678', '081234567890', '089876543210', '082345678901', '087654321098'];

function generateRegs(): Registration[] {
  const regs: Registration[] = [];
  let id = 1;
  MOCK_SCHEDULES.forEach(s => {
    const n = Math.floor(Math.random() * 6) + 2;
    for (let i = 0; i < n; i++) {
      const year = new Date(s.tanggal).getFullYear();
      regs.push({
        id,
        kode_registrasi: `REG-${year}-${String(id).padStart(5, '0')}`,
        jadwal_id:       s.id,
        jadwal_tanggal:  s.tanggal,
        lokasi_nama:     s.lokasi?.nama_lokasi ?? `Jadwal #${s.id}`,
        nama:            NAMES[Math.floor(Math.random() * NAMES.length)],
        email:           Math.random() > 0.5 ? `user${id}@mail.com` : null,
        telepon:         PHONES[Math.floor(Math.random() * PHONES.length)],
        golongan_darah:  BLOOD[Math.floor(Math.random() * BLOOD.length)],
        riwayat_donor:   Math.random() > 0.4,
        status:          STATUSES[Math.floor(Math.random() * STATUSES.length)],
        created_at:      new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      });
      id++;
    }
  });
  return regs.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

const INITIAL_REGS = generateRegs();

const STATUS_LABELS: Record<RegStatus, string> = {
  pending:       'Pending',
  confirmed:     'Terkonfirmasi',
  hadir:         'Hadir',
  tidak_hadir:   'Tidak Hadir',
  dibatalkan:    'Dibatalkan',
};

const STATUS_COLORS: Record<RegStatus, string> = {
  pending:       'text-gray-600  bg-gray-50  border-gray-200',
  confirmed:     'text-blue-700  bg-blue-50  border-blue-200',
  hadir:         'text-green-700 bg-green-50 border-green-200',
  tidak_hadir:   'text-red-700   bg-red-50   border-red-200',
  dibatalkan:    'text-gray-500  bg-gray-50  border-gray-200',
};

const ALL_STATUSES: RegStatus[] = ['pending', 'confirmed', 'hadir', 'tidak_hadir', 'dibatalkan'];
const PER_PAGE = 10;

// ─── Export CSV ───────────────────────────────────────────────────────────────
function exportCSV(regs: Registration[]) {
  const headers = ['Kode', 'Nama', 'Email', 'Telepon', 'Golongan Darah', 'Riwayat Donor', 'Lokasi', 'Tanggal Jadwal', 'Status', 'Terdaftar Pada'];
  const rows = regs.map(r => [
    r.kode_registrasi,
    r.nama,
    r.email ?? '',
    r.telepon,
    r.golongan_darah,
    r.riwayat_donor ? 'Ya' : 'Tidak',
    r.lokasi_nama,
    formatDate(r.jadwal_tanggal),
    STATUS_LABELS[r.status],
    new Date(r.created_at).toLocaleString('id-ID'),
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `registrasi-sipeda-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Status update modal ──────────────────────────────────────────────────────
function StatusModal({
  reg,
  onSave,
  onClose,
}: {
  reg: Registration;
  onSave: (id: number, status: RegStatus) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<RegStatus>(reg.status);
  const [loading, setLoading]   = useState(false);

  async function handleSave() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    onSave(reg.id, selected);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-gray-900 mb-1">Update Status</h3>
        <p className="text-sm text-gray-500 mb-5">{reg.nama} · {reg.kode_registrasi}</p>
        <div className="space-y-2 mb-6">
          {ALL_STATUSES.map(s => (
            <label key={s} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
              selected === s ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-gray-200'
            }`}>
              <input type="radio" name="status" value={s}
                checked={selected === s}
                onChange={() => setSelected(s)}
                className="accent-red-600" />
              <span className={`text-sm font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[s]}`}>
                {STATUS_LABELS[s]}
              </span>
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
      <Check className="w-4 h-4" />
      {msg}
      <button onClick={onClose}><X className="w-3.5 h-3.5 opacity-70" /></button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminRegistrasiPage() {
  const toggle = useSidebarToggle();

  const [regs, setRegs]           = useState<Registration[]>(INITIAL_REGS);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState<RegStatus | 'semua'>('semua');
  const [page, setPage]           = useState(1);
  const [editing, setEditing]     = useState<Registration | null>(null);
  const [toast, setToast]         = useState<string | null>(null);

  const filtered = useMemo(() => regs.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = q === '' ||
      r.nama.toLowerCase().includes(q) ||
      r.kode_registrasi.toLowerCase().includes(q) ||
      r.telepon.includes(q) ||
      r.lokasi_nama.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'semua' || r.status === statusFilter;
    return matchSearch && matchStatus;
  }), [regs, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleStatusSave(id: number, status: RegStatus) {
    setRegs(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setEditing(null);
    setToast('Status registrasi berhasil diperbarui.');
    setTimeout(() => setToast(null), 3000);
  }

  // Summary counts
  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = regs.filter(r => r.status === s).length;
    return acc;
  }, {} as Record<RegStatus, number>);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Registrasi Donor"
        subtitle={`${regs.length} registrasi total`}
        onMenuClick={toggle}
        actions={
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 text-green-600" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-4">

        {/* Status summary pills */}
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map(s => (
            <div key={s} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[s]}`}>
              {STATUS_LABELS[s]}
              <span className="font-bold">{counts[s]}</span>
            </div>
          ))}
        </div>

        {/* Filter row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, kode, telepon, lokasi..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex gap-1.5 overflow-x-auto">
              {(['semua', ...ALL_STATUSES] as const).map(s => (
                <button key={s}
                  onClick={() => { setStatus(s); setPage(1); }}
                  className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    statusFilter === s
                      ? 'bg-red-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'
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
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                      Tidak ada registrasi yang cocok.
                    </td>
                  </tr>
                ) : paginated.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        {r.kode_registrasi}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">{r.nama}</div>
                      {r.email && <div className="text-xs text-gray-400">{r.email}</div>}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-gray-600 text-xs">{r.telepon}</td>
                    <td className="px-5 py-4 hidden sm:table-cell text-center">
                      <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {r.golongan_darah}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <div className="text-xs text-gray-700 font-medium">{r.lokasi_nama}</div>
                      <div className="text-xs text-gray-400">{formatDate(r.jadwal_tanggal)}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[r.status]}`}>
                          {STATUS_LABELS[r.status]}
                        </span>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                {filtered.length} registrasi · halaman {page} dari {totalPages}
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

        {/* Export hint */}
        <p className="text-xs text-gray-400 text-center">
          Tombol "Export CSV" akan mengunduh data sesuai filter yang aktif saat ini ({filtered.length} baris).
        </p>
      </main>

      {editing && (
        <StatusModal reg={editing} onSave={handleStatusSave} onClose={() => setEditing(null)} />
      )}

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
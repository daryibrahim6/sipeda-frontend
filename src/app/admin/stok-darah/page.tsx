'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSidebarToggle } from '@/app/admin/layout';
import { TopBar } from '@/components/admin/TopBar';
import { Loader2, Check, X, Save, RefreshCw, MapPin } from 'lucide-react';
import { getAdminStok, updateStokDarah, type AdminStokRow } from '@/lib/admin-api';
import { getLocations } from '@/lib/api';
import { requireAdminAuth } from '@/lib/auth';
import type { Location } from '@/lib/types';

type StockStatus = 'normal' | 'kritis' | 'kosong';

// Group rows by (lokasi, komponen)
type GroupedStok = {
  lokasi_id: number;
  lokasi_nama: string;
  komponen_kode: string;
  komponen_nama: string;
  komponen_id: number;
  golongan: Record<string, { id: number; jumlah: number; status: StockStatus }>;
  total: number;
};

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function statusColor(s: StockStatus) {
  return { normal: 'text-green-700 bg-green-50 border-green-200', kritis: 'text-amber-700 bg-amber-50 border-amber-200', kosong: 'text-red-700 bg-red-50 border-red-200' }[s];
}

function groupStok(rows: AdminStokRow[]): GroupedStok[] {
  const map = new Map<string, GroupedStok>();
  for (const row of rows) {
    const key = `${row.lokasi_id}-${row.komponen_id}`;
    if (!map.has(key)) {
      map.set(key, {
        lokasi_id: row.lokasi_id,
        lokasi_nama: (row.lokasi as { nama_lokasi?: string })?.nama_lokasi ?? `Lokasi ${row.lokasi_id}`,
        komponen_kode: (row.komponen as { kode?: string })?.kode ?? '',
        komponen_nama: (row.komponen as { nama?: string })?.nama ?? '',
        komponen_id: row.komponen_id,
        golongan: {},
        total: 0,
      });
    }
    const group = map.get(key)!;
    group.golongan[row.golongan_darah] = { id: row.id, jumlah: row.jumlah, status: row.status };
    group.total += row.jumlah;
  }
  return Array.from(map.values());
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-green-600 text-white text-sm font-medium shadow-lg">
      <Check className="w-4 h-4" />{msg}
      <button onClick={onClose}><X className="w-3.5 h-3.5 opacity-70" /></button>
    </div>
  );
}

export default function AdminStokPage() {
  const toggle = useSidebarToggle();
  const [rows, setRows] = useState<AdminStokRow[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [lokasiFilter, setLokasiFilter] = useState<number | undefined>(undefined);
  const [dataLoading, setDataLoading] = useState(true);
  const [editing, setEditing] = useState<{ id: number; val: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Auth guard (middleware disabled — Supabase v2 uses localStorage)
  useEffect(() => { requireAdminAuth(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [stok, locs] = await Promise.all([
        getAdminStok(lokasiFilter),
        locations.length === 0 ? getLocations() : Promise.resolve(locations),
      ]);
      setRows(stok);
      if (locations.length === 0) setLocations(locs);
    } catch {
      showToast('Gagal memuat data stok.');
    } finally {
      setDataLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lokasiFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveEdit() {
    if (!editing) return;
    const val = parseInt(editing.val);
    if (isNaN(val) || val < 0) return;
    setSaving(true);
    try {
      await updateStokDarah(editing.id, val);
      setEditing(null);
      showToast('Stok berhasil diperbarui.');
      await loadData();
    } catch {
      showToast('Gagal update stok.');
    } finally {
      setSaving(false);
    }
  }

  const grouped = groupStok(rows);
  const totalUnits = rows.reduce((s, r) => s + r.jumlah, 0);
  const kritisCount = rows.filter(r => r.status !== 'normal').length;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Stok Darah"
        subtitle="Klik sel untuk update jumlah stok secara real-time"
        onMenuClick={toggle}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={loadData} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin text-red-500' : ''}`} />
            </button>
          </div>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Kantong', value: totalUnits, color: 'text-gray-900' },
            { label: 'Komponen x Lokasi', value: grouped.length, color: 'text-gray-900' },
            { label: 'Perlu Perhatian', value: kritisCount, color: kritisCount > 0 ? 'text-red-600' : 'text-green-600' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <div className={`text-2xl font-bold mb-1 ${item.color}`}>{item.value}</div>
              <div className="text-xs text-gray-400">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Filter lokasi */}
        {locations.length > 1 && (
          <div className="flex flex-wrap gap-2 items-center">
            <MapPin className="w-4 h-4 text-gray-400" />
            <button onClick={() => setLokasiFilter(undefined)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${!lokasiFilter ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'}`}>
              Semua Lokasi
            </button>
            {locations.map(loc => (
              <button key={loc.id} onClick={() => setLokasiFilter(loc.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${lokasiFilter === loc.id ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'}`}>
                {loc.nama_lokasi}
              </button>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl border border-gray-100 text-xs text-gray-500">
          <span className="font-semibold text-gray-600">Keterangan:</span>
          {[
            { dot: 'bg-green-500', label: 'Normal' },
            { dot: 'bg-amber-400', label: 'Kritis — perlu tambah' },
            { dot: 'bg-red-500', label: 'Kosong' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${l.dot}`} />
              {l.label}
            </div>
          ))}
          <span className="ml-auto italic">Klik sel untuk edit langsung</span>
        </div>

        {/* Stock tables */}
        {dataLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="h-5 bg-gray-100 animate-pulse rounded w-48 mb-4" />
                <div className="grid grid-cols-8 gap-2">
                  {[...Array(8)].map((_, j) => (
                    <div key={j} className="h-16 bg-gray-100 animate-pulse rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
            Belum ada data stok darah.
          </div>
        ) : grouped.map(group => (
          <div key={`${group.lokasi_id}-${group.komponen_id}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{group.komponen_nama}</span>
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{group.komponen_kode}</span>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />{group.lokasi_nama}
                </div>
              </div>
              <div className="ml-auto text-sm text-gray-500">
                Total: <span className="font-bold text-gray-900">{group.total}</span> kantong
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/50">
                    {BLOOD_TYPES.map(bt => (
                      <th key={bt} className="text-center px-4 py-2.5 font-semibold text-gray-500 text-xs min-w-[80px]">{bt}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {BLOOD_TYPES.map(bt => {
                      const cell = group.golongan[bt];
                      const isEditing = editing?.id === cell?.id;
                      if (!cell) {
                        return <td key={bt} className="px-4 py-4 text-center text-gray-200 text-lg">—</td>;
                      }
                      return (
                        <td key={bt} className="px-4 py-3 text-center">
                          {isEditing ? (
                            <div className="flex flex-col items-center gap-2">
                              <input type="number" min="0" value={editing.val}
                                onChange={e => setEditing(ed => ed ? { ...ed, val: e.target.value } : null)}
                                onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(null); }}
                                autoFocus
                                className="w-16 text-center border-2 border-red-400 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none" />
                              <div className="flex gap-1">
                                <button onClick={saveEdit} disabled={saving} className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                </button>
                                <button onClick={() => setEditing(null)} className="p-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setEditing({ id: cell.id, val: String(cell.jumlah) })}
                              className="group flex flex-col items-center gap-1.5 w-full py-1 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer" title="Klik untuk edit">
                              <span className={`text-xl font-bold ${cell.status === 'kosong' ? 'text-red-600' : cell.status === 'kritis' ? 'text-amber-600' : 'text-gray-900'}`}>
                                {cell.jumlah}
                              </span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor(cell.status)}`}>{cell.status}</span>
                              <Save className="w-3 h-3 text-gray-300 group-hover:text-gray-500 transition-colors" />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </main>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
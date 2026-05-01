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
            <div key={item.label} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 text-center transition-all hover:shadow-md">
              <div className={`text-4xl font-extrabold tracking-tight mb-2 ${item.color}`}>{item.value}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Filter lokasi & Legend */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          {locations.length > 1 && (
            <div className="flex flex-wrap gap-2 items-center bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
              <MapPin className="w-5 h-5 text-gray-400 ml-2" />
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <button onClick={() => setLokasiFilter(undefined)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${!lokasiFilter ? 'bg-red-50 text-red-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                Semua Lokasi
              </button>
              {locations.map(loc => (
                <button key={loc.id} onClick={() => setLokasiFilter(loc.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${lokasiFilter === loc.id ? 'bg-red-50 text-red-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                  {loc.nama_lokasi}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3 p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 text-xs font-bold text-gray-500">
            {[
              { dot: 'bg-green-500', label: 'Normal' },
              { dot: 'bg-amber-400', label: 'Kritis' },
              { dot: 'bg-red-500', label: 'Kosong' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2 px-2">
                <span className={`w-2.5 h-2.5 rounded-full ${l.dot} shadow-sm`} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Stock tables */}
        {dataLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <div className="h-6 bg-gray-50 animate-pulse rounded-lg w-48 mb-6" />
                <div className="grid grid-cols-8 gap-3">
                  {[...Array(8)].map((_, j) => (
                    <div key={j} className="h-20 bg-gray-50 animate-pulse rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-3xl shadow-sm border border-gray-100 font-bold">
            Belum ada data stok darah.
          </div>
        ) : grouped.map(group => (
          <div key={`${group.lokasi_id}-${group.komponen_id}`} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 px-6 py-5 bg-gray-50/50 border-b border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center flex-shrink-0">
                <span className="font-extrabold text-red-600">{group.komponen_kode}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-gray-900 tracking-tight">{group.komponen_nama}</span>
                </div>
                <div className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />{group.lokasi_nama}
                </div>
              </div>
              <div className="ml-auto text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                Total: <span className="font-extrabold text-gray-900 ml-1 text-lg">{group.total}</span> kantong
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {BLOOD_TYPES.map(bt => (
                      <th key={bt} className="text-center px-4 py-4 font-extrabold text-gray-400 text-xs uppercase tracking-widest min-w-[90px] border-b border-gray-100">{bt}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {BLOOD_TYPES.map(bt => {
                      const cell = group.golongan[bt];
                      const isEditing = editing?.id === cell?.id;
                      if (!cell) {
                        return <td key={bt} className="px-4 py-6 text-center text-gray-200 text-lg font-extrabold">—</td>;
                      }
                      return (
                        <td key={bt} className="px-4 py-5 text-center border-r border-gray-50 last:border-0">
                          {isEditing ? (
                            <div className="flex flex-col items-center gap-2">
                              <input type="number" min="0" value={editing.val}
                                onChange={e => setEditing(ed => ed ? { ...ed, val: e.target.value } : null)}
                                onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(null); }}
                                autoFocus
                                className="w-16 text-center border-2 border-red-400 shadow-sm rounded-xl px-2 py-2 text-base font-extrabold focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all" />
                              <div className="flex gap-1">
                                <button onClick={saveEdit} disabled={saving} className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors shadow-sm active:scale-95">
                                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </button>
                                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors shadow-sm active:scale-95">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setEditing({ id: cell.id, val: String(cell.jumlah) })}
                              className="group flex flex-col items-center gap-2 w-full py-2 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer hover:-translate-y-0.5 active:scale-95" title="Klik untuk edit">
                              <span className={`text-3xl font-extrabold tracking-tight transition-colors ${cell.status === 'kosong' ? 'text-red-600' : cell.status === 'kritis' ? 'text-amber-500' : 'text-gray-900 group-hover:text-red-600'}`}>
                                {cell.jumlah}
                              </span>
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${statusColor(cell.status).replace('border-', '')}`}>{cell.status}</span>
                              <Save className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-red-400 transition-all absolute mt-16" />
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
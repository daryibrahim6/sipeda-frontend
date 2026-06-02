'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSidebarToggle } from '@/lib/admin-context';
import { TopBar } from '@/components/admin/TopBar';
import { Loader2, Check, X, Save, RefreshCw, MapPin } from 'lucide-react';
import { getAdminStok, updateStokDarah, type AdminStokRow } from '@/lib/admin-api';
import { getLocations } from '@/lib/api';
import { requireAdminAuth } from '@/lib/auth';
import type { Location } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/toast';

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

export default function AdminStokPage() {
  const toggle = useSidebarToggle();
  const { toast } = useToast();
  const [rows, setRows] = useState<AdminStokRow[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [lokasiFilter, setLokasiFilter] = useState<number | undefined>(undefined);
  const [dataLoading, setDataLoading] = useState(true);
  const [editing, setEditing] = useState<{ id: number; val: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Auth guard (middleware disabled — Supabase v2 uses localStorage)
  useEffect(() => { requireAdminAuth(); }, []);

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
      toast('Gagal memuat data stok.');
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
      toast('Stok berhasil diperbarui.');
      await loadData();
    } catch {
      toast('Gagal update stok.');
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
            <Button variant="ghost" size="sm" onClick={loadData} title="Refresh" icon={<RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />} />
          </div>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Kantong', value: totalUnits, color: 'text-[var(--color-text-primary)]' },
            { label: 'Komponen x Lokasi', value: grouped.length, color: 'text-[var(--color-text-primary)]' },
            { label: 'Perlu Perhatian', value: kritisCount, color: kritisCount > 0 ? 'text-red-600' : 'text-green-600' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-3xl border border-[var(--color-border-muted)] shadow-[var(--shadow-card)] p-6 text-center transition-all hover:shadow-md">
              <div className={`text-4xl font-extrabold tracking-tight mb-2 ${item.color}`}>{item.value}</div>
              <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Filter lokasi & Legend */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          {locations.length > 1 && (
            <div className="flex flex-wrap gap-2 items-center bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border-muted)] p-2">
              <MapPin className="w-5 h-5 text-[var(--color-text-muted)] ml-2" />
              <div className="w-px h-6 bg-[var(--color-border)] mx-1" />
              <button onClick={() => setLokasiFilter(undefined)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${!lokasiFilter ? 'bg-red-50 text-red-700 shadow-[var(--shadow-card)]' : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-section-alt)]'}`}>
                Semua Lokasi
              </button>
              {locations.map(loc => (
                <button key={loc.id} onClick={() => setLokasiFilter(loc.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${lokasiFilter === loc.id ? 'bg-red-50 text-red-700 shadow-[var(--shadow-card)]' : 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-section-alt)]'}`}>
                  {loc.nama_lokasi}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3 p-3.5 bg-white rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border-muted)] text-xs font-bold text-[var(--color-text-muted)]">
            {[
              { dot: 'bg-green-500', label: 'Normal' },
              { dot: 'bg-amber-400', label: 'Kritis' },
              { dot: 'bg-red-500', label: 'Kosong' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2 px-2">
                <span className={`w-2.5 h-2.5 rounded-full ${l.dot} shadow-[var(--shadow-card)]`} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Stock tables */}
        {dataLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-[var(--shadow-card)] border border-[var(--color-border-muted)] p-6">
                <div className="h-6 bg-[var(--color-section-alt)] animate-pulse-soft rounded-lg w-48 mb-6" />
                <div className="grid grid-cols-8 gap-3">
                  {[...Array(8)].map((_, j) => (
                    <div key={j} className="h-20 bg-[var(--color-section-alt)] animate-pulse-soft rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-text-muted)] bg-white rounded-3xl shadow-[var(--shadow-card)] border border-[var(--color-border-muted)] font-bold">
            Belum ada data stok darah.
          </div>
        ) : grouped.map(group => (
          <div key={`${group.lokasi_id}-${group.komponen_id}`} className="bg-white rounded-3xl border border-[var(--color-border-muted)] shadow-[var(--shadow-card)] overflow-hidden">
            <div className="flex items-center gap-4 px-6 py-5 bg-[var(--color-section-alt)]/50 border-b border-[var(--color-border-muted)]">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[var(--color-border)] shadow-[var(--shadow-card)] flex items-center justify-center flex-shrink-0">
                <span className="font-extrabold text-red-600">{group.komponen_kode}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-[var(--color-text-primary)] tracking-tight">{group.komponen_nama}</span>
                </div>
                <div className="text-xs font-bold text-[var(--color-text-muted)] flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />{group.lokasi_nama}
                </div>
              </div>
              <div className="ml-auto text-sm font-bold text-[var(--color-text-muted)] bg-white px-4 py-2 rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-card)]">
                Total: <span className="font-extrabold text-[var(--color-text-primary)] ml-1 text-lg">{group.total}</span> kantong
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {BLOOD_TYPES.map(bt => (
                      <th key={bt} className="text-center px-4 py-4 font-extrabold text-[var(--color-text-muted)] text-xs uppercase tracking-widest min-w-[90px] border-b border-[var(--color-border-muted)]">{bt}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {BLOOD_TYPES.map(bt => {
                      const cell = group.golongan[bt];
                      const isEditing = editing?.id === cell?.id;
                      if (!cell) {
                        return <td key={bt} className="px-4 py-6 text-center text-[var(--color-border)] text-lg font-extrabold">—</td>;
                      }
                      return (
                        <td key={bt} className="px-4 py-5 text-center border-r border-[var(--color-border-muted)]/50 last:border-0">
                          {isEditing ? (
                            <div className="flex flex-col items-center gap-2">
                              <input type="number" min="0" value={editing.val}
                                onChange={e => setEditing(ed => ed ? { ...ed, val: e.target.value } : null)}
                                onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(null); }}
                                autoFocus
                                className="w-16 text-center border-2 border-red-400 shadow-[var(--shadow-card)] rounded-xl px-2 py-2 text-base font-extrabold focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all" />
                              <div className="flex gap-1">
                                <button onClick={saveEdit} disabled={saving} className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors shadow-[var(--shadow-card)] active:scale-95">
                                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </button>
                                <button onClick={() => setEditing(null)} className="p-2 rounded-lg bg-[var(--color-section-alt)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-section-alt)] transition-colors shadow-[var(--shadow-card)] active:scale-95">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setEditing({ id: cell.id, val: String(cell.jumlah) })}
                              className="group flex flex-col items-center gap-2 w-full py-2 rounded-2xl hover:bg-[var(--color-section-alt)] transition-all cursor-pointer active:scale-95" title="Klik untuk edit">
                              <span className={`text-3xl font-extrabold tracking-tight transition-colors ${cell.status === 'kosong' ? 'text-red-600' : cell.status === 'kritis' ? 'text-amber-500' : 'text-[var(--color-text-primary)] group-hover:text-red-600'}`}>
                                {cell.jumlah}
                              </span>
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${statusColor(cell.status).replace('border-', '')}`}>{cell.status}</span>
                              <Save className="w-3.5 h-3.5 text-[var(--color-text-muted)]/50 opacity-0 group-hover:opacity-100 group-hover:text-red-400 transition-all absolute mt-16" />
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

    </div>
  );
}
'use client';

import { useState } from 'react';
import { useSidebarToggle } from '@/app/admin/layout';
import { TopBar } from '@/components/admin/TopBar';
import { Loader2, Check, X, Save } from 'lucide-react';
import { MOCK_BLOOD_STOCK } from '@/lib/mockData';
import type { BloodStockRow, BloodType, StockStatus } from '@/lib/types';
import { BLOOD_TYPES } from '@/lib/utils';

function computeStatus(jumlah: number, kritis: number): StockStatus {
  if (jumlah === 0) return 'kosong';
  if (jumlah <= kritis) return 'kritis';
  return 'normal';
}

const KRITIS_THRESHOLD: Record<string, number> = {
  WB: 10, PRC: 8, TC: 5, FFP: 4,
};

function statusColor(s: StockStatus) {
  return {
    normal: 'text-green-700 bg-green-50 border-green-200',
    kritis: 'text-amber-700 bg-amber-50 border-amber-200',
    kosong: 'text-red-700 bg-red-50 border-red-200',
  }[s];
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

export default function AdminStokPage() {
  const toggle = useSidebarToggle();

  const [rows, setRows] = useState<BloodStockRow[]>(MOCK_BLOOD_STOCK);
  const [editing, setEditing] = useState<{ komponen: string; golongan: BloodType } | null>(null);
  const [editVal, setEditVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function startEdit(komponen: string, golongan: BloodType, currentVal: number) {
    setEditing({ komponen, golongan });
    setEditVal(String(currentVal));
  }

  function cancelEdit() {
    setEditing(null);
    setEditVal('');
  }

  async function saveEdit(komponen: string, golongan: BloodType) {
    const val = parseInt(editVal);
    if (isNaN(val) || val < 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    setRows(prev => prev.map(row => {
      if (row.komponen_kode !== komponen) return row;
      const threshold = KRITIS_THRESHOLD[komponen] ?? 5;
      const newStatus = computeStatus(val, threshold);
      return {
        ...row,
        golongan: {
          ...row.golongan,
          [golongan]: { jumlah: val, status: newStatus },
        },
        total: Object.values({ ...row.golongan, [golongan]: { jumlah: val, status: newStatus } })
          .reduce((sum, g) => sum + g.jumlah, 0),
      };
    }));

    setEditing(null);
    setLoading(false);
    setToast(`Stok ${komponen} — ${golongan} berhasil diperbarui.`);
    setTimeout(() => setToast(null), 3000);
  }

  // Summary stats
  const totalUnits  = rows.reduce((s, r) => s + r.total, 0);
  const kritisCount = rows.reduce((s, r) =>
    s + Object.values(r.golongan).filter(g => g.status !== 'normal').length, 0);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Stok Darah"
        subtitle="Klik sel untuk update jumlah stok"
        onMenuClick={toggle}
        actions={
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="hidden sm:inline">Update terakhir:</span>
            <span className="font-medium text-gray-700">
              {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-5">

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Kantong', value: totalUnits, color: 'text-gray-900' },
            { label: 'Komponen Darah', value: rows.length, color: 'text-gray-900' },
            { label: 'Perlu Perhatian', value: kritisCount, color: kritisCount > 0 ? 'text-red-600' : 'text-green-600' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <div className={`text-2xl font-bold mb-1 ${item.color}`}>{item.value}</div>
              <div className="text-xs text-gray-400">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl border border-gray-100 text-xs text-gray-500">
          <span className="font-semibold text-gray-600">Keterangan:</span>
          {[
            { dot: 'bg-green-500', label: 'Normal — stok cukup' },
            { dot: 'bg-amber-400', label: 'Kritis — perlu penambahan' },
            { dot: 'bg-red-500',   label: 'Kosong — habis' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${l.dot}`} />
              {l.label}
            </div>
          ))}
          <span className="ml-auto italic">Klik sel untuk edit</span>
        </div>

        {/* Stock table */}
        {rows.map(row => (
          <div key={row.komponen_id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
              <div>
                <span className="font-bold text-gray-900">{row.komponen_nama}</span>
                <span className="ml-2 text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{row.komponen_kode}</span>
              </div>
              <div className="ml-auto text-sm text-gray-500">
                Total: <span className="font-bold text-gray-900">{row.total}</span> kantong
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/50">
                    {BLOOD_TYPES.map(bt => (
                      <th key={bt} className="text-center px-4 py-2.5 font-semibold text-gray-500 text-xs min-w-[80px]">
                        {bt}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {BLOOD_TYPES.map(bt => {
                      const cell      = row.golongan[bt];
                      const isEditing = editing?.komponen === row.komponen_kode && editing?.golongan === bt;

                      if (!cell) {
                        return (
                          <td key={bt} className="px-4 py-4 text-center text-gray-200 text-lg">—</td>
                        );
                      }

                      return (
                        <td key={bt} className="px-4 py-3 text-center">
                          {isEditing ? (
                            <div className="flex flex-col items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={editVal}
                                onChange={e => setEditVal(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') saveEdit(row.komponen_kode, bt);
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                autoFocus
                                className="w-16 text-center border-2 border-red-400 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none"
                              />
                              <div className="flex gap-1">
                                <button onClick={() => saveEdit(row.komponen_kode, bt)}
                                  disabled={loading}
                                  className="p-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                </button>
                                <button onClick={cancelEdit}
                                  className="p-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(row.komponen_kode, bt, cell.jumlah)}
                              className="group flex flex-col items-center gap-1.5 w-full py-1 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                              title="Klik untuk edit"
                            >
                              <span className={`text-xl font-bold ${
                                cell.status === 'kosong' ? 'text-red-600' :
                                cell.status === 'kritis' ? 'text-amber-600' : 'text-gray-900'
                              }`}>
                                {cell.jumlah}
                              </span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColor(cell.status)}`}>
                                {cell.status}
                              </span>
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
'use client';

import Link from 'next/link';
import { AlertTriangle, Droplets, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAnnouncements, getStats } from '@/lib/api';

const DISMISS_KEY = 'sipeda-dismissed';

function getDismissed(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(DISMISS_KEY);
    if (!stored) return new Set();
    return new Set(JSON.parse(stored) as string[]);
  } catch { return new Set(); }
}

function markDismissed(id: string) {
  try {
    const stored = localStorage.getItem(DISMISS_KEY);
    const ids: string[] = stored ? JSON.parse(stored) : [];
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(DISMISS_KEY, JSON.stringify(ids));
    }
  } catch { /* noop */ }
}

export function PengumumanDarurat() {
  const [data, setData] = useState<{
    announcements: { id: number; judul: string; isi: string; tipe: string; link: string | null; link_teks: string | null }[];
    stockKritis: number;
  } | null>(null);
  const [dismissedMap, setDismissedMap] = useState<Set<string>>(getDismissed());

  useEffect(() => {
    Promise.allSettled([
      getAnnouncements(),
      getStats(),
    ]).then(([a, s]) => {
      setData({
        announcements: a.status === 'fulfilled' ? a.value : [],
        stockKritis: s.status === 'fulfilled' ? s.value.total_stok_kritis : 0,
      });
    });
  }, []);

  if (!data) return null;

  const { announcements, stockKritis } = data;
  const darurat = announcements.filter(a => a.tipe === 'darurat');
  const nonDarurat = announcements.filter(a => a.tipe !== 'darurat');
  const hasStockCrisis = stockKritis > 0;

  // Filter out dismissed items
  const activeDarurat = darurat.filter(a => !dismissedMap.has(`a-${a.id}`));
  const activeNonDarurat = nonDarurat.filter(a => !dismissedMap.has(`a-${a.id}`));
  const showStockCrisis = hasStockCrisis && !dismissedMap.has('stock-crisis');

  if (activeDarurat.length === 0 && !showStockCrisis && activeNonDarurat.length === 0) return null;

  function handleDismiss(id: string) {
    markDismissed(id);
    setDismissedMap(prev => new Set(prev).add(id));
  }

  return (
    <div className="relative z-50">

      {/* Stock crisis auto-banner */}
      {showStockCrisis && activeDarurat.length === 0 && (
        <div className="bg-gradient-to-r from-red-700 to-[var(--color-primary)] text-white">
          <div className="page-container py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <Droplets className="w-4 h-4" />
              </div>
              <p className="text-sm font-medium truncate">
                <strong>{stockKritis} golongan darah</strong> dalam kondisi kritis — pendonor sangat dibutuhkan!
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/stok-darah" className="text-xs font-bold px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 active:scale-[0.95] transition-all whitespace-nowrap">
                Lihat Detail
              </Link>
              <button onClick={() => handleDismiss('stock-crisis')} aria-label="Tutup pengumuman stok kritis" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Darurat announcements */}
      {activeDarurat.map(a => (
        <div key={a.id} className="bg-gradient-to-r from-red-800 via-red-700 to-[var(--color-primary)] text-white">
          <div className="page-container py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse-soft">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">{a.judul}</p>
                <p className="text-xs text-red-100 truncate">{a.isi}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {a.link && (
                <Link href={a.link} className="text-xs font-bold px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 active:scale-[0.95] transition-all whitespace-nowrap">
                  {a.link_teks ?? 'Selengkapnya'}
                </Link>
              )}
              <button onClick={() => handleDismiss(`a-${a.id}`)} aria-label={`Tutup pengumuman: ${a.judul}`} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Non-darurat announcements (info, sukses, peringatan) */}
      {activeNonDarurat.map(a => (
        <div key={a.id} className={`px-4 py-2.5 text-sm text-center font-medium flex items-center justify-center gap-x-3 gap-y-1 flex-wrap ${a.tipe === 'peringatan' ? 'bg-amber-500 text-white' :
            a.tipe === 'sukses' ? 'bg-green-600 text-white' :
              'bg-blue-600 text-white'
          }`}>
          <span className="font-bold">{a.judul}</span>
          <span className="opacity-60">—</span>
          <span>{a.isi}</span>
          {a.link && (
            <Link href={a.link} className="underline underline-offset-2 font-semibold whitespace-nowrap">
              {a.link_teks ?? 'Selengkapnya'} →
            </Link>
          )}
          <button onClick={() => handleDismiss(`a-${a.id}`)} aria-label={`Tutup pengumuman: ${a.judul}`} className="p-2 hover:bg-white/15 rounded-lg transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

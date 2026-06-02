'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X, Info, CheckCircle2, AlertTriangle, AlertOctagon, ArrowRight } from 'lucide-react';
import type { Announcement } from '@/lib/types';

const STORAGE_KEY_PREFIX = 'sipeda:ann-dismissed:';
const PRIORITY: Record<Announcement['tipe'], number> = {
  darurat: 4,
  peringatan: 3,
  sukses: 2,
  info: 1,
};

const STYLES: Record<Announcement['tipe'], { bg: string; text: string; border: string; Icon: typeof Info }> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-900 dark:text-blue-100',
    border: 'border-blue-200 dark:border-blue-800',
    Icon: Info,
  },
  sukses: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-900 dark:text-green-100',
    border: 'border-green-200 dark:border-green-800',
    Icon: CheckCircle2,
  },
  peringatan: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-900 dark:text-amber-100',
    border: 'border-amber-200 dark:border-amber-800',
    Icon: AlertTriangle,
  },
  darurat: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-900 dark:text-red-100',
    border: 'border-red-200 dark:border-red-800',
    Icon: AlertOctagon,
  },
};

export function AnnouncementBanner() {
  const pathname = usePathname();
  const [top, setTop] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const isExcluded =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/petugas') ||
    pathname === '/login';

  useEffect(() => {
    if (isExcluded) return;
    fetch('/api/announcements')
      .then(r => r.json())
      .then((data: Announcement[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const sorted = [...data].sort((a, b) => PRIORITY[b.tipe] - PRIORITY[a.tipe]);
        setTop(sorted[0]);
      })
      .catch(() => {});
  }, [isExcluded]);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY_PREFIX);
    if (stored) {
      try {
        const arr = JSON.parse(stored) as number[];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDismissed(new Set(arr));
      } catch {}
    }
  }, []);

  if (isExcluded || !top || dismissed.has(top.id)) return null;

  const s = STYLES[top.tipe];
  const Icon = s.Icon;

  function handleDismiss() {
    if (!top) return;
    const next = new Set(dismissed);
    next.add(top.id);
    setDismissed(next);
    const arr = Array.from(next);
    sessionStorage.setItem(STORAGE_KEY_PREFIX, JSON.stringify(arr));
  }

  return (
    <div
      role="region"
      aria-label="Pengumuman"
      className={`${s.bg} ${s.text} ${s.border} border-b`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
        <Icon className="w-4 h-4 flex-shrink-0" aria-hidden />
        <div className="flex-1 min-w-0 text-sm">
          <span className="font-semibold">{top.judul}</span>
          {top.isi && (
            <span className="hidden sm:inline"> — {top.isi}</span>
          )}
          {top.link && top.link_teks && (
            <Link
              href={top.link}
              className="ml-2 inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80"
            >
              {top.link_teks} <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Tutup pengumuman"
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

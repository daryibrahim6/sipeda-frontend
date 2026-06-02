import type { BloodType, ScheduleStatus } from './types';

export const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function formatDate(
  date: string | Date | null | undefined,
  opts?: { short?: boolean; withDay?: boolean },
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  if (opts?.withDay) {
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day:     'numeric',
      month:   'long',
      year:    'numeric',
    });
  }

  if (opts?.short) {
    return d.toLocaleDateString('id-ID', {
      day:   'numeric',
      month: 'short',
      year:  'numeric',
    });
  }

  return d.toLocaleDateString('id-ID', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  });
}

export function formatTime(time: string | null | undefined): string {
  if (!time) return '—';
  return time.length >= 5 ? time.substring(0, 5) : time;
}

export function quotaPercent(sisa_kuota: number, kuota: number): number {
  if (kuota <= 0) return 100;
  const filled = kuota - sisa_kuota;
  return Math.round((filled / kuota) * 100);
}

export function scheduleStatusLabel(status: ScheduleStatus): string {
  return {
    aktif:      'Aktif',
    penuh:      'Penuh',
    dibatalkan: 'Dibatalkan',
    selesai:    'Selesai',
  }[status] ?? status;
}

export function scheduleStatusColor(status: ScheduleStatus): string {
  return {
    aktif:      'text-green-700  bg-green-50  border border-green-200',
    penuh:      'text-amber-700  bg-amber-50  border border-amber-200',
    dibatalkan: 'text-gray-500   bg-gray-50   border border-gray-200',
    selesai:    'text-blue-700   bg-blue-50   border border-blue-200',
  }[status] ?? 'text-gray-500 bg-gray-50';
}

export function sanitizeSearchInput(input: string): string {
  return input
    .trim()
    .replace(/[%_,.()"'\\]/g, '')
    .slice(0, 100);
}

export function fireAndForget(
  promise: PromiseLike<unknown>,
  context: string,
): void {
  Promise.resolve(promise).catch((err) =>
    console.error(`[SIPEDA:${context}]`, err),
  );
}

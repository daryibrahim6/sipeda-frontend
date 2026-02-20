import type { StockStatus, ScheduleStatus, BloodType } from './types';

export const BLOOD_TYPES: BloodType[] = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export const DAYS_ID: Record<string, string> = {
  senin: 'Senin', selasa: 'Selasa', rabu: 'Rabu',
  kamis: 'Kamis', jumat: 'Jumat', sabtu: 'Sabtu', minggu: 'Minggu',
};

export const MONTHS_ID = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString('id-ID', opts ?? {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function formatTime(time: string): string {
  return time.substring(0, 5); // "08:00:00" → "08:00"
}

export function stockStatusLabel(s: StockStatus) {
  return { normal: 'Normal', kritis: 'Kritis', kosong: 'Kosong' }[s];
}

export function stockStatusColor(s: StockStatus) {
  return {
    normal: 'text-green-600 bg-green-50 border-green-200',
    kritis: 'text-amber-600 bg-amber-50 border-amber-200',
    kosong: 'text-red-600  bg-red-50  border-red-200',
  }[s];
}

export function scheduleStatusLabel(s: ScheduleStatus) {
  return { aktif: 'Tersedia', penuh: 'Penuh', dibatalkan: 'Dibatalkan', selesai: 'Selesai' }[s];
}

export function scheduleStatusColor(s: ScheduleStatus) {
  return {
    aktif:      'text-green-700 bg-green-50 border-green-200',
    penuh:      'text-amber-700 bg-amber-50 border-amber-200',
    dibatalkan: 'text-red-700   bg-red-50   border-red-200',
    selesai:    'text-gray-600  bg-gray-50  border-gray-200',
  }[s];
}

export function quotaPercent(sisa: number, total: number): number {
  if (total === 0) return 0;
  return Math.round(((total - sisa) / total) * 100);
}
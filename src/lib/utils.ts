import type { BloodType, ScheduleStatus, StockStatus } from './types';

// ─── Konstanta ────────────────────────────────────────────────────────────────

export const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * Format tanggal ke bahasa Indonesia.
 * Menerima string ISO, Date object, atau null/undefined.
 * @example formatDate('2025-02-21') → "21 Februari 2025"
 */
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

/**
 * Format waktu TIME dari DB (HH:MM:SS atau HH:MM) ke HH:MM.
 * @example formatTime('08:30:00') → "08:30"
 */
export function formatTime(time: string | null | undefined): string {
  if (!time) return '—';
  // HH:MM:SS → HH:MM
  return time.length >= 5 ? time.substring(0, 5) : time;
}

/**
 * Format waktu mulai - selesai.
 * @example formatTimeRange('08:00', '14:00') → "08:00 – 14:00 WIB"
 */
export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)} WIB`;
}

/**
 * Format tanggal relatif (untuk artikel, dll).
 * @example formatDateRelative('2025-02-20') → "kemarin" / "2 hari lalu" / "21 Feb 2025"
 */
export function formatDateRelative(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs  = now.getTime() - d.getTime();
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDay < 0)  return formatDate(date);
  if (diffDay === 0) {
    const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHr < 1) return 'Baru saja';
    if (diffHr < 24) return `${diffHr} jam lalu`;
    return 'Hari ini';
  }
  if (diffDay === 1) return 'Kemarin';
  if (diffDay < 7)   return `${diffDay} hari lalu`;
  if (diffDay < 30)  return `${Math.floor(diffDay / 7)} minggu lalu`;
  return formatDate(date, { short: true });
}

// ─── Jadwal ───────────────────────────────────────────────────────────────────

/**
 * Hitung persentase kuota terisi (0–100).
 * @example quotaPercent(30, 50) → 40
 */
export function quotaPercent(sisa_kuota: number, kuota: number): number {
  if (kuota <= 0) return 100;
  const filled = kuota - sisa_kuota;
  return Math.round((filled / kuota) * 100);
}

/** Label Indonesia untuk status jadwal */
export function scheduleStatusLabel(status: ScheduleStatus): string {
  return {
    aktif:      'Aktif',
    penuh:      'Penuh',
    dibatalkan: 'Dibatalkan',
    selesai:    'Selesai',
  }[status] ?? status;
}

/** Tailwind color classes untuk status jadwal (text + bg + border) */
export function scheduleStatusColor(status: ScheduleStatus): string {
  return {
    aktif:      'text-green-700  bg-green-50  border border-green-200',
    penuh:      'text-amber-700  bg-amber-50  border border-amber-200',
    dibatalkan: 'text-gray-500   bg-gray-50   border border-gray-200',
    selesai:    'text-blue-700   bg-blue-50   border border-blue-200',
  }[status] ?? 'text-gray-500 bg-gray-50';
}

// ─── Stok Darah ──────────────────────────────────────────────────────────────

/** Tailwind color classes untuk status stok */
export function stockStatusColor(status: StockStatus): string {
  return {
    normal: 'text-green-700 bg-green-50 border border-green-200',
    kritis: 'text-amber-700 bg-amber-50 border border-amber-200',
    kosong: 'text-red-700   bg-red-50   border border-red-200',
  }[status] ?? 'text-gray-500 bg-gray-50';
}

/** Label Indonesia untuk status stok */
export function stockStatusLabel(status: StockStatus): string {
  return {
    normal: 'Tersedia',
    kritis: 'Kritis',
    kosong: 'Kosong',
  }[status] ?? status;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

/** Generate kode registrasi format REG-YYYY-NNNNN */
export function generateRegCode(seq: number): string {
  const year = new Date().getFullYear();
  return `REG-${year}-${String(seq).padStart(5, '0')}`;
}

/** Truncate string dengan ellipsis */
export function truncate(str: string, max = 100): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/** Slug generator sederhana (untuk artikel) */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/** Format angka dengan titik ribuan (Indonesia) */
export function formatNumber(n: number): string {
  return n.toLocaleString('id-ID');
}

/**
 * Sanitasi input pencarian sebelum dimasukkan ke PostgREST filter.
 * Menghapus karakter yang bisa memanipulasi filter syntax:
 *   % _  → LIKE wildcards (kita tambahkan sendiri di query)
 *   , .  → PostgREST filter separator (field.op.value, filter1,filter2)
 *   ( )  → PostgREST grouping
 *   " '  → String delimiters
 *   \    → Escape character
 */
export function sanitizeSearchInput(input: string): string {
  return input
    .trim()
    .replace(/[%_,.()"'\\]/g, '')
    .slice(0, 100);
}

// ─── Error Handling Helpers ───────────────────────────────────────────────────

/**
 * Standarisasi error handling untuk Supabase queries.
 * Jika ada error, throw dengan pesan user-friendly + log detail ke console.
 *
 * @param error - Error object dari Supabase response
 * @param context - Nama operasi (untuk logging dan pesan error)
 *
 * @example
 * const { data, error } = await supabase.from('jadwal_donor').select('*');
 * handleSupabaseError(error, 'memuat jadwal');
 */
export function handleSupabaseError(
  error: { message: string; code?: string; details?: string } | null,
  context: string,
): void {
  if (!error) return;
  console.error(`[SIPEDA:${context}]`, error);
  throw new Error(`Gagal ${context}. Silakan coba lagi.`);
}

/**
 * Eksekusi Promise di background tanpa menunggu hasilnya.
 * Error akan di-log ke console, bukan diabaikan.
 *
 * Gunakan ini untuk operasi non-critical seperti:
 * - Update last_login timestamp
 * - Increment article views counter
 *
 * @example
 * fireAndForget(
 *   supabase.from('admins').update({ last_login: new Date().toISOString() }),
 *   'update last_login'
 * );
 */
export function fireAndForget(
  promise: PromiseLike<unknown>,
  context: string,
): void {
  Promise.resolve(promise).catch((err) =>
    console.error(`[SIPEDA:${context}]`, err),
  );
}
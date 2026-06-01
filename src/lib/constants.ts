// ─── Blood Type Constants ──────────────────────────────────────────────────────
export const BLOOD_ORDER: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const GOLDAR_OPTIONS = ['Tidak Tahu', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

// ─── Status Constants ─────────────────────────────────────────────────────────
export type StatusDonor = 'berhasil' | 'gagal' | 'tidak_memenuhi_syarat';
export type RegistrationStatus = 'pending' | 'confirmed' | 'hadir' | 'tidak_hadir' | 'dibatalkan';

export const STATUS_DONOR_OPTIONS: { value: StatusDonor; label: string }[] = [
  { value: 'berhasil', label: 'Berhasil' },
  { value: 'gagal', label: 'Gagal' },
  { value: 'tidak_memenuhi_syarat', label: 'Tidak Memenuhi Syarat' },
];

export const STATUS_REGISTRASI_LABELS: Record<RegistrationStatus, string> = {
  pending: 'Pending',
  confirmed: 'Terkonfirmasi',
  hadir: 'Hadir',
  tidak_hadir: 'Tidak Hadir',
  dibatalkan: 'Dibatalkan',
};

// ─── Color Maps ────────────────────────────────────────────────────────────────
// Blood stock status colors
export const STOCK_BAR_COLORS = {
  normal: 'bg-green-500',
  kritis: 'bg-amber-400',
  kosong: 'bg-red-500',
} as const;

export const STOCK_TEXT_COLORS = {
  normal: 'text-[var(--color-text-primary)]',
  kritis: 'text-amber-600',
  kosong: 'text-[var(--color-primary)]',
} as const;

export const STOCK_LABEL = {
  normal: 'Normal',
  kritis: 'Kritis',
  kosong: 'Kosong',
} as const;

// Registration status colors
export const STATUS_REGISTRASI_COLORS: Record<RegistrationStatus, string> = {
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  confirmed: 'text-blue-700 bg-blue-50 border-blue-200',
  hadir: 'text-green-700 bg-green-50 border-green-200',
  tidak_hadir: 'text-red-700 bg-red-50 border-red-200',
  dibatalkan: 'text-gray-500 bg-gray-50 border-gray-200',
};

// Donor status colors
export const STATUS_DONOR_COLORS: Record<StatusDonor, { bg: string; text: string; border: string; selected: string }> = {
  berhasil: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', selected: 'bg-green-600 text-white border-green-600' },
  gagal: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', selected: 'bg-red-600 text-white border-red-600' },
  tidak_memenuhi_syarat: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', selected: 'bg-amber-600 text-white border-amber-600' },
};

// Location type colors
export const LOKASI_TIPE_COLORS: Record<string, string> = {
  PMI: 'text-red-700 bg-red-50 border-red-200',
  RS: 'text-blue-700 bg-blue-50 border-blue-200',
  Klinik: 'text-purple-700 bg-purple-50 border-purple-200',
  Puskesmas: 'text-green-700 bg-green-50 border-green-200',
};

// Article status colors
export const ARTIKEL_STATUS_COLORS: Record<string, string> = {
  published: 'text-green-700 bg-green-50 border border-green-200',
  draft: 'text-amber-700 bg-amber-50 border border-amber-200',
  archived: 'text-gray-500 bg-gray-100',
};

// User role colors
export const ROLE_COLORS: Record<string, string> = {
  superadmin: 'text-purple-700 bg-purple-50 border-purple-200',
  admin: 'text-blue-700 bg-blue-50 border-blue-200',
  petugas_lapangan: 'text-green-700 bg-green-50 border-green-200',
};

// ─── Reusable Tailwind Class Strings ──────────────────────────────────────────
// Status summary pills
export const STATUS_PILL = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border';

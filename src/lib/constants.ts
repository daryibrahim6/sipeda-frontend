export const BLOOD_ORDER: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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

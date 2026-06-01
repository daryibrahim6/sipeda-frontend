import type { ReactNode } from 'react';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'premium';

type Props = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
};

const variantStyles: Record<Variant, string> = {
  default: 'bg-[#F0EDE8] text-[#5C5348] border-[#E0DAD2]',
  success: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
  warning: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
  danger: 'bg-[var(--color-primary-subtle)] text-[var(--color-primary-dark)] border-[#FECACA]',
  info: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
  premium: 'bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] text-[#78350F] border-[#FCD34D]',
};

export function Badge({ variant = 'default', children, className = '', icon }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border leading-tight ${variantStyles[variant]} ${className}`}>
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </span>
  );
}

const SCHEDULE_BADGE: Record<string, { label: string; variant: Variant }> = {
  aktif: { label: 'Aktif', variant: 'success' },
  penuh: { label: 'Penuh', variant: 'warning' },
  selesai: { label: 'Selesai', variant: 'default' },
  dibatalkan: { label: 'Dibatalkan', variant: 'danger' },
};

export function ScheduleBadge({ status }: { status: string }) {
  const def = SCHEDULE_BADGE[status] ?? { label: status, variant: 'default' as Variant };
  return <Badge variant={def.variant}>{def.label}</Badge>;
}

const STOCK_BADGE: Record<string, { label: string; variant: Variant }> = {
  normal: { label: 'Normal', variant: 'success' },
  kritis: { label: 'Kritis', variant: 'warning' },
  kosong: { label: 'Kosong', variant: 'danger' },
};

export function StockBadge({ status }: { status: string }) {
  const def = STOCK_BADGE[status] ?? { label: status, variant: 'default' as Variant };
  return <Badge variant={def.variant}>{def.label}</Badge>;
}

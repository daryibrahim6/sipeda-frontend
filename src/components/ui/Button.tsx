'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
};

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-accent)] text-white ' +
    'shadow-[var(--shadow-btn-primary)] ' +
    'hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] hover:shadow-[var(--shadow-btn-primary-hover)]',
  secondary:
    'bg-white text-[var(--color-text-primary)] border border-[var(--color-border)] ' +
    'hover:border-[var(--color-primary-light)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]',
  ghost:
    'bg-transparent text-[var(--color-text-secondary)] ' +
    'hover:bg-[#F0EDE8] hover:text-[var(--color-text-primary)]',
  danger:
    'bg-[var(--color-error)] text-white border border-transparent ' +
    'hover:bg-[#b91c1c]',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs rounded-[var(--radius-sm)]',
  md: 'px-5 py-2.5 text-sm rounded-[var(--radius-md)]',
  lg: 'px-6 py-3 text-base rounded-[var(--radius-md)]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

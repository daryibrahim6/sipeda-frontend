'use client';

import type { ReactNode } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

type Variant = 'success' | 'error' | 'warning' | 'info';

type Props = {
  variant?: Variant;
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
};

const variantStyles: Record<Variant, { container: string; icon: string }> = {
  success: {
    container: 'bg-[var(--color-success)]/10 border-[var(--color-success)]/20 text-[var(--color-success)]',
    icon: 'text-[var(--color-success)]',
  },
  error: {
    container: 'bg-[var(--color-error)]/10 border-[var(--color-error)]/20 text-[var(--color-error)]',
    icon: 'text-[var(--color-error)]',
  },
  warning: {
    container: 'bg-[var(--color-warning)]/10 border-[var(--color-warning)]/20 text-[var(--color-warning)]',
    icon: 'text-[var(--color-warning)]',
  },
  info: {
    container: 'bg-[var(--color-info)]/10 border-[var(--color-info)]/20 text-[var(--color-info)]',
    icon: 'text-[var(--color-info)]',
  },
};

const defaultIcons: Record<Variant, ReactNode> = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

export function Alert({
  variant = 'info',
  title,
  children,
  icon,
  dismissible = false,
  onDismiss,
  className = '',
}: Props) {
  const styles = variantStyles[variant];

  return (
    <div className={`flex items-start gap-3 rounded-[var(--radius-lg)] border px-4 py-3.5 text-sm ${styles.container} ${className}`}>
      <div className={`flex-shrink-0 mt-0.5 ${styles.icon}`}>
        {icon ?? defaultIcons[variant]}
      </div>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="leading-relaxed">{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-[var(--radius-sm)] opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

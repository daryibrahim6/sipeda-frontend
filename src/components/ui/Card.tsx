import type { HTMLAttributes } from 'react';

type Variant = 'default' | 'interactive' | 'elevated' | 'flush';

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  padding?: boolean;
  accent?: 'none' | 'top' | 'left';
};

const base = 'transition-all duration-300 ease-out';

const variantStyles: Record<Variant, string> = {
  default: `${base} bg-white border border-[var(--color-border-muted)] rounded-[var(--radius-card)] p-6 card-shadow`,
  interactive: `${base} bg-white border border-[var(--color-border-muted)] rounded-[var(--radius-card)] p-6 cursor-pointer card-shadow card-shadow-hover border-l-[3px] border-l-transparent hover:border-l-[var(--color-primary)] hover:border-[var(--color-border)]`,
  elevated: `${base} bg-white border border-[var(--color-border-muted)] rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-elevated)] card-shadow-hover`,
  flush: `bg-transparent border-none p-0 rounded-none`,
};

const accentStyles: Record<string, string> = {
  top: 'border-t-[3px] border-t-[var(--color-primary)]',
  left: 'border-l-[3px] border-l-[var(--color-primary)]',
};

export function Card({ variant = 'default', padding = true, accent = 'none', children, className = '', ...props }: Props) {
  const accentClass = accent !== 'none' ? accentStyles[accent] : '';
  const noPad = !padding ? '!p-0' : '';
  return (
    <div className={`${variantStyles[variant]} ${accentClass} ${noPad} ${className}`} {...props}>
      {children}
    </div>
  );
}

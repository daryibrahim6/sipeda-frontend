'use client';

import { Menu } from 'lucide-react';

type Props = {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  actions?: React.ReactNode;
};

export function TopBar({ title, subtitle, onMenuClick, actions }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-border-muted)] px-4 sm:px-6 h-16 flex items-center gap-4">

      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-section-alt)] active:scale-[0.93] transition-all"
        aria-label="Buka menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-[var(--color-text-primary)] leading-none">{title}</h1>
        {subtitle && (
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {actions}
      </div>
    </header>
  );
}
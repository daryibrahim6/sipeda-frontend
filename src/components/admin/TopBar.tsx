'use client';

import { Menu, Bell } from 'lucide-react';

type Props = {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  actions?: React.ReactNode;
};

export function TopBar({ title, subtitle, onMenuClick, actions }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-6 h-16 flex items-center gap-4">

      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Buka menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-gray-900 leading-none">{title}</h1>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {actions}
        <button
          className="relative p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="Notifikasi"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
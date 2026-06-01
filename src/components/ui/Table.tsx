'use client';

import type { ReactNode } from 'react';

export type Column<T> = {
  key: string;
  label: string;
  hide?: 'never' | 'sm' | 'md' | 'lg';
  render?: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
};

const hideClass: Record<string, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyState,
  onRowClick,
  className = '',
}: Props<T>) {
  return (
    <div className={`bg-white rounded-3xl border border-[var(--color-border-muted)] overflow-hidden shadow-[var(--shadow-card)] ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-muted)] bg-[var(--color-section-alt)]/50 backdrop-blur-sm">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`text-left px-5 py-3.5 font-semibold text-[var(--color-text-muted)] text-xs uppercase tracking-wide ${col.hide && col.hide !== 'never' ? hideClass[col.hide] : ''} ${col.headerClassName ?? ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-muted)]">
            {loading ? (
              [...Array(5)].map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`px-5 py-4 ${col.hide && col.hide !== 'never' ? hideClass[col.hide] : ''}`}
                    >
                      <div className="h-4 bg-[var(--color-section-alt)] animate-pulse-soft rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-4">
                  {emptyState ?? (
                    <div className="text-center py-12 text-[var(--color-text-muted)] text-sm">
                      Tidak ada data.
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={(row.id as string) ?? rowIdx}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-[var(--color-section-alt)]/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={`px-5 py-4 text-[var(--color-text-secondary)] ${col.hide && col.hide !== 'never' ? hideClass[col.hide] : ''} ${col.className ?? ''}`}
                    >
                      {col.render ? col.render(row) : <span className="text-[var(--color-text-primary)]">{String(row[col.key] ?? '')}</span>}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

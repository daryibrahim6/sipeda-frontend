import type { BloodStockRow, BloodType } from '@/lib/types';
import { StockBadge } from '@/components/ui/Badge';

const BLOOD_TYPES: BloodType[] = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

type Props = {
  rows: BloodStockRow[];
  title?: string;
};

export function BloodStockTable({ rows, title }: Props) {
  if (!rows.length) {
    return (
      <div className="text-center py-12 text-[var(--color-text-muted)]">
        Data stok belum tersedia
      </div>
    );
  }

  return (
    <div>
      {title && <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">{title}</h2>}
      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-section-alt)] border-b border-[var(--color-border)]">
              <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)] min-w-[140px]">
                Komponen
              </th>
              {BLOOD_TYPES.map(bt => (
                <th key={bt} className="text-center px-3 py-3 font-semibold text-[var(--color-text-secondary)] min-w-[60px]">
                  {bt}
                </th>
              ))}
              <th className="text-center px-3 py-3 font-semibold text-[var(--color-text-secondary)]">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-muted)]">
            {rows.map(row => (
              <tr key={row.komponen_id} className="hover:bg-[var(--color-section-alt)] active:bg-[var(--color-section-alt)] transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--color-text-primary)]">{row.komponen_nama}</div>
                  <div className="text-xs text-[var(--color-text-muted)] font-mono">{row.komponen_kode}</div>
                </td>
                {BLOOD_TYPES.map(bt => {
                  const cell = row.golongan[bt];
                  return (
                    <td key={bt} className="px-3 py-3 text-center">
                      {cell ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className={`font-semibold ${
                            cell.status === 'normal' ? 'text-[var(--color-text-primary)]' :
                            cell.status === 'kritis' ? 'text-amber-600' : 'text-[var(--color-primary)]'
                          }`}>
                            {cell.jumlah}
                          </span>
                          {cell.status !== 'normal' && (
                            <StockBadge status={cell.status} />
                          )}
                        </div>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-3 text-center">
                  <span className="font-bold text-[var(--color-text-primary)]">{row.total}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
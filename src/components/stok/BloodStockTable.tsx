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
      <div className="text-center py-12 text-gray-400">
        Data stok belum tersedia
      </div>
    );
  }

  return (
    <div>
      {title && <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[140px]">
                Komponen
              </th>
              {BLOOD_TYPES.map(bt => (
                <th key={bt} className="text-center px-3 py-3 font-semibold text-gray-600 min-w-[60px]">
                  {bt}
                </th>
              ))}
              <th className="text-center px-3 py-3 font-semibold text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(row => (
              <tr key={row.komponen_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{row.komponen_nama}</div>
                  <div className="text-xs text-gray-400 font-mono">{row.komponen_kode}</div>
                </td>
                {BLOOD_TYPES.map(bt => {
                  const cell = row.golongan[bt];
                  return (
                    <td key={bt} className="px-3 py-3 text-center">
                      {cell ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className={`font-semibold ${
                            cell.status === 'normal' ? 'text-gray-900' :
                            cell.status === 'kritis' ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {cell.jumlah}
                          </span>
                          {cell.status !== 'normal' && (
                            <StockBadge status={cell.status} />
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-3 text-center">
                  <span className="font-bold text-gray-900">{row.total}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
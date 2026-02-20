import type { LucideIcon } from 'lucide-react';

type Props = {
  icon: LucideIcon;
  iconColor?: string;
  value: number | string;
  label: string;
  sub?: string;
  alert?: boolean;
};

export function StatCard({ icon: Icon, iconColor = 'text-red-600', value, label, sub, alert }: Props) {
  return (
    <div className={`bg-white rounded-2xl border p-5 flex items-start gap-4 ${
      alert ? 'border-amber-200 bg-amber-50' : 'border-gray-100 shadow-sm'
    }`}>
      <div className={`p-2.5 rounded-xl ${alert ? 'bg-amber-100' : 'bg-red-50'}`}>
        <Icon className={`w-5 h-5 ${alert ? 'text-amber-600' : iconColor}`} />
      </div>
      <div className="min-w-0">
        <div className={`text-2xl font-bold ${alert ? 'text-amber-700' : 'text-gray-900'}`}>
          {value}
        </div>
        <div className="text-sm font-medium text-gray-700 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}
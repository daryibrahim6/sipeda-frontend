import type { LucideIcon } from 'lucide-react';

type Props = {
  icon: LucideIcon;
  iconColor?: string;
  value: number | string;
  label: string;
  sub?: string;
  alert?: boolean;
};

export function StatCard({ icon: Icon, iconColor = 'text-[var(--color-primary)]', value, label, sub, alert }: Props) {
  return (
    <div className={`bg-white rounded-3xl border p-5 flex items-start gap-4 ${
      alert ? 'border-amber-200 bg-amber-50' : 'border-[var(--color-border-muted)] shadow-[var(--shadow-card)]'
    }`}>
      <div className={`p-2.5 rounded-2xl ${alert ? 'bg-amber-100' : 'bg-[var(--color-primary-subtle)]'}`}>
        <Icon className={`w-5 h-5 ${alert ? 'text-amber-600' : iconColor}`} />
      </div>
      <div className="min-w-0">
        <div className={`text-2xl font-bold ${alert ? 'text-amber-700' : 'text-[var(--color-text-primary)]'}`}>
          {value}
        </div>
        <div className="text-sm font-medium text-[var(--color-text-secondary)] mt-0.5">{label}</div>
        {sub && <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

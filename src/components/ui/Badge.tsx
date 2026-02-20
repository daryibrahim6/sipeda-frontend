import type { StockStatus, ScheduleStatus } from '@/lib/types';

type Tone = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

const toneClass: Record<Tone, string> = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger:  'bg-red-50   text-red-700   border-red-200',
  info:    'bg-blue-50  text-blue-700  border-blue-200',
  muted:   'bg-gray-50  text-gray-500  border-gray-200',
};

export function Badge({ tone = 'default', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${toneClass[tone]}`}>
      {children}
    </span>
  );
}

export function StockBadge({ status }: { status: StockStatus }) {
  const map: Record<StockStatus, { tone: Tone; label: string; dot: string }> = {
    normal:  { tone: 'success', label: 'Normal',  dot: 'bg-green-500' },
    kritis:  { tone: 'warning', label: 'Kritis',  dot: 'bg-amber-500' },
    kosong:  { tone: 'danger',  label: 'Kosong',  dot: 'bg-red-500'   },
  };
  const { tone, label, dot } = map[status];
  return (
    <Badge tone={tone}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </Badge>
  );
}

export function ScheduleBadge({ status }: { status: ScheduleStatus }) {
  const map: Record<ScheduleStatus, { tone: Tone; label: string }> = {
    aktif:      { tone: 'success', label: 'Tersedia' },
    penuh:      { tone: 'warning', label: 'Penuh' },
    dibatalkan: { tone: 'danger',  label: 'Dibatalkan' },
    selesai:    { tone: 'muted',   label: 'Selesai' },
  };
  const { tone, label } = map[status];
  return <Badge tone={tone}>{label}</Badge>;
}
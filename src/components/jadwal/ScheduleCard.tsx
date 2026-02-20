import Link from 'next/link';
import type { Schedule } from '@/lib/types';
import { ScheduleBadge } from '@/components/ui/Badge';
import { formatDate, formatTime, quotaPercent } from '@/lib/utils';

export function ScheduleCard({ schedule }: { schedule: Schedule }) {
  const pct = quotaPercent(schedule.sisa_kuota, schedule.kuota);
  const isFull = schedule.status === 'penuh' || schedule.sisa_kuota === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-gray-900 leading-snug">
            {schedule.lokasi?.nama_lokasi ?? `Jadwal #${schedule.id}`}
          </div>
          <div className="text-sm text-gray-500 mt-0.5">
            {schedule.lokasi?.kecamatan}
          </div>
        </div>
        <ScheduleBadge status={schedule.status} />
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Tanggal</div>
          <div className="font-medium text-gray-800">{formatDate(schedule.tanggal)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-0.5">Waktu</div>
          <div className="font-medium text-gray-800">
            {formatTime(schedule.waktu_mulai)} – {formatTime(schedule.waktu_selesai)} WIB
          </div>
        </div>
      </div>

      {/* Quota bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Kuota terisi</span>
          <span className="font-medium text-gray-800">
            {schedule.kuota - schedule.sisa_kuota} / {schedule.kuota} orang
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-400' : 'bg-green-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/jadwal/${schedule.id}`}
        className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          isFull
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        {isFull ? 'Kuota Penuh' : 'Daftar Sekarang'}
      </Link>
    </div>
  );
}
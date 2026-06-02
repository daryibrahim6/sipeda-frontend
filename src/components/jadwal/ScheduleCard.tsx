import Link from 'next/link';
import { MapPin, Clock, Users, AlertTriangle, Share2 } from 'lucide-react';
import type { Schedule } from '@/lib/types';
import { ScheduleBadge } from '@/components/ui/Badge';
import { formatDate, formatTime, quotaPercent } from '@/lib/utils';

export function ScheduleCard({ schedule }: { schedule: Schedule }) {
  const filled = schedule.kuota - schedule.sisa_kuota;
  const pct = quotaPercent(schedule.sisa_kuota, schedule.kuota);
  const isFull = schedule.status === 'penuh' || schedule.sisa_kuota === 0;
  const isAlmost = !isFull && pct >= 75;

  const barColor =
    isFull ? 'bg-red-500' :
      isAlmost ? 'bg-amber-400' :
        pct >= 50 ? 'bg-blue-400' : 'bg-green-500';

  return (
    <div className={`bg-white rounded-3xl border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] ring-1 ring-black/[0.03] hover:ring-red-200/50 transition-all duration-300 ease-out flex flex-col gap-0 overflow-hidden ${isFull ? 'border-[var(--color-border-muted)] opacity-75 grayscale-[0.2]' :
      isAlmost ? 'border-amber-200' :
        'border-[var(--color-border-muted)] card-shadow-hover hover:border-[var(--color-border)]'
      }`}>
      {/* ── Urgency banner ── */}
      {isAlmost && !isFull && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-amber-700">
            Hampir penuh — sisa {schedule.sisa_kuota} slot
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* ── Header: nama + badge ── */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[var(--color-text-primary)] leading-snug line-clamp-2">
              {schedule.lokasi?.nama_lokasi ?? `Jadwal #${schedule.id}`}
            </h3>
            {schedule.lokasi?.alamat && (
              <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mt-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{schedule.lokasi.kecamatan}</span>
              </div>
            )}
          </div>
          <ScheduleBadge status={schedule.status} />
        </div>

        {/* ── Info grid ── */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-[var(--color-section-alt)] rounded-2xl px-4 py-3">
            <div className="text-[10px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wide mb-1">Tanggal</div>
            <div className="font-bold text-[var(--color-text-primary)] text-sm">{formatDate(schedule.tanggal)}</div>
          </div>
          <div className="bg-[var(--color-section-alt)] rounded-2xl px-4 py-3">
            <div className="text-[10px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wide mb-1">Waktu</div>
            <div className="font-bold text-[var(--color-text-primary)] text-sm flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              {formatTime(schedule.waktu_mulai)} – {formatTime(schedule.waktu_selesai)}
            </div>
          </div>
        </div>

        {/* ── Kuota bar ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
              <Users className="w-3 h-3" />
              <span>Kuota terisi</span>
            </div>
            <span className={`text-xs font-bold ${isFull ? 'text-[var(--color-primary)]' : isAlmost ? 'text-amber-600' : 'text-[var(--color-text-primary)]'
              } tabular-nums`}>
              {filled} / {schedule.kuota}
            </span>
          </div>
          <div className="h-2.5 bg-[var(--color-section-alt)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {!isFull && (
            <div className="text-xs text-[var(--color-text-muted)] mt-1 text-right tabular-nums">
              {schedule.sisa_kuota} slot tersisa
            </div>
          )}
        </div>

        {/* ── Deskripsi singkat ── */}
        {schedule.deskripsi && (
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2 -mt-1">
            {schedule.deskripsi}
          </p>
        )}
      </div>

      {/* ── CTA + Share ── */}
      <div className="px-5 pb-5 flex items-center gap-3">
        <Link
          href={`/jadwal/${schedule.id}`}
          className={`flex-1 block text-center py-2.5 rounded-2xl text-sm font-bold transition-all ${isFull
            ? 'bg-[var(--color-section-alt)] text-[var(--color-text-muted)] cursor-not-allowed pointer-events-none'
            : isAlmost
              ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-200'
              : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg shadow-black/15'
            } active:scale-[0.98]`}
        >
          {isFull ? 'Kuota Penuh' : isAlmost ? 'Daftar Sebelum Penuh!' : 'Daftar Sekarang'}
        </Link>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            `📢 *Jadwal Donor Darah*\n\n📍 ${schedule.lokasi?.nama_lokasi ?? 'PMI Indramayu'}\n📅 ${formatDate(schedule.tanggal)}\n🕐 ${formatTime(schedule.waktu_mulai)} – ${formatTime(schedule.waktu_selesai)} WIB\n👥 Sisa kuota: ${schedule.sisa_kuota} slot\n\nDaftar di:\n🔗 https://sipeda.vercel.app/jadwal/${schedule.id}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Bagikan ke WhatsApp"
          className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl border border-[var(--color-border-muted)] text-[var(--color-text-muted)] hover:text-green-600 hover:border-green-200 hover:bg-green-50 transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import { useSidebarToggle } from '@/lib/admin-context';
import { TopBar } from '@/components/admin/TopBar';
import {
  Droplets, Calendar, AlertTriangle,
  ArrowUpRight, TrendingUp, ClipboardList,
} from 'lucide-react';
import { getDashboardStats, getUpcomingSchedules, getBloodStockSummary } from '@/lib/api';
import {
  getMonthlyTrends, getBloodTypeDistribution, getSuccessRate, getGenderDistribution,
  type MonthlyTrend, type BloodTypeDist, type StatusRate, type GenderDist,
} from '@/lib/admin-api';
import { formatDate, BLOOD_TYPES } from '@/lib/utils';
import type { Schedule } from '@/lib/types';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { BarChart } from '@/components/admin/charts/BarChart';
import { DonutChart } from '@/components/admin/charts/DonutChart';
import { generateMonthlyReport } from '@/lib/report';

// ─── Blood stock mini chart ───────────────────────────────────────────────────
function BloodStockChart({ data }: {
  data: { golongan_darah: string; total: number; status: string }[];
}) {
  const ordered = BLOOD_TYPES.map(bt => data.find(d => d.golongan_darah === bt) ?? { golongan_darah: bt, total: 0, status: 'normal' });
  const max = Math.max(...ordered.map(d => d.total), 1);

  return (
    <div className="space-y-2.5">
      {ordered.map(d => {
        const pct = Math.round((d.total / max) * 100);
        const color = d.status === 'kosong' ? 'bg-red-500' : d.status === 'kritis' ? 'bg-amber-400' : 'bg-green-500';
        return (
          <div key={d.golongan_darah} className="flex items-center gap-3">
            <span className="w-8 text-right text-xs font-mono font-bold text-[var(--color-text-muted)] flex-shrink-0">
              {d.golongan_darah}
            </span>
            <div className="flex-1 bg-[var(--color-section-alt)] rounded-full h-5 overflow-hidden">
              <div
                className={`h-full rounded-full ${color} flex items-center px-2 transition-all duration-700`}
                style={{ width: `${Math.max(pct, 4)}%` }}
              >
                {pct > 15 && (
                  <span className="text-[10px] font-bold text-white">{d.total}</span>
                )}
              </div>
            </div>
            <span className="w-6 text-left text-xs font-semibold text-[var(--color-text-secondary)] flex-shrink-0">
              {pct <= 15 ? d.total : ''}
            </span>
          </div>
        );
      })}
      <div className="flex gap-4 mt-4 text-xs text-[var(--color-text-muted)]">
        {[
          { dot: 'bg-green-500', label: 'Normal' },
          { dot: 'bg-amber-400', label: 'Kritis' },
          { dot: 'bg-red-500', label: 'Kosong' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${l.dot}`} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const toggle = useSidebarToggle();

  const [stats, setStats] = useState<{ total_stok: number; jadwal_aktif: number; lokasi_aktif: number; total_stok_kritis: number; registrasi_bulan_ini: number } | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [bloodData, setBloodData] = useState<{ golongan_darah: string; total: number; status: string }[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [bloodTypeDist, setBloodTypeDist] = useState<BloodTypeDist[]>([]);
  const [successRate, setSuccessRate] = useState<StatusRate[]>([]);
  const [genderDist, setGenderDist] = useState<GenderDist[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchErrors, setFetchErrors] = useState<string[]>([]);

  const cancelRef = useRef(false);

  async function loadDashboard() {
    setFetchErrors([]);
    const failed: string[] = [];
    const [s, sc, bd, mt, btd, sr, gd] = await Promise.allSettled([
      getDashboardStats(),
      getUpcomingSchedules(5),
      getBloodStockSummary(),
      getMonthlyTrends(),
      getBloodTypeDistribution(),
      getSuccessRate(),
      getGenderDistribution(),
    ]);
    if (cancelRef.current) return;
    if (s.status === 'fulfilled') setStats(s.value); else failed.push('statistik');
    if (sc.status === 'fulfilled') setSchedules(sc.value); else failed.push('jadwal');
    if (bd.status === 'fulfilled') setBloodData(bd.value); else failed.push('stok darah');
    if (mt.status === 'fulfilled') setMonthlyTrends(mt.value); else failed.push('tren');
    if (btd.status === 'fulfilled') setBloodTypeDist(btd.value); else failed.push('distribusi golongan darah');
    if (sr.status === 'fulfilled') setSuccessRate(sr.value); else failed.push('tingkat keberhasilan');
    if (gd.status === 'fulfilled') setGenderDist(gd.value); else failed.push('demografi');
    setFetchErrors(failed);
    setLoading(false);
  }

  useEffect(() => {
    cancelRef.current = false;
    void Promise.resolve().then(loadDashboard);
    return () => { cancelRef.current = true; };
  }, []);

  const criticalBlood = bloodData.filter(d => d.status !== 'normal').slice(0, 6);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Dashboard"
        subtitle={`Selamat datang — ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
        onMenuClick={toggle}
      />

      <main className="flex-1 p-4 sm:p-6 space-y-6">

        {/* ── Error retry banner ── */}
        {fetchErrors.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">
                Gagal memuat: {fetchErrors.join(', ')}
              </p>
            </div>
            <button
              onClick={loadDashboard}
              className="px-4 py-2 text-sm font-semibold bg-amber-600 text-white rounded-xl hover:bg-amber-700 active:scale-[0.97] transition-all flex-shrink-0"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* ── Stats bento ── */}
         {loading ? (
           <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="bg-white rounded-[var(--radius-card)] border border-[var(--color-border-muted)] p-5 h-32 animate-pulse-soft-soft" />
             ))}
           </div>
         ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <Card variant="elevated" className="flex flex-col gap-1 border-t-4 border-t-primary">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Total Stok</span>
                <Droplets className="w-5 h-5 text-primary" />
              </div>
              <span className="text-4xl font-extrabold text-[var(--color-text-primary)]">{stats?.total_stok ?? '—'}</span>
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">kantong tersedia</span>
            </Card>
            <Card variant="elevated" className="flex flex-col gap-1 border-t-4 border-t-amber-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Jadwal Aktif</span>
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-4xl font-extrabold text-[var(--color-text-primary)]">{stats?.jadwal_aktif ?? '—'}</span>
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">bulan ini</span>
            </Card>
            <Card variant="elevated" className="flex flex-col gap-1 border-t-4 border-t-green-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Registrasi</span>
                <ClipboardList className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-4xl font-extrabold text-[var(--color-text-primary)]">{stats?.registrasi_bulan_ini ?? '—'}</span>
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">bulan ini</span>
            </Card>
            <Card variant="elevated" className={`flex flex-col gap-1 border-t-4 ${(stats?.total_stok_kritis ?? 0) > 0 ? 'border-t-red-500 bg-[var(--color-primary-subtle)]/50' : 'border-t-[var(--color-border-muted)]'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Stok Kritis</span>
                <AlertTriangle className={`w-5 h-5 ${(stats?.total_stok_kritis ?? 0) > 0 ? 'text-red-500' : 'text-[var(--color-text-muted)]/60'}`} />
              </div>
              <span className={`text-4xl font-extrabold ${(stats?.total_stok_kritis ?? 0) > 0 ? 'text-red-700' : 'text-[var(--color-text-primary)]'}`}>{stats?.total_stok_kritis ?? '—'}</span>
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">perlu perhatian</span>
            </Card>
          </div>
        )}

        {/* ── Two column ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

          {/* Blood stock chart */}
          <Card variant="elevated" padding={false}>
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-extrabold text-[var(--color-text-primary)]">Stok Darah</h2>
                  <p className="text-xs font-bold text-[var(--color-text-muted)] mt-1 uppercase tracking-wide">Per golongan darah (semua komponen)</p>
                </div>
                <Link href="/admin/stok-darah"
                  className="text-xs font-bold text-[var(--color-primary)] hover:text-red-700 bg-[var(--color-primary-subtle)] hover:bg-red-100 px-3 py-2 rounded-full transition-colors flex items-center gap-1">
                  Kelola <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {loading
                ? <div className="h-40 animate-pulse-soft bg-[var(--color-section-alt)] rounded-[var(--radius-button)]" />
                : <BloodStockChart data={bloodData} />
              }
            </div>
          </Card>

          {/* Critical stock alert */}
          <Card variant="elevated" padding={false}>
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-extrabold text-[var(--color-text-primary)]">Stok Perhatian</h2>
                  <p className="text-xs font-bold text-[var(--color-text-muted)] mt-1 uppercase tracking-wide">Kritis & Kosong</p>
                </div>
                <Badge variant={criticalBlood.length > 0 ? 'danger' : 'success'}>
                  {criticalBlood.length} item
                </Badge>
              </div>
              {loading
                ? <div className="h-32 animate-pulse-soft bg-[var(--color-section-alt)] rounded-[var(--radius-button)]" />
                : criticalBlood.length === 0 ? (
                  <div className="text-center py-8 text-[var(--color-text-muted)] text-sm font-bold bg-[var(--color-section-alt)] rounded-[var(--radius-button)] border border-[var(--color-border-muted)] border-dashed">
                    Semua stok dalam kondisi normal ✓
                  </div>
                ) : (
                  <div className="space-y-3">
                    {criticalBlood.map((item, i) => (
                      <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl ${item.status === 'kosong' ? 'bg-red-50/50 border border-red-100' : 'bg-amber-50/50 border border-amber-100'
                        }`}>
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[var(--shadow-card)] ${item.status === 'kosong' ? 'bg-red-500 shadow-red-500/50' : 'bg-amber-400 shadow-amber-400/50'
                          }`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-extrabold text-[var(--color-text-primary)]">
                            Golongan {item.golongan_darah}
                          </div>
                          <div className="text-xs font-semibold text-[var(--color-text-muted)] mt-0.5">
                            {item.total} kantong · <span className={item.status === 'kosong' ? 'text-red-600' : 'text-amber-600'}>{item.status === 'kosong' ? 'Habis' : 'Kritis'}</span>
                          </div>
                        </div>
                        <Badge variant={item.status === 'kosong' ? 'danger' : 'warning'}>{item.status}</Badge>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            ANALYTICS — Tren, Demografi, Tingkat Keberhasilan
           ═══════════════════════════════════════════════════════════════ */}

        {/* ── Row: Monthly Trend (full-width bar chart) ── */}
        <Card variant="elevated" padding={false}>
          <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-extrabold text-[var(--color-text-primary)]">Tren Donasi Bulanan</h2>
                <p className="text-xs font-bold text-[var(--color-text-muted)] mt-1 uppercase tracking-wide">12 bulan terakhir</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const now = new Date();
                    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                    generateMonthlyReport({
                      month,
                      monthlyTrends,
                      bloodTypeDist,
                      successRate,
                      genderDist,
                      stats: {
                        total_stok: stats?.total_stok ?? 0,
                        total_stok_kritis: stats?.total_stok_kritis ?? 0,
                        registrasi_bulan_ini: stats?.registrasi_bulan_ini ?? 0,
                        jadwal_aktif: stats?.jadwal_aktif ?? 0,
                      },
                    });
                  }}
                  className="text-xs font-bold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] px-3 py-1.5 rounded-full active:scale-[0.95] transition-all flex items-center gap-1"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Download Laporan
                </button>
              </div>
            </div>
            {loading ? (
              <div className="h-52 animate-pulse-soft bg-[var(--color-section-alt)] rounded-[var(--radius-button)]" />
            ) : monthlyTrends.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-text-muted)] text-sm font-bold bg-[var(--color-section-alt)] rounded-[var(--radius-button)] border border-[var(--color-border-muted)] border-dashed">
                Belum ada data donasi 12 bulan terakhir.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Bar chart — total per bulan */}
                <BarChart
                  data={monthlyTrends.map(m => ({
                    label: m.bulan.slice(5),
                    value: m.berhasil + m.gagal + m.tms,
                    color: '#C62828',
                  }))}
                  height={180}
                />
                {/* Color-coded legend + month table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-wrap gap-4 text-xs">
                    {[
                      { label: 'Berhasil', color: 'bg-green-500' },
                      { label: 'Gagal', color: 'bg-red-400' },
                      { label: 'TMS', color: 'bg-amber-400' },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                        <span className="text-[var(--color-text-secondary)]">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Compact month breakdown table */}
                <div className="overflow-x-auto -mx-6 lg:-mx-8">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--color-border-muted)]">
                        <th className="text-left px-6 py-2 font-bold text-[var(--color-text-muted)]">Bulan</th>
                        <th className="text-right px-2 py-2 font-bold text-green-600">Berhasil</th>
                        <th className="text-right px-2 py-2 font-bold text-red-400">Gagal</th>
                        <th className="text-right px-2 py-2 font-bold text-amber-500">TMS</th>
                        <th className="text-right px-6 py-2 font-bold text-[var(--color-text-muted)]">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyTrends.map(m => {
                        const total = m.berhasil + m.gagal + m.tms;
                        const [y, mo] = m.bulan.split('-');
                        const bulanNama = new Date(+y, +mo - 1).toLocaleDateString('id-ID', { month: 'short' });
                        return (
                          <tr key={m.bulan} className="border-b border-[var(--color-border-muted)]/50 hover:bg-[var(--color-section-alt)] transition-colors">
                            <td className="px-6 py-2 font-semibold text-[var(--color-text-primary)]">{bulanNama} {y}</td>
                            <td className="text-right px-2 py-2 text-green-700 font-semibold">{m.berhasil}</td>
                            <td className="text-right px-2 py-2 text-red-500 font-semibold">{m.gagal}</td>
                            <td className="text-right px-2 py-2 text-amber-600 font-semibold">{m.tms}</td>
                            <td className="text-right px-6 py-2 font-extrabold text-[var(--color-text-primary)]">{total}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ── Row: Demografi + Distribusi (3-column grid) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Blood type distribution */}
          <Card variant="elevated" padding={false}>
            <div className="p-6 lg:p-8">
              <h3 className="text-sm font-extrabold text-[var(--color-text-primary)] mb-2">Distribusi Golongan Darah</h3>
              <p className="text-xs font-bold text-[var(--color-text-muted)] mb-5 uppercase tracking-wide">Donor berhasil</p>
              {loading ? (
                <div className="h-40 animate-pulse-soft bg-[var(--color-section-alt)] rounded-[var(--radius-button)]" />
              ) : bloodTypeDist.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-text-muted)] text-xs font-bold">Belum ada data.</div>
              ) : (
                <DonutChart
                  data={bloodTypeDist.map((d, i) => ({
                    label: d.golongan_darah,
                    value: d.total,
                    color: ['#C62828', '#D32F2F', '#E57373', '#FF8A80', '#EF5350', '#EC407A', '#E53935', '#B71C1C'][i % 8],
                  }))}
                  size={140}
                  thickness={28}
                />
              )}
            </div>
          </Card>

          {/* Gender demographics */}
          <Card variant="elevated" padding={false}>
            <div className="p-6 lg:p-8">
              <h3 className="text-sm font-extrabold text-[var(--color-text-primary)] mb-2">Demografi Jenis Kelamin</h3>
              <p className="text-xs font-bold text-[var(--color-text-muted)] mb-5 uppercase tracking-wide">Donor berhasil</p>
              {loading ? (
                <div className="h-40 animate-pulse-soft bg-[var(--color-section-alt)] rounded-[var(--radius-button)]" />
              ) : genderDist.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-text-muted)] text-xs font-bold">Belum ada data.</div>
              ) : (
                <DonutChart
                  data={genderDist.map((d, i) => ({
                    label: d.jenis_kelamin,
                    value: d.total,
                    color: i === 0 ? '#2563EB' : '#EC4899',
                  }))}
                  size={140}
                  thickness={28}
                />
              )}
            </div>
          </Card>

          {/* Success rate */}
          <Card variant="elevated" padding={false}>
            <div className="p-6 lg:p-8">
              <h3 className="text-sm font-extrabold text-[var(--color-text-primary)] mb-2">Tingkat Keberhasilan</h3>
              <p className="text-xs font-bold text-[var(--color-text-muted)] mb-5 uppercase tracking-wide">Semua waktu</p>
              {loading ? (
                <div className="h-40 animate-pulse-soft bg-[var(--color-section-alt)] rounded-[var(--radius-button)]" />
              ) : successRate.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-text-muted)] text-xs font-bold">Belum ada data.</div>
              ) : (
                <DonutChart
                  data={successRate.map(d => ({
                    label: d.status === 'berhasil' ? 'Berhasil' : d.status === 'gagal' ? 'Gagal' : 'TMS',
                    value: d.total,
                    color: d.status === 'berhasil' ? '#16A34A' : d.status === 'gagal' ? '#DC2626' : '#D97706',
                  }))}
                  size={140}
                  thickness={28}
                />
              )}
            </div>
          </Card>
        </div>

        {/* ── Upcoming schedules ── */}
        <Card variant="elevated" padding={false}>
          <div className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-extrabold text-[var(--color-text-primary)]">Jadwal Upcoming</h2>
                <p className="text-xs font-bold text-[var(--color-text-muted)] mt-1 uppercase tracking-wide">5 jadwal terdekat</p>
              </div>
              <Link href="/admin/jadwal"
                className="text-xs font-bold text-[var(--color-primary)] hover:text-red-700 bg-[var(--color-primary-subtle)] hover:bg-red-100 px-3 py-2 rounded-full transition-colors flex items-center gap-1">
                Kelola <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse-soft bg-[var(--color-section-alt)] rounded-2xl" />)}
              </div>
            ) : schedules.length === 0 ? (
              <EmptyState
                icon={<Calendar className="w-5 h-5" />}
                title="Tidak ada jadwal"
                description="Tidak ada jadwal aktif ke depan."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {schedules.map(s => {
                  const filled = s.kuota - s.sisa_kuota;
                  const pct = Math.round((filled / s.kuota) * 100);
                  return (
                    <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-section-alt)] border border-transparent hover:border-[var(--color-border-muted)] transition-all hover:bg-white hover:shadow-[var(--shadow-card)]">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-[var(--shadow-card)] border border-[var(--color-border-muted)] flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-extrabold text-[var(--color-text-primary)] truncate">
                          {s.lokasi?.nama_lokasi ?? `Jadwal #${s.id}`}
                        </div>
                        <div className="text-xs font-bold text-[var(--color-text-muted)] mt-0.5">{formatDate(s.tanggal)}</div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex-1 h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-400' : 'bg-green-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-extrabold text-[var(--color-text-muted)] flex-shrink-0">{filled}/{s.kuota}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* ── Quick links ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { href: '/admin/jadwal', label: 'Jadwal', icon: Calendar, color: 'text-blue-600 bg-blue-50' },
            { href: '/admin/stok-darah', label: 'Stok Darah', icon: Droplets, color: 'text-red-600 bg-red-50' },
            { href: '/admin/registrasi', label: 'Registrasi', icon: ClipboardList, color: 'text-green-600 bg-green-50' },
            { href: '/admin/artikel', label: 'Artikel', icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="bg-white border border-[var(--color-border-muted)] rounded-[var(--radius-card)] shadow-[var(--shadow-elevated)] flex flex-col items-center gap-3 py-6 group cursor-pointer hover:border-[var(--color-primary-light)] hover:shadow-[var(--shadow-hover)] active:scale-[0.97] transition-all duration-200">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">{item.label}</span>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}

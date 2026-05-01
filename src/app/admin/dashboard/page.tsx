'use client';

import { useEffect, useState } from 'react';
import { useSidebarToggle } from '@/app/admin/layout';
import { TopBar } from '@/components/admin/TopBar';
import {
  Droplets, Calendar, Users, AlertTriangle,
  ArrowUpRight, TrendingUp, ClipboardList,
} from 'lucide-react';
import { getDashboardStats, getUpcomingSchedules, getBloodStockSummary } from '@/lib/api';
import { formatDate, BLOOD_TYPES } from '@/lib/utils';
import type { Schedule } from '@/lib/types';
import Link from 'next/link';

// ─── Mini stat card ───────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, alert = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  alert?: boolean;
}) {
  return (
    <div className={`bg-white rounded-3xl border shadow-sm p-6 flex flex-col gap-4 transition-all hover:shadow-md ${alert ? 'border-amber-200 bg-amber-50/50' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${alert ? 'bg-amber-100' : 'bg-red-50'}`}>
          <Icon className={`w-6 h-6 ${alert ? 'text-amber-600' : 'text-red-600'}`} />
        </div>
      </div>
      <div>
        <div className={`text-3xl font-extrabold tracking-tight ${alert ? 'text-amber-700' : 'text-gray-900'}`}>{value}</div>
        <div className="text-sm font-bold text-gray-500 mt-1">{label}</div>
        {sub && <div className="text-xs font-semibold text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

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
            <span className="w-8 text-right text-xs font-mono font-bold text-gray-500 flex-shrink-0">
              {d.golongan_darah}
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
              <div
                className={`h-full rounded-full ${color} flex items-center px-2 transition-all duration-700`}
                style={{ width: `${Math.max(pct, 4)}%` }}
              >
                {pct > 15 && (
                  <span className="text-[10px] font-bold text-white">{d.total}</span>
                )}
              </div>
            </div>
            <span className="w-6 text-left text-xs font-semibold text-gray-700 flex-shrink-0">
              {pct <= 15 ? d.total : ''}
            </span>
          </div>
        );
      })}
      <div className="flex gap-4 mt-4 text-xs text-gray-500">
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, sc, bd] = await Promise.allSettled([
        getDashboardStats(),
        getUpcomingSchedules(5),
        getBloodStockSummary(),
      ]);
      if (s.status === 'fulfilled') setStats(s.value);
      if (sc.status === 'fulfilled') setSchedules(sc.value);
      if (bd.status === 'fulfilled') setBloodData(bd.value);
      setLoading(false);
    }
    load();
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

        {/* ── Stats row ── */}
        {loading ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard icon={Droplets} label="Total Stok Darah" value={stats?.total_stok ?? '—'} sub="kantong tersedia" />
            <StatCard icon={Calendar} label="Jadwal Aktif" value={stats?.jadwal_aktif ?? '—'} sub="bulan ini" />
            <StatCard icon={ClipboardList} label="Registrasi" value={stats?.registrasi_bulan_ini ?? '—'} sub="bulan ini" />
            <StatCard
              icon={AlertTriangle}
              label="Stok Kritis"
              value={stats?.total_stok_kritis ?? '—'}
              sub="perlu perhatian segera"
              alert={(stats?.total_stok_kritis ?? 0) > 0}
            />
          </div>
        )}

        {/* ── Two column ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

          {/* Blood stock chart */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Stok Darah</h2>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">Per golongan darah (semua komponen)</p>
              </div>
              <Link href="/admin/stok-darah"
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                Kelola <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {loading
              ? <div className="h-40 animate-pulse bg-gray-50 rounded-2xl" />
              : <BloodStockChart data={bloodData} />
            }
          </div>

          {/* Critical stock alert */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Stok Perhatian</h2>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">Kritis & Kosong</p>
              </div>
              <span className="text-xs bg-red-50 text-red-600 font-extrabold px-3 py-1.5 rounded-full">
                {criticalBlood.length} item
              </span>
            </div>
            {loading
              ? <div className="h-32 animate-pulse bg-gray-50 rounded-2xl" />
              : criticalBlood.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm font-bold bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                  Semua stok dalam kondisi normal ✓
                </div>
              ) : (
                <div className="space-y-3">
                  {criticalBlood.map((item, i) => (
                    <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl ${item.status === 'kosong' ? 'bg-red-50/50 border border-red-100' : 'bg-amber-50/50 border border-amber-100'
                      }`}>
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm ${item.status === 'kosong' ? 'bg-red-500 shadow-red-500/50' : 'bg-amber-400 shadow-amber-400/50'
                        }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-extrabold text-gray-900">
                          Golongan {item.golongan_darah}
                        </div>
                        <div className="text-xs font-semibold text-gray-500 mt-0.5">
                          {item.total} kantong · <span className={item.status === 'kosong' ? 'text-red-600' : 'text-amber-600'}>{item.status === 'kosong' ? 'Habis' : 'Kritis'}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${item.status === 'kosong'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                        }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>

        {/* ── Upcoming schedules ── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Jadwal Upcoming</h2>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">5 jadwal terdekat</p>
            </div>
            <Link href="/admin/jadwal"
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
              Kelola <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse bg-gray-50 rounded-2xl" />)}
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm font-bold bg-gray-50 rounded-2xl border border-gray-100 border-dashed flex flex-col items-center gap-3">
              <Calendar className="w-8 h-8 text-gray-300" />
              Tidak ada jadwal aktif ke depan
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {schedules.map(s => {
                const filled = s.kuota - s.sisa_kuota;
                const pct = Math.round((filled / s.kuota) * 100);
                return (
                  <div key={s.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-200 transition-all hover:bg-white hover:shadow-sm">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-extrabold text-gray-900 truncate">
                        {s.lokasi?.nama_lokasi ?? `Jadwal #${s.id}`}
                      </div>
                      <div className="text-xs font-bold text-gray-500 mt-0.5">{formatDate(s.tanggal)}</div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-400' : 'bg-green-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-extrabold text-gray-500 flex-shrink-0">{filled}/{s.kuota}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Quick links ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { href: '/admin/jadwal', label: 'Jadwal', icon: Calendar, color: 'text-blue-600 bg-blue-50/50' },
            { href: '/admin/stok-darah', label: 'Stok Darah', icon: Droplets, color: 'text-red-600 bg-red-50/50' },
            { href: '/admin/registrasi', label: 'Registrasi', icon: ClipboardList, color: 'text-green-600 bg-green-50/50' },
            { href: '/admin/artikel', label: 'Artikel', icon: TrendingUp, color: 'text-purple-600 bg-purple-50/50' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="flex flex-col items-center gap-3 p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-center group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{item.label}</span>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}
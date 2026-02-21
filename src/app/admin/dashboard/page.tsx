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
    <div className={`bg-white rounded-2xl border p-5 flex flex-col gap-3 ${alert ? 'border-amber-200 bg-amber-50' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert ? 'bg-amber-100' : 'bg-red-50'}`}>
          <Icon className={`w-5 h-5 ${alert ? 'text-amber-600' : 'text-red-600'}`} />
        </div>
      </div>
      <div>
        <div className={`text-2xl font-bold ${alert ? 'text-amber-700' : 'text-gray-900'}`}>{value}</div>
        <div className="text-sm text-gray-500 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
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
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900">Stok Darah</h2>
                <p className="text-xs text-gray-400 mt-0.5">Per golongan darah (semua komponen)</p>
              </div>
              <a href="/admin/stok-darah"
                className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-1">
                Kelola <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
            {loading
              ? <div className="h-40 animate-pulse bg-gray-100 rounded-xl" />
              : <BloodStockChart data={bloodData} />
            }
          </div>

          {/* Critical stock alert */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900">Stok Perlu Perhatian</h2>
                <p className="text-xs text-gray-400 mt-0.5">Kritis & kosong</p>
              </div>
              <span className="text-xs bg-red-50 text-red-600 font-semibold px-2 py-1 rounded-full">
                {criticalBlood.length} item
              </span>
            </div>
            {loading
              ? <div className="h-32 animate-pulse bg-gray-100 rounded-xl" />
              : criticalBlood.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Semua stok dalam kondisi normal ✓
                </div>
              ) : (
                <div className="space-y-2">
                  {criticalBlood.map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${item.status === 'kosong' ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'
                      }`}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === 'kosong' ? 'bg-red-500' : 'bg-amber-400'
                        }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900">
                          Gol. {item.golongan_darah}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.total} kantong · {item.status === 'kosong' ? 'Habis' : 'Kritis'}
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${item.status === 'kosong'
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
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900">Jadwal Upcoming</h2>
              <p className="text-xs text-gray-400 mt-0.5">5 jadwal terdekat yang masih aktif</p>
            </div>
            <a href="/admin/jadwal"
              className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1">
              Kelola <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse bg-gray-100 rounded-xl" />)}
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm flex flex-col items-center gap-2">
              <Calendar className="w-8 h-8 text-gray-200" />
              Tidak ada jadwal aktif ke depan
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {schedules.map(s => {
                const filled = s.kuota - s.sisa_kuota;
                const pct = Math.round((filled / s.kuota) * 100);
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {s.lokasi?.nama_lokasi ?? `Jadwal #${s.id}`}
                      </div>
                      <div className="text-xs text-gray-400">{formatDate(s.tanggal)}</div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-400' : 'bg-green-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{filled}/{s.kuota}</span>
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
            { href: '/admin/jadwal', label: 'Jadwal', icon: Calendar, color: 'text-blue-600 bg-blue-50' },
            { href: '/admin/stok-darah', label: 'Stok', icon: Droplets, color: 'text-red-600 bg-red-50' },
            { href: '/admin/registrasi', label: 'Registrasi', icon: ClipboardList, color: 'text-green-600 bg-green-50' },
            { href: '/admin/artikel', label: 'Artikel', icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
          ].map(item => (
            <a key={item.href} href={item.href}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-700">{item.label}</span>
            </a>
          ))}
        </div>

      </main>
    </div>
  );
}
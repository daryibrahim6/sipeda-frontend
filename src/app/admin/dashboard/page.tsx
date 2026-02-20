'use client';

import { useSidebarToggle } from '@/app/admin/layout';
import { TopBar } from '@/components/admin/TopBar';
import {
  Droplets, Calendar, Users, AlertTriangle,
  TrendingUp, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { MOCK_STATS, MOCK_SCHEDULES, MOCK_BLOOD_STOCK, MOCK_ARTICLES } from '@/lib/mockData';
import { formatDate, BLOOD_TYPES } from '@/lib/utils';

// ─── Mini stat card ───────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, trend, alert = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  trend?: { value: number; label: string };
  alert?: boolean;
}) {
  const up = (trend?.value ?? 0) >= 0;
  return (
    <div className={`bg-white rounded-2xl border p-5 flex flex-col gap-3 ${alert ? 'border-amber-200 bg-amber-50' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert ? 'bg-amber-100' : 'bg-red-50'}`}>
          <Icon className={`w-5 h-5 ${alert ? 'text-amber-600' : 'text-red-600'}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${up ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
            {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <div className={`text-2xl font-bold ${alert ? 'text-amber-700' : 'text-gray-900'}`}>{value}</div>
        <div className="text-sm text-gray-500 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
        {trend && <div className="text-xs text-gray-400 mt-1">{trend.label}</div>}
      </div>
    </div>
  );
}

// ─── Blood stock bar chart (CSS only) ─────────────────────────────────────────
function BloodStockChart() {
  // Aggregate WB + PRC across all blood types
  const wb  = MOCK_BLOOD_STOCK[0].golongan;
  const prc = MOCK_BLOOD_STOCK[1].golongan;

  const data = BLOOD_TYPES.map(bt => ({
    type:   bt,
    wb:     wb[bt]?.jumlah  ?? 0,
    prc:    prc[bt]?.jumlah ?? 0,
    status: wb[bt]?.status  ?? 'normal',
  }));

  const max = Math.max(...data.map(d => d.wb + d.prc), 1);

  return (
    <div>
      <div className="space-y-2.5">
        {data.map(d => {
          const total = d.wb + d.prc;
          const pct   = Math.round((total / max) * 100);
          const color =
            d.status === 'kosong' ? 'bg-red-500' :
            d.status === 'kritis' ? 'bg-amber-400' : 'bg-green-500';

          return (
            <div key={d.type} className="flex items-center gap-3">
              <span className="w-8 text-right text-xs font-mono font-bold text-gray-500 flex-shrink-0">{d.type}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${color} transition-all duration-700 flex items-center px-2`}
                  style={{ width: `${Math.max(pct, 4)}%` }}
                >
                  {pct > 15 && (
                    <span className="text-[10px] font-bold text-white">{total}</span>
                  )}
                </div>
              </div>
              <span className="w-6 text-left text-xs font-semibold text-gray-700 flex-shrink-0">{pct <= 15 ? total : ''}</span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-gray-500">
        {[
          { dot: 'bg-green-500', label: 'Normal' },
          { dot: 'bg-amber-400', label: 'Kritis' },
          { dot: 'bg-red-500',   label: 'Kosong' },
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

  const upcoming = MOCK_SCHEDULES
    .filter(s => s.status === 'aktif' && new Date(s.tanggal) >= new Date())
    .sort((a, b) => a.tanggal.localeCompare(b.tanggal))
    .slice(0, 5);

  const criticalStock = MOCK_BLOOD_STOCK.flatMap(row =>
    Object.entries(row.golongan)
      .filter(([, v]) => v.status !== 'normal')
      .map(([bt, v]) => ({ komponen: row.komponen_kode, golongan: bt, ...v }))
  ).slice(0, 6);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Dashboard"
        subtitle={`Selamat datang — ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
        onMenuClick={toggle}
      />

      <main className="flex-1 p-4 sm:p-6 space-y-6">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Droplets}
            label="Total Stok Darah"
            value={MOCK_STATS.total_stok}
            sub="dalam kantong/unit"
            trend={{ value: 8, label: 'vs bulan lalu' }}
          />
          <StatCard
            icon={Calendar}
            label="Jadwal Aktif"
            value={MOCK_STATS.jadwal_aktif}
            sub="bulan ini"
            trend={{ value: 2, label: 'vs bulan lalu' }}
          />
          <StatCard
            icon={Users}
            label="Lokasi Aktif"
            value={MOCK_STATS.lokasi_aktif}
          />
          <StatCard
            icon={AlertTriangle}
            label="Stok Kritis"
            value={MOCK_STATS.total_stok_kritis}
            sub="perlu perhatian segera"
            trend={{ value: -1, label: 'vs minggu lalu' }}
            alert={MOCK_STATS.total_stok_kritis > 0}
          />
        </div>

        {/* ── Two column ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">

          {/* Blood stock chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900">Stok Darah (WB)</h2>
                <p className="text-xs text-gray-400 mt-0.5">Whole Blood per golongan darah</p>
              </div>
              <a href="/admin/stok-darah"
                className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-1">
                Kelola <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
            <BloodStockChart />
          </div>

          {/* Critical stock alert */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900">Stok Perlu Perhatian</h2>
                <p className="text-xs text-gray-400 mt-0.5">Kritis & kosong</p>
              </div>
              <span className="text-xs bg-red-50 text-red-600 font-semibold px-2 py-1 rounded-full">
                {criticalStock.length} item
              </span>
            </div>
            {criticalStock.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Semua stok dalam kondisi normal ✓
              </div>
            ) : (
              <div className="space-y-2">
                {criticalStock.map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${
                    item.status === 'kosong' ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'
                  }`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      item.status === 'kosong' ? 'bg-red-500' : 'bg-amber-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">
                        {item.komponen} — {item.golongan}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.jumlah} kantong · {item.status === 'kosong' ? 'Habis' : 'Kritis'}
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'kosong'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Upcoming schedules + recent articles ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Jadwal upcoming */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900">Jadwal Upcoming</h2>
                <p className="text-xs text-gray-400 mt-0.5">5 jadwal terdekat</p>
              </div>
              <a href="/admin/jadwal"
                className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1">
                Kelola <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
            {upcoming.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">Tidak ada jadwal aktif</div>
            ) : (
              <div className="space-y-3">
                {upcoming.map(s => {
                  const filled = s.kuota - s.sisa_kuota;
                  const pct    = Math.round((filled / s.kuota) * 100);
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
                        {/* mini quota bar */}
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

          {/* Recent articles */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-gray-900">Artikel Terbaru</h2>
                <p className="text-xs text-gray-400 mt-0.5">Konten terpublikasi</p>
              </div>
              <a href="/admin/artikel"
                className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1">
                Kelola <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
            <div className="space-y-3">
              {MOCK_ARTICLES.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1">{a.judul}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">{a.kategori_nama}</span>
                      <span className="text-xs text-gray-400">{a.views} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
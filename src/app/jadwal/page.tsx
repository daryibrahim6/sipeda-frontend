import type { Metadata } from 'next';
import { Calendar } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ScheduleCard } from '@/components/jadwal/ScheduleCard';
import { getSchedules, getLocations } from '@/lib/api';
import { MONTHS_ID } from '@/lib/utils';
import type { Schedule } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Jadwal Donor Darah',
  description: 'Daftar jadwal kegiatan donor darah di Kecamatan Indramayu.',
};

export const revalidate = 60;

type SearchParams = { month?: string; year?: string; lokasi?: string };

export default async function JadwalPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const now = new Date();
  const month = sp.month ? parseInt(sp.month) : now.getMonth() + 1;
  const year  = sp.year  ? parseInt(sp.year)  : now.getFullYear();

  const [schedules, locations] = await Promise.all([
    getSchedules(month, year).catch(() => []),
    getLocations().catch(() => []),
  ]);

  const filtered = sp.lokasi
    ? schedules.filter(s => String(s.lokasi_id) === sp.lokasi)
    : schedules;

  const grouped = filtered.reduce<Record<string, Schedule[]>>((acc, s) => {
    if (!acc[s.tanggal]) acc[s.tanggal] = [];
    acc[s.tanggal].push(s);
    return acc;
  }, {});

  return (
    <>
      <Navbar />
      <main id="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-1">
            Kalender Donor
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Jadwal Donor Darah</h1>
          <p className="text-gray-500">
            Pilih jadwal yang sesuai dan daftar online — kuota terbatas.
          </p>
        </div>

        {/* Filter bulan */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Bulan</p>
          <div className="flex flex-wrap gap-1.5">
            {MONTHS_ID.map((label, i) => {
              const m = i + 1;
              return (
                <a key={m}
                  href={`/jadwal?month=${m}&year=${year}${sp.lokasi ? `&lokasi=${sp.lokasi}` : ''}`}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    m === month
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600'
                  }`}>
                  {label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Filter lokasi */}
        {locations.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Lokasi</p>
            <div className="flex flex-wrap gap-1.5">
              <a href={`/jadwal?month=${month}&year=${year}`}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  !sp.lokasi
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'
                }`}>
                Semua Lokasi
              </a>
              {locations.map(loc => (
                <a key={loc.id}
                  href={`/jadwal?month=${month}&year=${year}&lokasi=${loc.id}`}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    sp.lokasi === String(loc.id)
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'
                  }`}>
                  {loc.nama_lokasi}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Jadwal list */}
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <div className="font-medium text-gray-500">
              Belum ada jadwal untuk {MONTHS_ID[month - 1]} {year}
            </div>
            <div className="text-sm text-gray-400 mt-1">Coba pilih bulan lain</div>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, daySchedules]) => {
                const d = new Date(date);
                return (
                  <div key={date}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="bg-red-600 text-white rounded-xl px-4 py-2.5 text-center min-w-[60px]">
                        <div className="text-2xl font-bold leading-none">{d.getDate()}</div>
                        <div className="text-xs mt-0.5 opacity-75">
                          {MONTHS_ID[d.getMonth()].substring(0, 3)}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {d.toLocaleDateString('id-ID', { weekday: 'long' })}
                        </div>
                        <div className="text-xs text-gray-400">{daySchedules.length} kegiatan</div>
                      </div>
                      <div className="h-px bg-gray-100 flex-1 ml-2" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {daySchedules.map(s => <ScheduleCard key={s.id} schedule={s} />)}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}
// src/app/jadwal/[id]/page.tsx
// Update: handle Schedule | null dari api.ts yang baru

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Users, MapPin, AlertTriangle } from 'lucide-react';

import { ScheduleBadge } from '@/components/ui/Badge';
import { RegisterForm } from '@/components/jadwal/RegisterForm';
import { getScheduleById } from '@/lib/api';
import { formatDate, formatTime, quotaPercent } from '@/lib/utils';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const schedule = await getScheduleById(parseInt(id)).catch(() => null);
  if (!schedule) return { title: 'Jadwal Tidak Ditemukan' };
  return {
    title: `Donor di ${schedule.lokasi?.nama_lokasi ?? 'Indramayu'}`,
    description: `Daftar donor darah ${formatDate(schedule.tanggal)} di ${schedule.lokasi?.nama_lokasi}`,
  };
}

export default async function JadwalDetailPage({ params }: Props) {
  const { id } = await params;
  const schedule = await getScheduleById(parseInt(id)).catch(() => null);
  if (!schedule) notFound();

  const pct = quotaPercent(schedule.sisa_kuota, schedule.kuota);
  const isFull = schedule.status === 'penuh' || schedule.sisa_kuota === 0;
  const isCancelled = schedule.status === 'dibatalkan';
  const terisi = schedule.kuota - schedule.sisa_kuota;

  return (
    <main id="main" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <Link href="/jadwal"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Kembali ke Jadwal
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

        {/* ── Kiri — Detail ── */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {schedule.lokasi?.nama_lokasi ?? `Jadwal #${id}`}
              </h1>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                <MapPin className="w-4 h-4 text-red-500" aria-hidden="true" />
                {schedule.lokasi?.kecamatan} · {schedule.lokasi?.alamat}
              </div>
            </div>
            <ScheduleBadge status={schedule.status} />
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {[
              {
                icon: Calendar,
                label: 'Tanggal',
                value: formatDate(schedule.tanggal, { withDay: true }),
              },
              {
                icon: Clock,
                label: 'Waktu',
                value: `${formatTime(schedule.waktu_mulai)} – ${formatTime(schedule.waktu_selesai)} WIB`,
              },
              {
                icon: Users,
                label: 'Sisa Kuota',
                value: `${schedule.sisa_kuota} dari ${schedule.kuota}`,
              },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <item.icon className="w-4 h-4 text-red-500 mb-2" aria-hidden="true" />
                <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                <div className="font-semibold text-gray-900 text-sm leading-snug">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Quota bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-600 font-medium">Pengisian kuota</span>
              <span className="font-bold text-gray-900">{pct}%</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden"
              role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div
                className={`h-full rounded-full transition-all duration-700 ${pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-400' : 'bg-green-500'
                  }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {terisi} orang sudah terdaftar dari {schedule.kuota} kuota tersedia
            </div>
          </div>

          {/* Deskripsi */}
          {schedule.deskripsi && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6">
              <div className="text-sm font-semibold text-blue-800 mb-1.5">
                ℹ️ Informasi Tambahan
              </div>
              <p className="text-sm text-blue-700 leading-relaxed">{schedule.deskripsi}</p>
            </div>
          )}

          {/* Syarat ringkas */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
              <span className="text-sm font-semibold text-amber-800">Syarat Donor Darah</span>
            </div>
            <ul className="text-sm text-amber-700 space-y-1.5">
              {[
                'Usia 17 – 65 tahun',
                'Berat badan minimal 45 kg',
                'Tidak sedang sakit atau minum obat',
                'Tidak hamil atau menyusui',
                'Tidur cukup dan sudah makan sebelum donor',
              ].map(s => (
                <li key={s} className="flex items-start gap-1.5">
                  <span className="text-amber-400 mt-0.5" aria-hidden="true">•</span> {s}
                </li>
              ))}
            </ul>
            <Link href="/syarat-donor"
              className="text-xs text-amber-600 underline mt-3 inline-block font-medium">
              Baca syarat lengkap →
            </Link>
          </div>
        </div>

        {/* ── Kanan — Form ── */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-20">
            {isCancelled ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl" aria-hidden="true">❌</span>
                </div>
                <div className="font-semibold text-gray-800 mb-1">Jadwal Dibatalkan</div>
                <p className="text-sm text-gray-500 mb-5">Kegiatan ini dibatalkan. Cek jadwal lain.</p>
                <Link href="/jadwal"
                  className="inline-block px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700">
                  Lihat Jadwal Lain
                </Link>
              </div>
            ) : isFull ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-gray-400" aria-hidden="true" />
                </div>
                <div className="font-semibold text-gray-800 mb-1">Kuota Penuh</div>
                <p className="text-sm text-gray-500 mb-5">Slot untuk jadwal ini sudah habis.</p>
                <Link href="/jadwal"
                  className="inline-block px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700">
                  Lihat Jadwal Lain
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Daftar Donor</h2>
                <p className="text-sm text-gray-500 mb-5">
                  Isi form berikut untuk mendapatkan kode registrasi.
                </p>
                <RegisterForm schedule={schedule} />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
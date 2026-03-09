// src/app/jadwal/[id]/page.tsx
// Refactored: all interactive content delegated to JadwalDetailClient
// for live kuota updates via Supabase Realtime

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { JadwalDetailClient } from '@/components/jadwal/JadwalDetailClient';
import { getScheduleById } from '@/lib/api';
import { formatDate } from '@/lib/utils';

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

  return (
    <main id="main" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <Link href="/jadwal"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Kembali ke Jadwal
      </Link>

      {/* All detail content is now a single client component with shared Realtime state */}
      <JadwalDetailClient schedule={schedule} />

    </main>
  );
}
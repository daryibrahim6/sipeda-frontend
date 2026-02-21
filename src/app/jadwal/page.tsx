import type { Metadata } from 'next';
import { getLocations } from '@/lib/api';
import JadwalClient from '@/components/jadwal/JadwalClient';

export const metadata: Metadata = {
  title: 'Jadwal Donor Darah',
  description: 'Daftar jadwal kegiatan donor darah di Kecamatan Indramayu.',
};

export default async function JadwalPage() {
  // Hanya locations yang di-fetch server-side (jarang berubah, bisa di-cache)
  // Jadwal di-fetch client-side via /api/jadwal agar filter bulan & lokasi instant
  const locations = await getLocations().catch(() => []);

  return <JadwalClient locations={locations} />;
}
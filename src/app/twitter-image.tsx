import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-image';

export const alt = 'SIPEDA — Sistem Informasi Pendonoran Darah Indramayu';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const runtime = 'edge';

export default async function Image() {
  return renderOgImage({
    title: 'Donor Darah Indramayu',
    description: 'Temukan jadwal, cek stok darah real-time, dan daftar donor online.',
    badge: 'PMI',
  });
}

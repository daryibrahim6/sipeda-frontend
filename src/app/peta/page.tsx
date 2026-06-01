import type { Metadata } from 'next';
import { MapPin, Phone, Navigation, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Badge, StockBadge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { getLocations } from '@/lib/api';
import MapWrapper from '@/components/map/MapWrapper';

export const metadata: Metadata = {
  title: 'Peta Lokasi Donor',
  description: 'Peta interaktif semua lokasi donor darah aktif di Kecamatan Indramayu.',
};

export const revalidate = 120;

export default async function PetaPage() {
  const locations = await getLocations().catch(() => []);

  return (
    <main id="main">
      <PageHeader
        badge={{ icon: <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" /></span>, text: 'WebGIS Interaktif' }}
        title="Peta Lokasi Donor"
        description={<>Temukan <strong>{locations.length} lokasi donor aktif</strong> di Indramayu. Klik marker pada peta untuk melihat detail jadwal, stok darah, dan petunjuk arah.</>}
      />
      <div className="page-container py-8 lg:py-10">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(340px,480px)] gap-6">
          {/* Map */}
          <div className="h-[300px] md:h-[500px] lg:h-[640px] rounded-2xl overflow-hidden border border-[var(--color-border-muted)] shadow-[var(--shadow-card)]">
            <MapWrapper locations={locations} zoom={13} />
          </div>

          {/* Location list */}
          <div className="space-y-3 max-h-none lg:max-h-[640px] lg:overflow-y-auto">
            {locations.length === 0 ? (
              <EmptyState icon={<MapPin />} title="Belum ada lokasi donor aktif" />
            ) : locations.map(loc => (
              <Card key={loc.id} variant="interactive" className="p-4 shadow-md ring-1 ring-black/[0.03]">

                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-semibold text-[var(--color-text-primary)] text-sm leading-snug">{loc.nama_lokasi}</div>
                  <Badge>{loc.tipe}</Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-3">
                  <MapPin className="w-3 h-3" />
                  {loc.kecamatan}
                </div>

                {loc.stok_ringkas && loc.stok_ringkas.length > 0 && (() => {
                  const worstPriority = (status: string) =>
                    status === 'kosong' ? 2 : status === 'kritis' ? 1 : 0;
                  const deduped = Object.values(
                    loc.stok_ringkas.reduce<Record<string, { golongan_darah: string; status: string; total: number }>>((acc, s) => {
                      const existing = acc[s.golongan_darah];
                      if (!existing || worstPriority(s.status) > worstPriority(existing.status)) {
                        acc[s.golongan_darah] = s;
                      }
                      return acc;
                    }, {})
                  );
                  return (
                    <div className="mb-3">
                      <div className="text-xs text-[var(--color-text-muted)] mb-1.5 font-medium">Stok tersedia:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {deduped.map((s, i) => (
                          <div key={`${s.golongan_darah}-${i}`} className="flex items-center gap-1">
                            <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)]">{s.golongan_darah}</span>
                            <StockBadge status={s.status as 'normal' | 'kritis' | 'kosong'} />
                            <span className="text-xs text-[var(--color-text-muted)] tabular-nums">{s.total} ktg</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Action row */}
                <div className="pt-3 border-t border-[var(--color-border-muted)] flex flex-wrap gap-2">
                  <Link
                    href={`/jadwal?lokasi=${loc.id}`}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-semibold rounded-lg active:scale-[0.95] transition-all flex-1 sm:flex-none"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Daftar Donor
                  </Link>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${loc.koordinat_lat},${loc.koordinat_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--color-text-secondary)] bg-[var(--color-section-alt)] hover:bg-[var(--color-border-muted)] active:scale-[0.95] transition-all"
                    title={`Petunjuk arah ke ${loc.nama_lokasi}`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Petunjuk Arah</span>
                  </a>
                  {loc.kontak && (
                    <a
                      href={`tel:${loc.kontak}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--color-text-secondary)] bg-[var(--color-section-alt)] hover:bg-[var(--color-border-muted)] active:scale-[0.95] transition-all"
                      title={`Hubungi ${loc.nama_lokasi}`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Telepon</span>
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

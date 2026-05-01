import type { Metadata } from 'next';
import { MapPin, Phone, Navigation } from 'lucide-react';
import { StockBadge } from '@/components/ui/Badge';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Premium Header */}
        <div className="mb-10 text-center sm:text-left border-b border-gray-100 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-xs font-bold text-red-600 uppercase tracking-widest mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
            WebGIS Interaktif
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Peta Lokasi Donor
          </h1>
          <p className="text-gray-500 font-medium max-w-2xl mx-auto sm:mx-0 text-lg">
            Temukan <strong className="text-gray-900">{locations.length} lokasi donor aktif</strong> di Indramayu. Klik marker pada peta untuk melihat detail jadwal, stok darah, dan petunjuk arah.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Map */}
          <div className="h-[500px] lg:h-[640px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <MapWrapper locations={locations} zoom={13} />
          </div>

          {/* Location list */}
          <div className="space-y-3 max-h-[640px] overflow-y-auto">
            {locations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <MapPin className="w-10 h-10 mb-3 text-gray-300" />
                <p className="text-sm">Belum ada lokasi donor aktif</p>
              </div>
            ) : locations.map(loc => (
              <div key={loc.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-red-200 hover:shadow-sm transition-all">

                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-semibold text-gray-900 text-sm leading-snug">{loc.nama_lokasi}</div>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0 font-medium">
                    {loc.tipe}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                  <MapPin className="w-3 h-3" />
                  {loc.kecamatan}
                </div>

                {loc.stok_ringkas && loc.stok_ringkas.length > 0 && (() => {
                  const worstPriority = (status: string) =>
                    status === 'kosong' ? 2 : status === 'kritis' ? 1 : 0;
                  const deduped = Object.values(
                    loc.stok_ringkas.reduce<Record<string, { golongan_darah: string; status: string }>>((acc, s) => {
                      const existing = acc[s.golongan_darah];
                      if (!existing || worstPriority(s.status) > worstPriority(existing.status)) {
                        acc[s.golongan_darah] = s;
                      }
                      return acc;
                    }, {})
                  );
                  return (
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1.5 font-medium">Stok tersedia:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {deduped.map((s, i) => (
                          <div key={`${s.golongan_darah}-${i}`} className="flex items-center gap-1">
                            <span className="text-xs font-mono font-bold text-gray-700">{s.golongan_darah}</span>
                            <StockBadge status={s.status as 'normal' | 'kritis' | 'kosong'} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Action row */}
                <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                  {/* Google Maps Directions — auto-route dari lokasi user saat ini */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${loc.koordinat_lat},${loc.koordinat_lng}&destination_place_id=${encodeURIComponent(loc.nama_lokasi)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    title={`Petunjuk arah ke ${loc.nama_lokasi}`}
                  >
                    <Navigation className="w-3 h-3" />
                    Petunjuk Arah
                  </a>

                  {loc.kontak && (
                    <a
                      href={`tel:${loc.kontak}`}
                      className="flex items-center gap-1 border border-gray-200 px-2.5 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 transition-colors font-medium"
                      title={`Hubungi ${loc.nama_lokasi}`}
                    >
                      <Phone className="w-3 h-3" />
                      {loc.kontak}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
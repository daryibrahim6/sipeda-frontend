import type { Metadata } from 'next';
import { MapPin, Phone } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
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
    <>
      <Navbar />
      <main id="main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mb-1">WebGIS</p>
            <h1 className="text-3xl font-bold text-gray-900">Peta Lokasi Donor Darah</h1>
            <p className="text-gray-500 mt-1">
              {locations.length} lokasi aktif di Kecamatan Indramayu — klik marker untuk detail & jadwal
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
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:border-red-200 hover:shadow-sm transition-all cursor-pointer">

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-semibold text-gray-900 text-sm leading-snug">
                      {loc.nama_lokasi}
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0 font-medium">
                      {loc.tipe}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                    <MapPin className="w-3 h-3" />
                    {loc.kecamatan}
                  </div>

                  {loc.stok_ringkas && loc.stok_ringkas.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1.5 font-medium">Stok tersedia:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {loc.stok_ringkas.map(s => (
                          <div key={s.golongan_darah} className="flex items-center gap-1">
                            <span className="text-xs font-mono font-bold text-gray-700">
                              {s.golongan_darah}
                            </span>
                            <StockBadge status={s.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {loc.kontak && (
                    <div className="pt-3 border-t border-gray-100 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-red-500" />
                      <a href={`tel:${loc.kontak}`}
                        className="text-xs text-red-600 hover:underline font-medium">
                        {loc.kontak}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
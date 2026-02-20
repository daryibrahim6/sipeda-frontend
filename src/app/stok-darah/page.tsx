import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { BloodStockTable } from '@/components/stok/BloodStockTable';
import { getBloodStock, getLocations } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Stok Darah',
  description: 'Informasi stok darah real-time di semua lokasi donor darah Kabupaten Indramayu.',
};

export const revalidate = 30; // Update lebih sering karena stok bisa berubah

export default async function StokDarahPage() {
  const [stockRows, locations] = await Promise.all([
    getBloodStock().catch(() => []),
    getLocations().catch(() => []),
  ]);

  return (
    <>
      <Navbar />
      <main id="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="text-sm font-medium text-red-600 mb-1">Real-time</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stok Darah</h1>
          <p className="text-gray-500">
            Data diperbarui otomatis setiap 30 detik. Terakhir diperbarui:{' '}
            <span className="font-medium text-gray-700">{formatDate(new Date().toISOString(), {
              day: 'numeric', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}</span>
          </p>
        </div>

        {/* Legenda status */}
        <div className="flex flex-wrap gap-3 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <span className="text-sm text-gray-600 font-medium mr-2">Keterangan:</span>
          {[
            { dot: 'bg-green-500', label: 'Normal — stok mencukupi' },
            { dot: 'bg-amber-500', label: 'Kritis — stok menipis' },
            { dot: 'bg-red-500',   label: 'Kosong — tidak tersedia' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5 text-sm text-gray-600">
              <span className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
              {item.label}
            </div>
          ))}
        </div>

        {/* Tabel stok semua lokasi */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Rekapitulasi Semua Lokasi</h2>
          <BloodStockTable rows={stockRows} />
        </section>

        {/* Per lokasi */}
        {locations.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-6">Stok per Lokasi</h2>
            <div className="space-y-8">
              {locations.map(loc => (
                <div key={loc.id}>
                  <div className="flex items-center gap-3 mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">{loc.nama_lokasi}</div>
                      <div className="text-sm text-gray-500">📍 {loc.kecamatan}{loc.kontak ? ` · 📞 ${loc.kontak}` : ''}</div>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-auto">
                      {loc.tipe}
                    </span>
                  </div>
                  <StockPerLocation locationId={loc.id} />
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
      <Footer />
    </>
  );
}

// Server component per lokasi — fetch paralel
async function StockPerLocation({ locationId }: { locationId: number }) {
  const rows = await getBloodStock(locationId).catch(() => []);
  if (!rows.length) {
    return <p className="text-sm text-gray-400 italic py-2">Data stok belum tersedia untuk lokasi ini.</p>;
  }
  return <BloodStockTable rows={rows} />;
}
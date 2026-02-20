import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getFAQs } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Syarat Donor Darah',
  description: 'Syarat dan ketentuan donor darah di PMI Indramayu beserta FAQ lengkap.',
};

export const revalidate = 3600;

const CATEGORIES = [
  { key: 'umum',   label: 'Umum' },
  { key: 'syarat', label: 'Syarat Donor' },
  { key: 'proses', label: 'Proses Donor' },
  { key: 'stok',   label: 'Stok Darah' },
] as const;

export default async function SyaratDonorPage() {
  const faqs = await getFAQs().catch(() => []);

  return (
    <>
      <Navbar />
      <main id="main">

        {/* Hero */}
        <section className="bg-red-600 text-white py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Syarat Donor Darah</h1>
            <p className="text-red-100 text-lg">
              Pastikan Anda memenuhi syarat berikut sebelum melakukan donor darah.
            </p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Syarat utama visual */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Syarat Umum Pendonor</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: '🎂', title: 'Usia',          desc: '17 – 65 tahun (donor pertama maks. 60 tahun)' },
                { icon: '⚖️', title: 'Berat Badan',   desc: 'Minimal 45 kilogram' },
                { icon: '💉', title: 'Hemoglobin',    desc: '≥ 12,5 g/dL untuk perempuan, ≥ 13,0 g/dL untuk laki-laki' },
                { icon: '🩺', title: 'Tekanan Darah', desc: 'Sistol 100–170 mmHg, Diastol 70–100 mmHg' },
                { icon: '❤️', title: 'Kesehatan',     desc: 'Tidak sedang sakit, demam, atau minum obat tertentu' },
                { icon: '⏱️', title: 'Jarak Donor',   desc: 'Minimal 3 bulan (12 minggu) dari donor sebelumnya' },
                { icon: '🚫', title: 'Tidak Hamil',   desc: 'Tidak sedang hamil, menyusui, atau baru melahirkan' },
                { icon: '😴', title: 'Kondisi Fisik', desc: 'Tidur cukup dan sudah makan sebelum donor' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                    <div className="text-sm text-gray-600 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Alur proses donor */}
          <section className="mb-12 bg-red-50 border border-red-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Alur Proses Donor</h2>
            <div className="space-y-3">
              {[
                ['Registrasi',           'Daftar via SIPEDA atau langsung di lokasi'],
                ['Pemeriksaan Awal',     'Cek tekanan darah, hemoglobin, berat badan (10–15 menit)'],
                ['Wawancara',            'Petugas menanyakan riwayat kesehatan singkat'],
                ['Pengambilan Darah',    'Proses donor berlangsung 8–10 menit (±450 ml)'],
                ['Istirahat & Konsumsi', 'Istirahat 10–15 menit, minum dan makan yang tersedia'],
                ['Selesai',              'Dapatkan kartu donor dan bisa beraktivitas normal'],
              ].map(([step, desc], i) => (
                <div key={step} className="flex items-start gap-4">
                  <div className="w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{step}</div>
                    <div className="text-sm text-gray-600">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          {faqs.length > 0 && (
            <section id="faq">
              <h2 className="text-xl font-bold text-gray-900 mb-6">FAQ</h2>
              {CATEGORIES.map(cat => {
                const items = faqs.filter(f => f.kategori === cat.key);
                if (!items.length) return null;
                return (
                  <div key={cat.key} className="mb-8">
                    <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3">
                      {cat.label}
                    </h3>
                    <div className="space-y-2">
                      {items.map(faq => (
                        <details key={faq.id}
                          className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
                          <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-medium text-gray-900 hover:text-red-700 transition-colors list-none">
                            {faq.pertanyaan}
                            <span className="text-gray-400 group-open:rotate-180 transition-transform ml-3 flex-shrink-0">
                              ▼
                            </span>
                          </summary>
                          <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                            {faq.jawaban}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
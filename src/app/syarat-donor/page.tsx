import type { Metadata } from 'next';
import { CheckCircle2, XCircle, ChevronDown, Heart, Clock, Droplets, Shield } from 'lucide-react';
import { getFAQ } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Syarat Donor Darah',
  description: 'Pelajari syarat, proses, dan hal yang perlu dipersiapkan sebelum donor darah di PMI Indramayu.',
};

export const revalidate = 3600; // cache 1 jam

// ─── Types ────────────────────────────────────────────────────────────────────
type FAQItem = {
  id: number;
  pertanyaan: string;
  jawaban: string;
  kategori: string;
};

// ─── Static requirements data ─────────────────────────────────────────────────
const SYARAT_UMUM = [
  'Usia 17–65 tahun',
  'Berat badan minimal 45 kg',
  'Tekanan darah normal: sistol 100–170 mmHg, diastol 70–100 mmHg',
  'Hemoglobin ≥ 12,5 g/dL',
  'Suhu tubuh normal (36,6°C–37,5°C)',
  'Denyut nadi 60–100 kali/menit dan teratur',
  'Tidak dalam kondisi sakit, demam, atau flu',
];

const TIDAK_BOLEH_DONOR = [
  'Sedang hamil atau menyusui',
  'Pernah hepatitis B atau C, HIV/AIDS, Sifilis',
  'Mengonsumsi aspirin dalam 3 hari terakhir',
  'Baru donor darah dalam 12 minggu terakhir',
  'Baru menjalani operasi dalam 6 bulan terakhir',
  'Baru mendapat transfusi darah dalam 1 tahun terakhir',
  'Sedang mengonsumsi antibiotik atau obat-obatan tertentu',
];

const PERSIAPAN = [
  { icon: '💧', text: 'Minum banyak air (minimal 500ml) sebelum donor' },
  { icon: '🍽️', text: 'Makan makanan bergizi 3–4 jam sebelum donor, hindari makanan berlemak' },
  { icon: '😴', text: 'Tidur cukup minimal 5 jam sebelum hari donor' },
  { icon: '🚫', text: 'Jangan merokok 2 jam sebelum dan sesudah donor' },
  { icon: '👕', text: 'Pakai baju dengan lengan yang mudah digulung' },
];

const PROSES_DONOR = [
  {
    step: '01',
    title: 'Registrasi',
    desc: 'Isi formulir dan tunjukkan identitas diri (KTP/SIM). Daftar online lebih cepat!',
    durasi: '5 menit',
  },
  {
    step: '02',
    title: 'Pemeriksaan Awal',
    desc: 'Petugas memeriksa berat badan, suhu, tekanan darah, denyut nadi, dan hemoglobin.',
    durasi: '10–15 menit',
  },
  {
    step: '03',
    title: 'Pengambilan Darah',
    desc: 'Pengambilan darah sebanyak 350–450 ml menggunakan jarum steril sekali pakai.',
    durasi: '8–10 menit',
  },
  {
    step: '04',
    title: 'Istirahat & Konsumsi',
    desc: 'Istirahat minimal 10 menit, minum dan makan snack yang disediakan PMI.',
    durasi: '10–15 menit',
  },
];

// ─── FAQ Accordion (server-rendered, no JS needed) ────────────────────────────
// Menggunakan details/summary HTML native — accessible dan no JavaScript
function FAQAccordion({ items }: { items: FAQItem[] }) {
  if (items.length === 0) return null;

  const grouped = items.reduce<Record<string, FAQItem[]>>((acc, item) => {
    if (!acc[item.kategori]) acc[item.kategori] = [];
    acc[item.kategori].push(item);
    return acc;
  }, {});

  const KATEGORI_LABEL: Record<string, string> = {
    umum: 'Umum',
    syarat: 'Syarat & Eligibilitas',
    proses: 'Proses Donor',
    stok: 'Stok & Golongan Darah',
    lainnya: 'Lainnya',
  };

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([kategori, faqs]) => (
        <div key={kategori}>
          <h3 className="font-bold text-gray-900 mb-3 text-lg">
            {KATEGORI_LABEL[kategori] ?? kategori}
          </h3>
          <div className="space-y-2">
            {faqs.map(faq => (
              <details
                key={faq.id}
                className="group bg-white border border-gray-100 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-900 text-sm leading-relaxed">
                    {faq.pertanyaan}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                  {faq.jawaban}
                </div>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function SyaratDonorPage() {
  const faqItems = await getFAQ().catch(() => []);

  return (
    <>
<main id="main">

        {/* ── Header ── */}
        <section className="bg-gray-950 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">
              Panduan Lengkap
            </p>
            <h1 className="text-4xl font-extrabold mb-3">Syarat & Proses Donor Darah</h1>
            <p className="text-gray-400 max-w-xl">
              Semua yang perlu kamu tahu sebelum donor — syarat, persiapan, dan proses
              dari awal sampai selesai.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Main content ── */}
            <div className="lg:col-span-2 space-y-12">

              {/* Syarat boleh donor */}
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Syarat Boleh Donor</h2>
                </div>
                <div className="space-y-2">
                  {SYARAT_UMUM.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{s}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tidak boleh donor */}
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Tidak Boleh Donor</h2>
                </div>
                <div className="space-y-2">
                  {TIDAK_BOLEH_DONOR.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{s}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Persiapan */}
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Persiapan Sebelum Donor</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PERSIAPAN.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <span className="text-xl flex-shrink-0">{p.icon}</span>
                      <span className="text-sm text-gray-700">{p.text}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Proses donor */}
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Proses Donor Darah</h2>
                </div>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-6 top-10 bottom-10 w-px bg-red-100 hidden sm:block" />
                  <div className="space-y-4">
                    {PROSES_DONOR.map((p, i) => (
                      <div key={i} className="flex gap-5">
                        <div className="relative z-10 flex-shrink-0 w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center text-sm font-bold">
                          {p.step}
                        </div>
                        <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <h3 className="font-bold text-gray-900">{p.title}</h3>
                            <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                              <Clock className="w-3 h-3" />
                              {p.durasi}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* FAQ */}
              {faqItems.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Pertanyaan Umum (FAQ)</h2>
                  <FAQAccordion items={faqItems} />
                </section>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="space-y-5 sticky top-24 self-start">

              {/* Quick facts */}
              <div className="bg-gray-950 text-white rounded-2xl p-6">
                <h3 className="font-bold mb-4 text-lg">Fakta Cepat</h3>
                <div className="space-y-4">
                  {[
                    { icon: Droplets, value: '450 ml', label: 'volume darah yang diambil' },
                    { icon: Clock, value: '±45 mnt', label: 'total waktu proses' },
                    { icon: Heart, value: '3 nyawa', label: 'dapat diselamatkan dari 1 kantong' },
                    { icon: Shield, value: '12 minggu', label: 'jeda minimal antar donor' },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <f.icon className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{f.value}</div>
                        <div className="text-xs text-gray-500">{f.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-red-600 text-white rounded-2xl p-6">
                <Heart className="w-8 h-8 mb-3 opacity-80" />
                <h3 className="font-bold text-lg mb-2">Siap Jadi Pendonor?</h3>
                <p className="text-red-100 text-sm leading-relaxed mb-4">
                  Cek jadwal donor terdekat dan daftar online sekarang. Prosesnya cepat dan mudah.
                </p>
                <a href="/jadwal"
                  className="block text-center py-3 bg-white text-red-700 font-bold rounded-xl hover:bg-red-50 transition-colors text-sm">
                  Lihat Jadwal Donor
                </a>
              </div>

              {/* Kontak PMI */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3">Kontak PMI Indramayu</h3>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-600">
                    📞 <a href="tel:+628119198611" className="text-red-600 font-medium hover:underline">0811-919-8611</a>
                  </div>
                  <div className="text-gray-600">
                    📍 Jl. Jenderal Sudirman No. 1, Indramayu
                  </div>
                  <div className="text-gray-500 text-xs">
                    Layanan darurat tersedia 24 jam
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>
</>
  );
}
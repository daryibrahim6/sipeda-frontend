import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

const layanan = [
  { label: 'Peta Lokasi', href: '/peta' },
  { label: 'Jadwal Donor', href: '/jadwal' },
  { label: 'Stok Darah', href: '/stok-darah' },
  { label: 'Daftar Donor', href: '/jadwal' },
];

const informasi = [
  { label: 'Syarat Donor', href: '/syarat-donor' },
  { label: 'Artikel', href: '/artikel' },
  { label: 'Riwayat Donor', href: '/riwayat' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Cek Registrasi', href: '/registrasi' },
  { label: 'Tentang SIPEDA', href: '/tentang' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-gray-950 text-gray-400 overflow-hidden">
      {/* Deep gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-red-950/40 via-gray-950 to-black pointer-events-none"></div>
      {/* Static SVG Noise Overlay */}
      <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>

      {/* CTA Banner */}
      <div className="relative z-10 page-container pt-20 pb-0">
        <div className="rounded-3xl bg-white/10 border border-white/10 p-8 sm:p-12 text-center mb-16 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Setetes Darah Anda,<br />Harapan Hidup Mereka
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-lg mx-auto">
            Informasi stok darah real-time, jadwal donor terdekat, dan pendaftaran online di Kabupaten Indramayu.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/jadwal"
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-2xl shadow-lg shadow-black/15 active:scale-[0.97] transition-all duration-200">
              Daftar Donor Sekarang
            </Link>
            <Link href="/stok-darah"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl active:scale-[0.97] transition-all duration-200 border border-white/10">
              Cek Stok Darah
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 page-container pb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
            <Image src="/logo.png" alt="SIPEDA" width={40} height={40} className="h-10 w-auto" />
              <span className="text-white font-bold text-base">SIPEDA</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500 mb-5">
              Sistem Informasi Pendonoran Darah Kabupaten Indramayu. Memudahkan
              masyarakat menemukan lokasi, stok, dan jadwal donor darah.
            </p>
            <a
              href="https://wa.me/628119198611"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-semibold rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chat WhatsApp PMI
            </a>
          </div>

          {/* Layanan */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide">
              Layanan
            </h3>
            <ul className="space-y-2.5">
              {layanan.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-white transition-all duration-200 hover:translate-x-0.5">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide">
              Informasi
            </h3>
            <ul className="space-y-2.5">
              {informasi.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-white transition-all duration-200 hover:translate-x-0.5">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wide">
              Kontak
            </h3>
            <ul className="space-y-3.5">
              <li className="flex items-center gap-2.5 text-sm text-gray-500">
                <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
                <a href="tel:+628119198611" className="hover:text-white transition-colors">
                  0811-919-8611
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-500">
                <MessageCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <a
                  href="https://wa.me/628119198611"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp PMI
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-500">
                <Mail className="w-4 h-4 text-red-500 flex-shrink-0" />
                <a href="mailto:pmi.indramayu@gmail.com" className="hover:text-white transition-colors">
                  pmi.indramayu@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Jl. DI. Panjaitan No. 54,<br />Kabupaten Indramayu, Jawa Barat</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {year} SIPEDA — Kabupaten Indramayu. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/kebijakan-privasi" className="hover:text-white transition-colors">
              Kebijakan Privasi
            </Link>
            <span className="text-gray-700">|</span>
            <Link href="/syarat-ketentuan" className="hover:text-white transition-colors">
              Syarat & Ketentuan
            </Link>
            <span className="text-gray-700">|</span>
            <Link href="/hapus-data" className="hover:text-white transition-colors">
              Hapus Data
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
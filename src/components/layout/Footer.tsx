import Link from 'next/link';
import { Droplets, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

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
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Droplets className="w-4 h-4 text-white fill-white" />
              </div>
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-xl hover:bg-green-700 transition-colors"
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
                  <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors">
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
                  <Link href={href} className="text-sm text-gray-500 hover:text-white transition-colors">
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
        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-600">
          <p>© {year} SIPEDA — Kabupaten Indramayu. All rights reserved.</p>
          <p>Dikembangkan oleh <span className="text-gray-400 font-medium">Dary Ibrahim Akram</span> · Next.js · Supabase</p>
        </div>
      </div>
    </footer>
  );
}
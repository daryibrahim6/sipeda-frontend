import Link from 'next/link';
import { Droplets, Phone, Mail, MapPin } from 'lucide-react';

const layanan = [
  ['Peta Lokasi',   '/peta'],
  ['Jadwal Donor',  '/jadwal'],
  ['Stok Darah',    '/stok-darah'],
  ['Daftar Donor',  '/jadwal'],
];

const informasi = [
  ['Syarat Donor',   '/syarat-donor'],
  ['Artikel',        '/artikel'],
  ['Tentang SIPEDA', '/tentang'],
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Droplets className="w-5 h-5 fill-red-500 text-red-500" />
              SIPEDA
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Sistem Informasi Pendonoran Darah Kabupaten Indramayu. Memudahkan masyarakat menemukan
              lokasi, stok, dan jadwal donor darah.
            </p>
          </div>

          {/* Layanan */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Layanan</h3>
            <ul className="space-y-2.5">
              {layanan.map(([label, href]) => (
                <li key={label}>
                  <Link href={href}
                    className="text-sm text-gray-500 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Informasi</h3>
            <ul className="space-y-2.5">
              {informasi.map(([label, href]) => (
                <li key={label}>
                  <Link href={href}
                    className="text-sm text-gray-500 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Kontak PMI</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-gray-500">
                <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
                <a href="tel:+62234123456" className="hover:text-white transition-colors">
                  +62-234-123456
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-500">
                <Mail className="w-4 h-4 text-red-500 flex-shrink-0" />
                <a href="mailto:admin@sipeda.id" className="hover:text-white transition-colors">
                  admin@sipeda.id
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Kabupaten Indramayu,<br />Jawa Barat</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} SIPEDA — Kabupaten Indramayu. All rights reserved.</p>
          <p>Dibangun dengan Next.js &amp; Laravel</p>
        </div>
      </div>
    </footer>
  );
}
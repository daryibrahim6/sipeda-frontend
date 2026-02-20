'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Droplets } from 'lucide-react';

const navLinks = [
  { href: '/',             label: 'Beranda' },
  { href: '/peta',         label: 'Peta Lokasi' },
  { href: '/jadwal',       label: 'Jadwal Donor' },
  { href: '/stok-darah',   label: 'Stok Darah' },
  { href: '/artikel',      label: 'Artikel' },
  { href: '/syarat-donor', label: 'Syarat Donor' },
  { href: '/tentang',      label: 'Tentang' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
        aria-label="Navigasi utama"
      >

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-red-700 font-bold text-lg">
          <Droplets className="w-5 h-5 fill-red-600" aria-hidden="true" />
          SIPEDA
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}
              className={`px-3.5 py-2 text-sm rounded-lg font-medium transition-colors ${
                isActive(l.href)
                  ? 'text-red-700 bg-red-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              aria-current={isActive(l.href) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:block">
          <Link href="/jadwal"
            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">
            Daftar Donor
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-0.5">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive(l.href)
                  ? 'text-red-700 bg-red-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              aria-current={isActive(l.href) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link href="/jadwal" onClick={() => setOpen(false)}
              className="block px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg text-center hover:bg-red-700 transition-colors">
              Daftar Donor
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
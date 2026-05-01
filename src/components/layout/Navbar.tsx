'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Droplets, ChevronDown, Phone, Menu, X } from 'lucide-react';

const mainNav = [
  { href: '/peta', label: 'Peta Lokasi' },
  { href: '/jadwal', label: 'Jadwal Donor' },
  { href: '/stok-darah', label: 'Stok Darah' },
  { href: '/artikel', label: 'Artikel' },
];

const infoNav = [
  { href: '/syarat-donor', label: 'Syarat Donor' },
  { href: '/riwayat', label: 'Riwayat Donor' },
  { href: '/faq', label: 'FAQ' },
  { href: '/tentang', label: 'Tentang SIPEDA' },
];

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const dropRef = useRef<HTMLDivElement>(null);

  // Scroll shadow
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 12);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tutup mobile menu saat navigasi
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const infoIsActive = infoNav.some(p => pathname.startsWith(p.href));

  // Jika di halaman utama, gunakan desain putih cerah (karena background gelap).
  // Jika di halaman lain (background putih), gunakan desain gelap (karena background terang).
  const isDarkNav = pathname !== '/';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 sm:pt-6 pointer-events-none">
      <header className={`pointer-events-auto w-full max-w-5xl backdrop-blur-xl rounded-full transition-all duration-300 ${
        isDarkNav
          ? 'bg-gray-950 border border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.15)] text-white' 
          : 'bg-white/95 border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] text-gray-900'
      }`}>
        <nav
          className="px-4 sm:px-6 flex items-center justify-between h-14 md:h-16"
          aria-label="Navigasi utama"
        >
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-300">
              <Droplets className="w-4 h-4 text-white fill-white" aria-hidden="true" />
            </div>
            <span className={`font-extrabold text-lg tracking-tight transition-colors ${
              isDarkNav ? 'text-white group-hover:text-red-400' : 'text-gray-900 group-hover:text-red-700'
            }`}>
              SIPEDA
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {mainNav.map(l => (
              <Link key={l.href} href={l.href}
                className={`px-3.5 py-2 text-sm rounded-full font-semibold transition-colors ${isActive(l.href)
                  ? (isDarkNav ? 'text-red-400 bg-red-950/50' : 'text-red-700 bg-red-50')
                  : (isDarkNav ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                  }`}
                aria-current={isActive(l.href) ? 'page' : undefined}
              >
                {l.label}
              </Link>
            ))}

            {/* ─ Dropdown Info ─ */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropdownOpen(p => !p)}
                className={`flex items-center gap-1 px-3.5 py-2 text-sm rounded-full font-semibold transition-colors ${infoIsActive
                  ? (isDarkNav ? 'text-red-400 bg-red-950/50' : 'text-red-700 bg-red-50')
                  : (isDarkNav ? 'text-gray-300 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
                  }`}
                aria-expanded={dropdownOpen}
              >
                Info
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className={`absolute top-full mt-3 left-1/2 -translate-x-1/2 w-48 backdrop-blur-xl rounded-3xl shadow-2xl py-2 z-50 animate-scale-in border ${
                  isDarkNav ? 'bg-gray-950/95 border-gray-800' : 'bg-white/95 border-gray-100'
                }`}>
                  {infoNav.map(l => (
                    <Link key={l.href} href={l.href}
                      className={`block px-5 py-2.5 text-sm font-medium transition-colors ${isActive(l.href)
                        ? (isDarkNav ? 'text-red-400 bg-red-950/50' : 'text-red-700 bg-red-50/50')
                        : (isDarkNav ? 'text-gray-300 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
                        }`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Desktop CTA ── */}
          <div className="hidden md:flex items-center gap-2">
            <a href="tel:+628119198611"
              className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
                isDarkNav ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
              }`} title="Darurat (Telepon PMI)">
              <Phone className="w-4 h-4" />
            </a>
            <Link href="/jadwal"
              className={`px-5 py-2 text-sm font-bold rounded-full transition-all shadow-md active:scale-95 ${
                isDarkNav ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-red-600'
              }`}>
              Daftar Donor
            </Link>
          </div>

          {/* ── Mobile Toggle ── */}
          <button
            className={`md:hidden p-2 rounded-full transition-colors ${
              isDarkNav ? 'text-gray-300 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100/50 px-4 pt-3 pb-5 space-y-1 bg-white rounded-b-[2rem]">
            {[...mainNav, ...infoNav].map(l => (
              <Link key={l.href} href={l.href}
                className={`flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-colors ${isActive(l.href)
                  ? 'text-red-700 bg-red-50'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {l.label}
              </Link>
            ))}
            <a href="tel:+628119198611"
              className="flex items-center gap-3 px-4 py-3 mt-2 text-sm text-red-600 font-bold rounded-2xl bg-red-50/50 hover:bg-red-100 transition-colors">
              <Phone className="w-4 h-4" />
              Darurat - Hubungi PMI
            </a>
          </div>
        )}
      </header>
    </div>
  );
}
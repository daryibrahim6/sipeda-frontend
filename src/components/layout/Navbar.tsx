'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, Droplets, ChevronDown, Phone } from 'lucide-react';

const mainNav = [
  { href: '/peta', label: 'Peta Lokasi' },
  { href: '/jadwal', label: 'Jadwal Donor' },
  { href: '/stok-darah', label: 'Stok Darah' },
  { href: '/artikel', label: 'Artikel' },
];

const infoNav = [
  { href: '/syarat-donor', label: 'Syarat Donor' },
  { href: '/faq', label: 'FAQ' },
  { href: '/tentang', label: 'Tentang SIPEDA' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  const infoIsActive = infoNav.some(l => isActive(l.href));

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b transition-all duration-200 ${scrolled ? 'border-gray-200 shadow-md shadow-gray-100/80' : 'border-gray-100 shadow-none'
      }`}>
      {/* Red accent top bar */}
      <div className="h-[3px] bg-gradient-to-r from-red-700 via-red-600 to-rose-500" />

      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
        aria-label="Navigasi utama"
      >
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-red-700 transition-colors">
            <Droplets className="w-4 h-4 text-white fill-white" aria-hidden="true" />
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">
            SIPEDA
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <div className="hidden md:flex items-center gap-0.5">
          {mainNav.map(l => (
            <Link key={l.href} href={l.href}
              className={`px-3.5 py-2 text-sm rounded-lg font-medium transition-colors ${isActive(l.href)
                  ? 'text-red-700 bg-red-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
              className={`flex items-center gap-1 px-3.5 py-2 text-sm rounded-lg font-medium transition-colors ${infoIsActive
                  ? 'text-red-700 bg-red-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              aria-expanded={dropdownOpen}
            >
              Info
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50 animate-scale-in">
                {infoNav.map(l => (
                  <Link key={l.href} href={l.href}
                    className={`block px-4 py-2.5 text-sm font-medium transition-colors ${isActive(l.href)
                        ? 'text-red-700 bg-red-50'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
            <Phone className="w-3.5 h-3.5" />
            <span className="font-medium">Darurat</span>
          </a>
          <Link href="/jadwal"
            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm hover:shadow-md hover:shadow-red-600/25">
            Daftar Donor
          </Link>
        </div>

        {/* ── Mobile Toggle ── */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-0.5 animate-fade-in"
        >
          {[...mainNav, ...infoNav].map(l => (
            <Link key={l.href} href={l.href}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive(l.href)
                  ? 'text-red-700 bg-red-50'
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
              aria-current={isActive(l.href) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}

          <div className="pt-3 space-y-2">
            <a href="tel:+628119198611"
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors">
              <Phone className="w-4 h-4 text-red-500" />
              Hubungi PMI Darurat
            </a>
            <Link href="/jadwal"
              className="flex items-center justify-center px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">
              Daftar Donor Sekarang
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
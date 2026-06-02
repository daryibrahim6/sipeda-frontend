'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Phone, Menu, X } from 'lucide-react';

const mainNav = [
  { href: '/', label: 'Beranda' },
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
  const pathname = usePathname();
  const dropRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const navGapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function update(y: number) {
      const next = y > 60;
      headerRef.current?.classList.toggle('scrolled', next);
      navGapRef.current?.classList.toggle('scrolled', next);
    }

    update(window.scrollY);

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          update(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      setMobileOpen(false);
      setDropdownOpen(false);
    }, 0);
    return () => clearTimeout(id);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const infoIsActive = infoNav.some(p => pathname.startsWith(p.href));

  return (
    <header
      ref={headerRef}
      className="fixed left-1/2 -translate-x-1/2 z-50 bg-white/95 rounded-3xl border border-[var(--color-border)] top-[22px] w-[calc(100%-76px)] shadow-[0_4px_24px_rgba(0,0,0,0.12)] [transition:width_0.35s_cubic-bezier(0.4,0,0.2,1)] [&.scrolled]:w-[64%] [&.scrolled]:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
    >
      <nav
        className="grid grid-cols-[auto_1fr_auto] items-center h-[60px] px-3"
        aria-label="Navigasi utama"
      >
        {/* Col 1: Logo */}
        <div className="justify-self-start">
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/logo.webp" alt="SIPEDA" width={44} height={44} className="h-10 sm:h-11 w-auto group-hover:scale-105 transition-transform duration-300" style={{ width: 'auto', height: 'auto' }} />
            <span className="font-extrabold tracking-tight text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors duration-300 text-lg sm:text-xl">
              SIPEDA
            </span>
          </Link>
        </div>

        {/* Col 2: Nav links */}
        <div ref={navGapRef} className="hidden md:flex justify-self-center items-center gap-3 transition-[gap] duration-[350ms] ease-[cubic-bezier(0.4,0,0.2,1)] [&.scrolled]:gap-2">
          {mainNav.map(l => (
            <Link key={l.href} href={l.href}
              className={`px-2 py-2 text-sm font-semibold relative nav-link-underline active:scale-[0.95] ${isActive(l.href)
                ? 'text-[var(--color-primary)] active'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'
                }`}
              aria-current={isActive(l.href) ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}

          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropdownOpen(p => !p)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDropdownOpen(p => !p); } else if (e.key === 'Escape' && dropdownOpen) { setDropdownOpen(false); } }}
              className={`flex items-center gap-1 px-2 py-2 text-sm font-semibold relative nav-link-underline active:scale-[0.95] ${infoIsActive
                ? 'text-[var(--color-primary)] active'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'
                }`}
              aria-expanded={dropdownOpen}
              aria-controls="info-dropdown"
            >
              Info
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div id="info-dropdown" className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-white border border-[var(--color-border)] rounded-2xl shadow-xl py-2 z-50 animate-scale-in">
                {infoNav.map(l => (
                  <Link key={l.href} href={l.href}
                    className={`block px-5 py-2.5 text-sm font-medium border-l-2 transition-all active:scale-[0.97] ${isActive(l.href)
                      ? 'text-[var(--color-primary)] border-[var(--color-primary)] bg-[var(--color-section-alt)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] border-transparent hover:border-[var(--color-primary)] hover:bg-[var(--color-section-alt)]'
                      }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Col 3: CTA + Hamburger */}
        <div className="justify-self-end flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
          <a href="tel:+628119198611"
            className="flex items-center justify-center w-10 h-10 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] transition-colors"
            title="Darurat (Telepon PMI)">
              <Phone className="w-4 h-4" />
            </a>
            <Link href="/jadwal"
              className={`px-4 sm:px-5 py-2 text-sm font-bold rounded-full transition-all shadow-sm active:scale-95 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-accent)] text-white hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)]`}>
              Daftar Donor
            </Link>
          </div>
          <button
            className="md:hidden p-3 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-section-alt)] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border-muted)] px-3 pt-3 pb-5 space-y-1.5 bg-white rounded-b-[2rem]">
          {[...mainNav, ...infoNav].map(l => (
            <Link key={l.href} href={l.href}
              className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${isActive(l.href)
                ? 'text-[var(--color-primary)] bg-[var(--color-primary-subtle)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-section-alt)]'
                }`}
            >
              {l.label}
            </Link>
          ))}
          <a href="tel:+628119198611"
            className="flex items-center gap-3 px-4 py-2.5 mt-2 text-sm text-red-700 font-bold rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 transition-colors">
            <Phone className="w-4 h-4" />
            Darurat — Hubungi PMI
          </a>
        </div>
      )}
    </header>
  );
}

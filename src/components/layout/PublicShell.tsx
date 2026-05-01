'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import Navbar from './Navbar';
import MobileBottomNav from './MobileBottomNav';
import Footer from './Footer';

/**
 * PublicShell — persistent Navbar + Footer untuk semua halaman publik.
 * Komponen ini hidup di root layout, jadi Navbar TIDAK pernah di-unmount
 * saat navigasi antar halaman. Admin routes tidak mendapat public navbar.
 */
export function PublicShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isExcluded = pathname?.startsWith('/admin') || pathname?.startsWith('/petugas') || pathname === '/login';

    if (isExcluded) return <>{children}</>;

    // Halaman utama (/) desainnya full-screen menyentuh ujung atas (Hero gelap),
    // Halaman lain butuh ruang bernapas (padding-top) agar konten tidak tertutup Navbar melayang.
    const isHome = pathname === '/';

    return (
        <div className={`pb-16 md:pb-0 ${!isHome ? 'pt-24 sm:pt-28 bg-[#FAFAFA]' : ''} min-h-screen flex flex-col`}>
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
            <MobileBottomNav />
        </div>
    );
}

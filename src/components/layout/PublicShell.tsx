'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * PublicShell — persistent Navbar + Footer untuk semua halaman publik.
 * Komponen ini hidup di root layout, jadi Navbar TIDAK pernah di-unmount
 * saat navigasi antar halaman. Admin routes tidak mendapat public navbar.
 */
export function PublicShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) return <>{children}</>;

    return (
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    );
}

'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import { PengumumanDarurat } from '@/components/PengumumanDarurat';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import MobileCtaBar from './MobileCtaBar';
import Footer from './Footer';

export function PublicShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isExcluded = pathname?.startsWith('/admin') || pathname?.startsWith('/petugas') || pathname === '/login';

    if (isExcluded) return <>{children}</>;

    return (
        <div className={`pb-20 md:pb-0 min-h-screen flex flex-col ${
            pathname === '/' ? '' : 'pt-20 sm:pt-24'
        }`}>
            <main className="flex-1">
                <PengumumanDarurat />
                <ErrorBoundary>
                    {children}
                </ErrorBoundary>
            </main>
            <Footer />
            <MobileCtaBar />
        </div>
    );
}

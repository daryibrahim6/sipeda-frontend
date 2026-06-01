'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getPetugasSession } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { PetugasCtx, type PetugasUser } from '@/lib/petugas-context';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function PetugasLayout({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<'checking' | 'ok' | 'denied'>('checking');
    const [user, setUser] = useState<PetugasUser | null>(null);
    const pathname = usePathname();

    const isLoginPage = pathname === '/petugas/login';

    useEffect(() => {
        // Login page tidak perlu auth check — skip
        if (isLoginPage) return;

        let cancelled = false;
        getPetugasSession().then(session => {
            if (cancelled) return;
            if (session) {
                setUser(session.user as PetugasUser);
                setAuthState('ok');
            } else {
                setAuthState('denied');
                window.location.replace('/login?expired=1');
            }
        });
        return () => { cancelled = true; };
    }, [isLoginPage]);

    if (!isLoginPage && (authState === 'checking' || authState === 'denied')) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
            </div>
        );
    }

    if (isLoginPage) return <>{children}</>;

    return (
        <PetugasCtx.Provider value={user}>
            <ErrorBoundary>
                {children}
            </ErrorBoundary>
        </PetugasCtx.Provider>
    );
}

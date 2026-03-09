'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { getPetugasSession } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

type PetugasUser = { id: number; name: string; email: string; role: string };
const PetugasCtx = createContext<PetugasUser | null>(null);
export const usePetugasUser = () => useContext(PetugasCtx);

export default function PetugasLayout({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<'checking' | 'ok' | 'denied'>('checking');
    const [user, setUser] = useState<PetugasUser | null>(null);
    const pathname = usePathname();

    const isLoginPage = pathname === '/petugas/login';

    useEffect(() => {
        if (isLoginPage) {
            setAuthState('ok');
            return;
        }

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
            {children}
        </PetugasCtx.Provider>
    );
}

'use client';

import Image from 'next/image';
import { LogOut } from 'lucide-react';

type PetugasHeaderProps = {
    userName: string;
    onLogout: () => void;
};

export function PetugasHeader({ userName, onLogout }: PetugasHeaderProps) {
    return (
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[var(--color-border-muted)] shadow-[var(--shadow-card)]">
            <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <Image src="/logo.webp" alt="SIPEDA" width={32} height={32} className="h-8 w-auto" style={{ width: 'auto', height: 'auto' }} />
                    <div>
                        <div className="text-sm font-extrabold text-[var(--color-text-primary)] tracking-tight">SIPEDA</div>
                        <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Petugas Lapangan</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--color-text-muted)] hidden sm:block">{userName}</span>
                    <button onClick={onLogout} className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all" aria-label="Logout">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}

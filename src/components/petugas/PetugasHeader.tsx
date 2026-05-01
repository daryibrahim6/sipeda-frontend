'use client';

import { Droplets, LogOut } from 'lucide-react';

type PetugasHeaderProps = {
    userName: string;
    onLogout: () => void;
};

export function PetugasHeader({ userName, onLogout }: PetugasHeaderProps) {
    return (
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/30">
                        <Droplets className="w-4 h-4 text-white fill-white" />
                    </div>
                    <div>
                        <div className="text-sm font-extrabold text-gray-900 tracking-tight">SIPEDA</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Petugas Lapangan</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 hidden sm:block">{userName}</span>
                    <button onClick={onLogout} className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all" aria-label="Logout">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}

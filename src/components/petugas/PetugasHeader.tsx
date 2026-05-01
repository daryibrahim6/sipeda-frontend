'use client';

import { Droplets, LogOut } from 'lucide-react';

type PetugasHeaderProps = {
    userName: string;
    onLogout: () => void;
};

export function PetugasHeader({ userName, onLogout }: PetugasHeaderProps) {
    return (
        <header className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur-sm border-b border-white/5">
            <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/30">
                        <Droplets className="w-4 h-4 text-white fill-white" />
                    </div>
                    <div>
                        <div className="text-sm font-bold">SIPEDA</div>
                        <div className="text-[10px] text-gray-600">Pencatatan Donor</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 hidden sm:block">{userName}</span>
                    <button onClick={onLogout} className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors" aria-label="Logout">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}

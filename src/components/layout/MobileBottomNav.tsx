'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Droplets, MapPin, Menu } from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/jadwal', label: 'Jadwal', icon: Calendar },
    { href: '/stok-darah', label: 'Stok', icon: Droplets },
    { href: '/peta', label: 'Peta', icon: MapPin },
];

const moreItems = [
    { href: '/artikel', label: 'Artikel' },
    { href: '/syarat-donor', label: 'Syarat Donor' },
    { href: '/riwayat', label: 'Riwayat Donor' },
    { href: '/faq', label: 'FAQ' },
    { href: '/tentang', label: 'Tentang' },
];

export default function MobileBottomNav() {
    const pathname = usePathname();
    const [moreOpen, setMoreOpen] = useState(false);

    const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);
    const isMoreActive = moreItems.some(item => isActive(item.href));

    return (
        <>
            {/* Overlay for More Menu */}
            {moreOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={() => setMoreOpen(false)}
                />
            )}

            {/* More Menu Popup */}
            <div className={`fixed bottom-[80px] left-4 right-4 bg-white rounded-2xl shadow-xl z-50 md:hidden overflow-hidden transition-all duration-300 transform origin-bottom ${moreOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="p-2">
                    <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Lainnya</div>
                    <div className="grid grid-cols-1 gap-1">
                        {moreItems.map(item => (
                            <Link 
                                key={item.href} 
                                href={item.href}
                                onClick={() => setMoreOpen(false)}
                                className={`px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive(item.href) ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Bottom Navigation Island */}
            <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden flex justify-center pointer-events-none">
                <nav className="pointer-events-auto w-full max-w-sm bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-[2rem] px-2 py-2 flex items-center justify-between">
                    {navItems.map(item => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMoreOpen(false)}
                                className="flex flex-col items-center justify-center w-[4.5rem] h-14 relative group rounded-2xl transition-colors hover:bg-gray-50"
                            >
                                <div className={`flex items-center justify-center transition-transform duration-300 ${active ? '-translate-y-1 text-red-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                    <item.icon className={`w-[22px] h-[22px] ${active ? 'fill-red-50' : ''}`} />
                                </div>
                                <span className={`text-[10px] mt-1 absolute bottom-2 transition-all duration-300 ${active ? 'text-red-600 font-bold opacity-100 translate-y-0' : 'text-gray-500 font-medium opacity-0 translate-y-2'}`}>
                                    {item.label}
                                </span>
                                {/* Indikator Titik Aktif */}
                                {active && (
                                    <span className="absolute -bottom-1 w-1 h-1 bg-red-600 rounded-full animate-fade-in" />
                                )}
                            </Link>
                        );
                    })}
                    
                    {/* More Button */}
                    <button
                        onClick={() => setMoreOpen(!moreOpen)}
                        className="flex flex-col items-center justify-center w-[4.5rem] h-14 relative group rounded-2xl transition-colors hover:bg-gray-50"
                    >
                        <div className={`flex items-center justify-center transition-transform duration-300 ${isMoreActive || moreOpen ? '-translate-y-1 text-red-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                            <Menu className={`w-[22px] h-[22px] transition-transform duration-300 ${moreOpen ? 'rotate-90' : ''}`} />
                        </div>
                        <span className={`text-[10px] mt-1 absolute bottom-2 transition-all duration-300 ${isMoreActive || moreOpen ? 'text-red-600 font-bold opacity-100 translate-y-0' : 'text-gray-500 font-medium opacity-0 translate-y-2'}`}>
                            Menu
                        </span>
                        {(isMoreActive || moreOpen) && (
                            <span className="absolute -bottom-1 w-1 h-1 bg-red-600 rounded-full animate-fade-in" />
                        )}
                    </button>
                </nav>
            </div>
        </>
    );
}

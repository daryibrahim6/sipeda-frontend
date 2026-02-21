'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Droplets, LayoutDashboard, Calendar, Tally4,
  ClipboardList, FileText, LogOut, X, ChevronRight,
  User,
} from 'lucide-react';
// FIX: clearToken dan getUser TIDAK ADA di auth.ts (sudah dihapus saat migrasi ke Supabase Auth).
// Sidebar lama: import { clearToken, getUser } from '@/lib/auth' → runtime crash
// Sidebar baru: pakai logoutAdmin() + getAdminSession() yang benar
import { logoutAdmin, getAdminSession } from '@/lib/auth';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/admin/dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/jadwal',     label: 'Jadwal Donor', icon: Calendar },
  { href: '/admin/stok-darah', label: 'Stok Darah',   icon: Tally4 },
  { href: '/admin/registrasi', label: 'Registrasi',   icon: ClipboardList },
  { href: '/admin/artikel',    label: 'Artikel',      icon: FileText },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    // FIX: getAdminSession() adalah async — dulu getUser() adalah sync mock
    getAdminSession().then(session => {
      if (session?.user) {
        setUser({
          name:  session.user.name,
          email: session.user.email,
          role:  session.user.role,
        });
      }
    });
  }, []);

  async function handleLogout() {
    // FIX: logoutAdmin() dari Supabase Auth, bukan clearToken() yang sudah dihapus
    await logoutAdmin();
    router.push('/admin/login');
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const content = (
    <div className="flex flex-col h-full bg-gray-950 text-white w-64 flex-shrink-0">

      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/30">
            <Droplets className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">SIPEDA</span>
          <span className="text-[10px] font-semibold text-gray-600 bg-white/5 px-1.5 py-0.5 rounded uppercase tracking-widest">Admin</span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg text-gray-600 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Tutup menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Navigasi admin">
        {navItems.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'}`} />
              {item.label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-red-300" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user + logout */}
      <div className="border-t border-white/5 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors rounded-lg hover:bg-white/5 mb-1"
        >
          <Droplets className="w-3.5 h-3.5" />
          Lihat Situs Publik
        </Link>
        <div className="flex items-center gap-3 px-3 py-3 mt-1 border-t border-white/5">
          <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-300 truncate">
              {user?.name ?? 'Admin'}
            </div>
            <div className="text-[10px] text-gray-600 truncate capitalize">
              {user?.role ?? '—'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0 border-r border-white/5">
        {content}
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <div className="relative z-10 h-full">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
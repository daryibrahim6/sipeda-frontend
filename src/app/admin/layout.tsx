'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/admin/Sidebar';
import { getAdminSession } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

// ─── Context for sidebar toggle ───────────────────────────────────────────────

const SidebarToggleCtx = createContext<() => void>(() => { });
export const useSidebarToggle = () => useContext(SidebarToggleCtx);

// ─── Auth gate — blocks ALL admin children until session confirmed ─────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authState, setAuthState] = useState<'checking' | 'ok' | 'denied'>('checking');
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Login page tidak perlu auth check — skip langsung ke 'ok'
    if (isLoginPage) {
      setAuthState('ok');
      return;
    }

    let cancelled = false;
    getAdminSession().then(session => {
      if (cancelled) return;
      if (session) {
        setAuthState('ok');
      } else {
        setAuthState('denied');
        window.location.replace('/admin/login?expired=1');
      }
    });
    return () => { cancelled = true; };
  }, [isLoginPage]);

  // Tampilkan spinner saat cek session (kecuali di login page)
  if (!isLoginPage && (authState === 'checking' || authState === 'denied')) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
      </div>
    );
  }

  // Login page: render tanpa sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Admin pages: render dengan sidebar
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SidebarToggleCtx.Provider value={() => setSidebarOpen(o => !o)}>
          {children}
        </SidebarToggleCtx.Provider>
      </div>
    </div>
  );
}
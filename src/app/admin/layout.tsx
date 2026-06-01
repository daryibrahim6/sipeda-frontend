'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/admin/Sidebar';
import { getAdminSession } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { SidebarToggleCtx } from '@/lib/admin-context';

// ─── Auth gate — blocks ALL admin children until session confirmed ─────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authState, setAuthState] = useState<'checking' | 'ok' | 'denied'>('checking');
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Login page tidak perlu auth check — skip
    if (isLoginPage) return;

    let cancelled = false;
    getAdminSession().then(session => {
      if (cancelled) return;
      if (session) {
        setAuthState('ok');
      } else {
        setAuthState('denied');
        router.replace('/admin/login?expired=1');
      }
    });
    return () => { cancelled = true; };
  }, [isLoginPage, router]);

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
     <div className="flex min-h-screen bg-[var(--color-cream)] p-0 lg:p-6 lg:gap-6">
       <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
       <div className="flex-1 flex flex-col min-w-0 bg-white lg:rounded-3xl lg:shadow-sm lg:border border-[var(--color-border-muted)] overflow-hidden relative">
         <SidebarToggleCtx.Provider value={() => setSidebarOpen(o => !o)}>
           <div className="flex-1 overflow-y-auto">
             {children}
           </div>
         </SidebarToggleCtx.Provider>
       </div>
     </div>
   );
}
'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar is injected by each page via slot pattern — each page imports TopBar */}
        {/* We expose the toggle fn via a custom event or prop drilling */}
        {/* Simpler: pass via context */}
        <SidebarToggleProvider onToggle={() => setSidebarOpen(o => !o)}>
          {children}
        </SidebarToggleProvider>
      </div>
    </div>
  );
}

// ─── Context for sidebar toggle ───────────────────────────────────────────────
import { createContext, useContext } from 'react';

const SidebarToggleCtx = createContext<() => void>(() => {});
export const useSidebarToggle = () => useContext(SidebarToggleCtx);

function SidebarToggleProvider({
  children,
  onToggle,
}: {
  children: React.ReactNode;
  onToggle: () => void;
}) {
  return (
    <SidebarToggleCtx.Provider value={onToggle}>
      {children}
    </SidebarToggleCtx.Provider>
  );
}
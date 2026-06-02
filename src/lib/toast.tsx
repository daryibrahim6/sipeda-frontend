'use client';

import {
  createContext, useContext, useState, useCallback,
  type ReactNode,
} from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

type ToastType = 'success' | 'error';

type ToastItem = {
  id: number;
  msg: string;
  type: ToastType;
};

type ToastCtx = {
  toast: (msg: string, type?: ToastType) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const add = useCallback((msg: string, type: ToastType = 'success') => {
    const id = nextId++;
    setItems(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setItems(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const remove = useCallback((id: number) => {
    setItems(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{ toast: add }}>
      {children}
      <div className="fixed bottom-20 lg:bottom-6 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {items.map(item => (
          <ToastBar key={item.id} {...item} onClose={() => remove(item.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>');
  return ctx;
}

function ToastBar({ msg, type, onClose }: ToastItem & { onClose: () => void }) {
  const isError = type === 'error';
  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-slide-up ${
        isError
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-green-50 border-green-200 text-green-800'
      }`}
    >
      {isError
        ? <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
        : <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-green-500" />
      }
      <span className="flex-1">{msg}</span>
      <button
        onClick={onClose}
        className="shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

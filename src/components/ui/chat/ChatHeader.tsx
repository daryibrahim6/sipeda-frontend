'use client';

import { Trash2 } from 'lucide-react';

interface ChatHeaderProps {
  onClear: () => void;
}

export default function ChatHeader({ onClear }: ChatHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-accent)] px-4 py-3.5 flex items-center gap-3 shadow-md">
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        {/* Beautiful heart icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-white animate-blood-pulse"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
        </svg>
      </div>
      <div className="flex-1">
        <h1 className="text-white font-bold text-sm leading-none">Asisten SIPEDA AI</h1>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/80 text-xs font-medium">Online · Siap Membantu</span>
        </div>
      </div>
      <button
        onClick={onClear}
        className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all active:scale-90"
        title="Bersihkan Chat"
      >
        <Trash2 className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}

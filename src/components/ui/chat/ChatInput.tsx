'use client';

import { useRef, useEffect, useState, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [value, isLoading]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const text = value.trim();
    if (!text || isLoading) return;
    onSend(text);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  return (
    <div className="px-4 py-3 bg-white border-t border-[var(--color-border-muted)]">
      <div className="flex items-end gap-2 bg-stone-50 border border-[var(--color-border)] rounded-2xl px-3 py-2.5 focus-within:border-[var(--color-primary)] focus-within:bg-white focus-within:ring-2 focus-within:ring-red-100 transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tulis pesan Anda..."
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent resize-none text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none leading-relaxed disabled:opacity-50"
          style={{ minHeight: '24px', maxHeight: '120px' }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !value.trim()}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-accent)] flex items-center justify-center text-white flex-shrink-0 transition-all duration-200 hover:shadow-md hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none active:scale-95"
          aria-label="Kirim pesan"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
      <p className="text-center text-[10px] text-[var(--color-text-muted)] mt-2">
        Enter untuk kirim &nbsp;·&nbsp; Shift+Enter untuk baris baru
      </p>
    </div>
  );
}

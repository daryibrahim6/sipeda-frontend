'use client';

import { SUGGESTION_PROMPTS } from '../../../lib/chat-config';

interface SuggestionChipsProps {
  onSelect: (prompt: string) => void;
}

export default function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div className="px-4 pt-2.5 pb-4 bg-white border-t border-[var(--color-border-muted)]">
      <p className="text-[10px] text-[var(--color-text-muted)] mb-2.5 font-bold uppercase tracking-widest">
        Pertanyaan Umum
      </p>
      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto scrollbar-hide">
        {SUGGESTION_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="text-xs bg-[var(--color-primary-subtle)] border border-red-100 text-[var(--color-primary)] hover:bg-red-100 hover:text-[var(--color-primary-dark)] px-3 py-1.5 rounded-full transition-all duration-200 active:scale-95 shadow-sm hover:shadow"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

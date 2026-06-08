'use client';

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 mb-3 animate-fade-in">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-accent)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
        AI
      </div>
      {/* Bubble */}
      <div className="bg-white border border-[var(--color-border-muted)] rounded-2xl rounded-bl-none px-4 py-3 shadow-[var(--shadow-card)]">
        <div className="flex gap-1 items-center">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-muted)] animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

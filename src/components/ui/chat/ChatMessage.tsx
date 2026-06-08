'use client';

import React from 'react';
import { type Message } from '@/hooks/useChat';

interface ChatMessageProps {
  msg: Message;
}

function formatContent(text: string) {
  // Ganti **teks** jadi <strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-extrabold text-[var(--color-text-primary)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Ganti backtick inline `code`
    const codeParts = part.split(/(`[^`]+`)/g);
    return codeParts.map((cp, j) => {
      if (cp.startsWith('`') && cp.endsWith('`')) {
        return (
          <code
            key={`${i}-${j}`}
            className="bg-black/10 px-1.5 py-0.5 rounded text-[0.85em] font-mono text-rose-700"
          >
            {cp.slice(1, -1)}
          </code>
        );
      }
      return <span key={`${i}-${j}`}>{cp}</span>;
    });
  });
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChatMessage({ msg }: ChatMessageProps) {
  const isUser = msg.role === 'user';

  return (
    <div
      className={`flex items-end gap-2.5 animate-fade-in ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
            : msg.isError
            ? 'bg-gradient-to-br from-amber-500 to-red-500'
            : 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-accent)]'
        }`}
      >
        {isUser ? 'U' : 'AI'}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col max-w-[78%] gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-accent)] text-white rounded-br-none shadow-sm'
              : msg.isError
              ? 'bg-amber-50 border border-amber-200 text-amber-950 rounded-bl-none shadow-sm'
              : 'bg-white border border-[var(--color-border-muted)] text-[var(--color-text-primary)] rounded-bl-none shadow-[var(--shadow-card)]'
          }`}
        >
          {formatContent(msg.content)}
        </div>
        <span className="text-[10px] text-[var(--color-text-muted)] px-1 font-medium">
          {formatTime(msg.timestamp)}
          <span className="ml-1 opacity-60">· {isUser ? 'Anda' : 'Asisten Donor'}</span>
        </span>
      </div>
    </div>
  );
}

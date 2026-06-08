'use client';

import { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import SuggestionChips from './SuggestionChips';
import { type Message } from '@/hooks/useChat';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSuggestionSelect: (text: string) => void;
}

export default function ChatWindow({ messages, isLoading, onSuggestionSelect }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const showSuggestions = messages.length <= 1 && !isLoading;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-stone-50">
      {/* Scrollable messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips (only shows at start) */}
      {showSuggestions && (
        <SuggestionChips onSelect={onSuggestionSelect} />
      )}
    </div>
  );
}

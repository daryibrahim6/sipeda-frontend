'use client';

import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import ChatHeader from './chat/ChatHeader';
import ChatWindow from './chat/ChatWindow';
import ChatInput from './chat/ChatInput';
import { useChat } from '@/hooks/useChat';
import { MODEL } from '@/lib/chat-config';

export function DonorChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, sendMessage, clearChat } = useChat(MODEL);

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed z-[100] w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90 ${
          isOpen
            ? 'bg-stone-800 hover:bg-stone-700 text-white rotate-90'
            : 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-accent)] text-white hover:shadow-xl hover:shadow-red-500/25 hover:-translate-y-0.5'
        } bottom-24 right-5 sm:bottom-6 sm:right-6`}
        aria-label={isOpen ? 'Tutup chat' : 'Buka chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-300" />
        ) : (
          <MessageSquare className="w-6 h-6 transition-transform duration-300" />
        )}
      </button>

      {/* Chat Window Container */}
      <div
        className={`fixed z-[99] flex flex-col bg-white rounded-2xl border border-[var(--color-border-muted)] shadow-[var(--shadow-elevated)] overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'bottom-40 right-5 w-[calc(100vw-2.5rem)] max-w-sm h-[30rem] opacity-100 scale-100 sm:bottom-24 sm:right-6 sm:w-96 sm:h-[34rem]'
            : 'bottom-40 right-5 w-0 h-0 opacity-0 scale-95 pointer-events-none sm:bottom-24 sm:right-6'
        }`}
      >
        {/* Header */}
        <ChatHeader onClear={clearChat} />

        {/* Message Window */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSuggestionSelect={sendMessage}
          />
        </div>

        {/* Message Input */}
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </>
  );
}

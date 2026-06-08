import { useState, useCallback } from 'react';
import { SYSTEM_PROMPT } from '../lib/chat-config';

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

const INITIAL_MESSAGE: Message = {
  id: Date.now(),
  role: 'assistant',
  content: "Halo! 👋 Saya asisten donor darah Anda.\n\nSaya siap membantu menjawab pertanyaan seputar **donor darah**, syarat donor, jadwal, manfaat, dan informasi kesehatan terkait.\n\nAda yang bisa saya bantu hari ini? 😊",
  timestamp: new Date(),
};

export function useChat(model: string) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed || isLoading) return;

      setError(null);

      const userMessage: Message = {
        id: Date.now(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Build history for API (only role & content)
      const history = [...messages, userMessage].map(({ role, content }) => ({
        role,
        content,
      }));

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...history,
            ],
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP Error ${res.status}`);
        }

        const data = await res.json();
        const reply =
          data.choices?.[0]?.message?.content ||
          'Maaf, saya tidak mendapat respons. Silakan coba lagi.';

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: 'assistant',
            content: reply,
            timestamp: new Date(),
          },
        ]);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errMsg);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: 'assistant',
            content: `⚠️ Terjadi kesalahan:\n\n\`${errMsg}\`\n\nSilakan coba lagi beberapa saat lagi atau hubungi langsung PMI Indramayu di 0234-271648.`,
            timestamp: new Date(),
            isError: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, model]
  );

  const clearChat = useCallback(() => {
    setMessages([{ ...INITIAL_MESSAGE, id: Date.now(), timestamp: new Date() }]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearChat };
}

'use client';

import { FormEvent, useEffect, useRef, useState, type ReactNode } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

type Message = { role: 'user' | 'model'; content: string };

const VISITOR_KEY = 'dntech-ai-visitor';
const MAX_CLIENT_MESSAGES = 20; // mirror the backend's history cap so the UI never shows more than the model actually saw

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <span key={index}>{part}</span>;
  });
}

function renderMessage(content: string) {
  const lines = content.split('\n');
  return lines.map((line, index) => {
    const bullet = line.match(/^\s*[*-]\s+(.+)$/);
    const rendered = renderInlineMarkdown(bullet ? bullet[1] : line);
    return (
      <span key={index} className={bullet ? 'block pl-4 before:mr-2 before:content-["•"]' : 'block'}>
        {rendered}
      </span>
    );
  });
}

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [visitorId, setVisitorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Chat history is intentionally not persisted: there's no login for
    // public chatbot visitors, so a new page load/session always starts
    // with an empty conversation rather than resuming (or leaking) a
    // previous one on a shared/public device.
    const hydrationTimer = window.setTimeout(() => {
      let id = window.localStorage.getItem(VISITOR_KEY);
      if (!id) {
        id = crypto.randomUUID();
        window.localStorage.setItem(VISITOR_KEY, id);
      }
      setVisitorId(id);
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading || !visitorId) return;
    setInput('');
    setError('');
    const nextMessages = [...messages, { role: 'user' as const, content: message }].slice(-MAX_CLIENT_MESSAGES);
    setMessages(nextMessages);
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, conversationId, visitorId }),
      });
      const json = await response.json() as { success: boolean; data?: { conversationId: string; answer: string }; error?: { message?: string } };
      if (!response.ok || !json.success || !json.data) throw new Error(json.error?.message || 'Chatbot sedang tidak tersedia.');
      const finalMessages = [...nextMessages, { role: 'model' as const, content: json.data.answer }].slice(-MAX_CLIENT_MESSAGES);
      setConversationId(json.data.conversationId);
      setMessages(finalMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chatbot sedang tidak tersedia.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section className="flex h-[min(620px,calc(100vh-110px))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl" aria-label="DN Tech AI Assistant">
          <header className="flex items-center justify-between bg-blue-900 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/15 p-2"><Bot className="h-5 w-5" aria-hidden="true" /></span>
              <div><h2 className="font-semibold">DN Tech Assistant</h2><p className="text-xs text-blue-100">Jawaban berdasarkan konten DN Tech</p></div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900" aria-label="Tutup chatbot"><X className="h-5 w-5" /></button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4" aria-live="polite">
            {messages.length === 0 && <div className="rounded-lg bg-white p-3 text-sm text-gray-700 shadow-sm">Halo! Saya bisa membantu mencari informasi tentang layanan, produk, portofolio, artikel, dan FAQ DN Tech.</div>}
            {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[88%] rounded-lg px-3 py-2 text-sm ${message.role === 'user' ? 'ml-auto bg-blue-900 text-white' : 'bg-white text-gray-800 shadow-sm'}`}>{renderMessage(message.content)}</div>)}
            {loading && <div className="w-fit rounded-lg bg-white px-3 py-2 text-sm text-gray-500 shadow-sm">Sedang mencari jawaban…</div>}
            {error && <p className="text-xs text-red-700" role="alert">{error}</p>}
            <div ref={endRef} />
          </div>
          <form onSubmit={submit} className="flex gap-2 border-t border-gray-200 bg-white p-3">
            <label htmlFor="ai-chat-message" className="sr-only">Pesan untuk AI Assistant</label>
            <input id="ai-chat-message" value={input} onChange={(event) => setInput(event.target.value)} maxLength={4000} placeholder="Tanyakan sesuatu…" className="min-h-[48px] min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/20" disabled={loading} />
            <button type="submit" disabled={loading || !input.trim()} className="rounded-lg bg-blue-900 px-3 py-2 text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Kirim pesan"><Send className="h-4 w-4" aria-hidden="true" /></button>
          </form>
          <p className="bg-white px-3 pb-2 text-xs text-gray-600">AI dapat keliru. Untuk kepastian, hubungi tim DN Tech.</p>
        </section>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex min-h-14 items-center gap-2 rounded-full bg-teal-600 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-700" aria-label={open ? 'Tutup DN Tech AI Assistant' : 'Buka DN Tech AI Assistant'} aria-expanded={open}>
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <MessageCircle className="h-5 w-5" aria-hidden="true" />}
        <span className="hidden sm:inline">Tanya AI</span>
      </button>
    </div>
  );
}

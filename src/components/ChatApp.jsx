import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '../hooks/useChat';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import MessageList from './MessageList';
import ChatComposer from './ChatComposer';

export default function ChatApp() {
  const chat = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll ke pesan terbaru.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [chat.messages, chat.isLoading, chat.error]);

  const handleSelectExample = useCallback((question) => {
    setSidebarOpen(false);
    chat.ask(question);
  }, [chat]);

  return (
    <div className="flex h-screen flex-col bg-slate-100 text-slate-900">
      <div className="h-0.5 w-full bg-gradient-to-r from-[#00549B] via-[#009A44] to-[#ED1C24]" />

      <AppHeader connection={chat.connection} onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div className="flex min-h-0 flex-1">
        {/* Sidebar desktop */}
        <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-white lg:block">
          <Sidebar onSelectExample={handleSelectExample} />
        </aside>

        {/* Sidebar drawer (mobile) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Tutup menu"
              className="absolute inset-0 bg-slate-950/40"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] bg-white shadow-xl">
              <Sidebar onSelectExample={handleSelectExample} />
            </div>
          </div>
        )}

        {/* Area chat utama */}
        <main className="flex min-w-0 flex-1 flex-col bg-slate-50">
          <MessageList
            ref={scrollRef}
            messages={chat.messages}
            isLoading={chat.isLoading}
            error={chat.error}
            onRetry={chat.retry}
            onSelectExample={handleSelectExample}
          />
          <ChatComposer
            value={chat.draft}
            onChange={chat.setDraft}
            onSubmit={chat.submit}
            onStop={chat.stop}
            isLoading={chat.isLoading}
          />
        </main>
      </div>
    </div>
  );
}

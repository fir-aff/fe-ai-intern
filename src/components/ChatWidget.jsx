import { useEffect, useRef, useState } from 'react';
import { useChat } from '../hooks/useChat';
import MessageList from './MessageList';
import ChatComposer from './ChatComposer';
import ConnectionStatus from './ConnectionStatus';
import BrandLogo from './BrandLogo';
import { APP_NAME } from '../constants';

export default function ChatWidget() {
  const chat = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [chat.messages, chat.isLoading, chat.error]);

  const close = () => {
    setIsOpen(false);
    setIsFullscreen(false);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-50 font-sans">
      {isOpen && !isFullscreen && (
        <button
          type="button"
          aria-label="Tutup chat"
          className="pointer-events-auto absolute inset-0 bg-slate-950/20"
          onClick={close}
        />
      )}

      <div
        className={
          isFullscreen
            ? 'pointer-events-auto absolute inset-0 flex p-0 sm:p-4'
            : 'pointer-events-auto absolute bottom-5 right-5'
        }
      >
        {!isOpen ? (
          <div className="relative">
            <span className="chat-fab-ping absolute inset-0 rounded-full bg-[#ED1C24]" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl shadow-[#ED1C24]/25 ring-1 ring-slate-200 transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00549B]/40 focus-visible:ring-offset-2"
              aria-label="Buka Pertamina Internal Chatbot"
            >
              <BrandLogo className="h-9 w-9" />
              <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <section
            className={`chat-window flex flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl ${
              isFullscreen
                ? 'h-full w-full rounded-none sm:rounded-2xl'
                : 'h-[600px] max-h-[calc(100vh-2.5rem)] w-[calc(100vw-2.5rem)] rounded-2xl sm:w-[400px]'
            }`}
            role="dialog"
            aria-label={APP_NAME}
          >
            <header className="flex items-center gap-2.5 border-b border-slate-200 bg-white px-3 py-2.5">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-50 ring-1 ring-slate-200">
                <BrandLogo className="h-5 w-5" />
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <h2 className="truncate text-sm font-semibold text-slate-900">{APP_NAME}</h2>
                <ConnectionStatus status={chat.connection} compact />
              </div>

              <div className="ml-auto flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={chat.reset}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00549B]/30"
                  title="Bersihkan percakapan"
                  aria-label="Bersihkan percakapan"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 11a8.1 8.1 0 00-15.5-2M4 4v5h5m-5 4a8.1 8.1 0 0015.5 2M20 20v-5h-5" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFullscreen((v) => !v)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00549B]/30"
                  title={isFullscreen ? 'Keluar fullscreen' : 'Fullscreen'}
                  aria-label={isFullscreen ? 'Keluar fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v6H3m12-6v6h6M9 21v-6H3m12 6v-6h6" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9V3h6m6 0h6v6M3 15v6h6m12-6v6h-6" />
                    </svg>
                  )}
                </button>

                <button
                  type="button"
                  onClick={close}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00549B]/30"
                  title="Tutup"
                  aria-label="Tutup chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </header>

            <MessageList
              ref={scrollRef}
              messages={chat.messages}
              isLoading={chat.isLoading}
              error={chat.error}
              onRetry={chat.retry}
              onSelectExample={chat.ask}
            />

            <ChatComposer
              value={chat.draft}
              onChange={chat.setDraft}
              onSubmit={chat.submit}
              onStop={chat.stop}
              isLoading={chat.isLoading}
            />
          </section>
        )}
      </div>
    </div>
  );
}

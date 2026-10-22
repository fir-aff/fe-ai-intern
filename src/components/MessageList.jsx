import { forwardRef, memo } from 'react';
import ChatMessage from './ChatMessage';
import EmptyState from './EmptyState';
import { AssistantAvatar } from './Avatars';

const TypingIndicator = memo(function TypingIndicator() {
  return (
    <div className="chat-msg-in flex gap-3">
      <AssistantAvatar />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
        <span className="chat-dot" />
        <span className="chat-dot delay-150" />
        <span className="chat-dot delay-300" />
      </div>
    </div>
  );
});

const ErrorBubble = memo(function ErrorBubble({ message, onRetry }) {
  return (
    <div className="chat-msg-in flex gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ED1C24]/10 text-[#ED1C24]">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m0 3.75h.008M10.34 3.94l-7.5 13A1.5 1.5 0 004.14 19h15.72a1.5 1.5 0 001.3-2.06l-7.5-13a1.5 1.5 0 00-2.6 0z" />
        </svg>
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-[#ED1C24]/30 bg-[#ED1C24]/5 px-4 py-3 text-sm text-slate-700">
        <p className="leading-relaxed">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#ED1C24]/30 px-2.5 py-1 text-xs font-semibold text-[#ED1C24] transition hover:bg-[#ED1C24]/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 11a8.1 8.1 0 00-15.5-2M4 4v5h5m-5 4a8.1 8.1 0 0015.5 2M20 20v-5h-5" />
          </svg>
          Coba lagi
        </button>
      </div>
    </div>
  );
});

const MessageList = memo(forwardRef(function MessageList(
  { messages, isLoading, error, onRetry, onSelectExample },
  ref,
) {
  const isEmpty = messages.length === 0 && !isLoading && !error;

  return (
    <div ref={ref} className="chat-scroll @container min-h-0 flex-1 overflow-y-auto">
      {isEmpty ? (
        <EmptyState onSelectExample={onSelectExample} />
      ) : (
        <div className="mx-auto max-w-3xl space-y-5 px-3 py-5 @md:px-6 @md:py-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && !messages.some((m) => m.isStreaming) && <TypingIndicator />}
          {error && <ErrorBubble message={error} onRetry={onRetry} />}
        </div>
      )}
    </div>
  );
}));

export default MessageList;

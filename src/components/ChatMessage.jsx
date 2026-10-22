import { memo } from 'react';
import MarkdownAnswer from './MarkdownAnswer';
import SourceList from './SourceList';
import { AssistantAvatar, UserAvatar } from './Avatars';

const toText = (value) => {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return JSON.stringify(value);
};

function ChatMessage({ message: propMessage }) {
  const rawText = propMessage?.text ?? propMessage?.answer ?? propMessage?.content;
  const normalizedText = toText(rawText);
  const isStreaming = Boolean(propMessage?.isStreaming);

  const message = {
    ...propMessage,
    sender: propMessage?.sender || propMessage?.role,
    text: propMessage?.text ?? normalizedText,
    answer: propMessage?.answer ?? normalizedText,
    isStreaming,
  };

  const isUser = message.sender === 'user';

  return (
    <div className={`chat-msg-in flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && <AssistantAvatar />}
      <div className="min-w-0 max-w-[80%]">
        {!isUser && <div className="mb-1 text-xs font-semibold text-slate-500">Asisten Pertamina</div>}
        <div
          className={
            isUser
              ? 'rounded-2xl rounded-tr-sm bg-[#00549B] px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm'
              : 'rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm'
          }
        >
          {isUser ? (
            <div className="text-white whitespace-pre-wrap">{message.text}</div>
          ) : message.text ? (
            <MarkdownAnswer content={message.text || message.answer} isStreaming={isStreaming} />
          ) : (
            <div className="flex items-center gap-1.5 py-1 text-slate-400">
              <span className="chat-dot" />
              <span className="chat-dot delay-150" />
              <span className="chat-dot delay-300" />
            </div>
          )}
          {!isUser && !isStreaming && (
            <SourceList sources={message.sources} chunkCount={message.retrievedChunks?.length ?? 0} />
          )}
        </div>
      </div>
      {isUser && <UserAvatar />}
    </div>
  );
}

export default memo(ChatMessage);

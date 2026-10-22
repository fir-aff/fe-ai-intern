import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const remarkPlugins = [remarkGfm];

function MarkdownAnswer({ content, isStreaming = false }) {
  const formattedContent = useMemo(() => {
    if (!content || typeof content !== 'string') return '';

    let text = content;

    // 1. Ubah literal '\n' jika backend mengirim escape string
    text = text.replace(/\\n/g, '\n');

    // 2. Beri baris baru sebelum heading (## / ###) jika menempel dengan teks lain
    text = text.replace(/([^\n])\s*(#{1,6}\s+)/g, '$1\n\n$2');

    // 3. Beri baris baru sebelum garis pemisah (---)
    text = text.replace(/([^\n])\s*(---)\s*/g, '$1\n\n$2\n\n');

    // 4. Beri baris baru sebelum bullet point (* atau -)
    text = text.replace(/([^\n])\s*([*•-]\s+)/g, '$1\n\n$2');

    return text;
  }, [content]);

  return (
    <div className="chat-markdown prose prose-sm max-w-none text-slate-800 leading-relaxed space-y-2">
      <ReactMarkdown remarkPlugins={remarkPlugins}>
        {formattedContent}
      </ReactMarkdown>
      {isStreaming && (
        <span
          className="inline-block h-3.5 w-1.5 translate-y-0.5 rounded-sm bg-[#00549B] animate-pulse"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default memo(MarkdownAnswer);
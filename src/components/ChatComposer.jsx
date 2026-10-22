import { memo, useEffect, useRef } from 'react';

function ChatComposer({ value, onChange, onSubmit, onStop, isLoading }) {
  const textareaRef = useRef(null);

  // Auto-grow textarea (maksimal ~160px lalu scroll).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const submit = () => {
    if (!value.trim() || isLoading) return;
    onSubmit();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && isLoading && onStop) {
      event.preventDefault();
      onStop();
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="@container border-t border-slate-200 bg-white px-3 py-3 @md:px-6">
      <div className="mx-auto max-w-3xl">
        {isLoading && (
          <div className="mb-2 flex justify-center">
            <button
              type="button"
              onClick={onStop}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              title="Hentikan pembuatan jawaban"
            >
              <span className="h-2 w-2 rounded-sm bg-[#ED1C24]" />
              Hentikan respon
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2 shadow-sm transition focus-within:border-[#00549B] focus-within:ring-2 focus-within:ring-[#00549B]/15">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'Asisten sedang mengetik…' : 'Tulis pertanyaan Anda…'}
            className="max-h-40 flex-1 resize-none bg-transparent py-1 text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#ED1C24] text-white transition hover:bg-[#C9141B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ED1C24]/30"
              aria-label="Hentikan respon"
              title="Hentikan respon"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <rect x="5" y="5" width="10" height="10" rx="1.5" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!value.trim()}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#00549B] text-white transition hover:bg-[#00447D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00549B]/30 disabled:cursor-not-allowed disabled:bg-slate-300"
              aria-label="Kirim pesan"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          )}
        </div>
        <p className="mt-1.5 px-1 text-center text-[11px] text-slate-400">
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5">Enter</kbd> kirim ·{' '}
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5">Shift</kbd>+
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5">Enter</kbd> baris baru
          {isLoading && (
            <>
              {' · '}
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5">Esc</kbd> stop
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default memo(ChatComposer);

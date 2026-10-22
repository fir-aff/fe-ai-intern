import { useCallback, useEffect, useRef, useState } from 'react';
import { sendChatMessage } from '../services/api';

let seq = 0;
const makeMessage = (role, content, sources = [], retrievedChunks = [], isStreaming = false) => ({
  id: `${role}-${Date.now()}-${seq++}`,
  role,
  sender: role,
  content,
  text: content,
  answer: content,
  sources,
  retrievedChunks,
  isStreaming,
});

/**
 * State & orkestrasi percakapan. Dipakai bersama oleh ChatApp (full-page)
 * dan ChatWidget (floating), agar logika backend tidak terduplikasi.
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connection, setConnection] = useState('online');

  const abortRef = useRef(null);
  const lastQuestionRef = useRef('');

  useEffect(() => () => abortRef.current?.abort(), []);

  const ask = useCallback(async (raw, { retry = false } = {}) => {
    const question = (raw ?? '').trim();
    if (!question || isLoading) return;

    setError(null);
    lastQuestionRef.current = question;
    if (!retry) {
      setDraft('');
      setMessages((current) => [...current, makeMessage('user', question)]);
    }
    setIsLoading(true);
    setConnection('connecting');

    const assistantMsg = makeMessage('assistant', '', [], [], true);
    setMessages((current) => [...current, assistantMsg]);

    abortRef.current = new AbortController();

    try {
      const data = await sendChatMessage(question, {
        signal: abortRef.current.signal,
        onMetadata: ({ sources, retrievedChunks }) => {
          setMessages((current) =>
            current.map((msg) =>
              msg.id === assistantMsg.id
                ? {
                    ...msg,
                    sources,
                    retrievedChunks,
                  }
                : msg
            )
          );
        },
        onChunk: (chunkText) => {
          setConnection('online');
          setMessages((current) =>
            current.map((msg) => {
              if (msg.id !== assistantMsg.id) return msg;
              const nextContent = (msg.text || '') + chunkText;
              return {
                ...msg,
                text: nextContent,
                content: nextContent,
                answer: nextContent,
              };
            })
          );
        },
      });

      setMessages((current) =>
        current.map((msg) =>
          msg.id === assistantMsg.id
            ? {
                ...msg,
                isStreaming: false,
                text: data.answer || msg.text || 'Maaf, tidak ada jawaban yang tersedia untuk pertanyaan ini.',
                content: data.answer || msg.text || 'Maaf, tidak ada jawaban yang tersedia untuk pertanyaan ini.',
                answer: data.answer || msg.text || 'Maaf, tidak ada jawaban yang tersedia untuk pertanyaan ini.',
                sources: data.sources && data.sources.length > 0 ? data.sources : msg.sources,
                retrievedChunks:
                  data.retrievedChunks && data.retrievedChunks.length > 0 ? data.retrievedChunks : msg.retrievedChunks,
              }
            : msg
        )
      );
      setConnection('online');
    } catch (err) {
      if (err.name === 'AbortError') {
        // Pengguna membatalkan streaming secara sengaja:
        // Pertahankan token yang sudah sempat di-stream dan nonaktifkan flag streaming.
        setMessages((current) =>
          current.map((msg) =>
            msg.id === assistantMsg.id
              ? {
                  ...msg,
                  isStreaming: false,
                  text: msg.text || 'Streaming dihentikan.',
                  content: msg.text || 'Streaming dihentikan.',
                  answer: msg.text || 'Streaming dihentikan.',
                }
              : msg
          )
        );
        setConnection('online');
        return;
      }

      setConnection('offline');
      setError('Gagal mengambil jawaban. Periksa koneksi Anda atau pastikan layanan backend sedang berjalan.');
      // Hapus pesan placeholder kosong jika request gagal total sebelum ada token
      setMessages((current) =>
        current.filter((msg) => msg.id !== assistantMsg.id || (msg.text && msg.text.trim().length > 0))
      );
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [isLoading]);

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const submit = useCallback(() => ask(draft), [ask, draft]);
  const retry = useCallback(() => ask(lastQuestionRef.current, { retry: true }), [ask]);
  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setDraft('');
  }, []);

  return {
    messages,
    draft,
    setDraft,
    isLoading,
    error,
    connection,
    ask,
    submit,
    retry,
    reset,
    stop,
  };
}

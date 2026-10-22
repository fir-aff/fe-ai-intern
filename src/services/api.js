// Base URL backend. Override lewat VITE_API_BASE (mis. saat di-proxy / production same-origin).
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5057';
const API_KEY = import.meta.env.VITE_API_KEY;

/**
 * Kirim pertanyaan ke backend dengan dukungan streaming Server-Sent Events (SSE).
 * POST /api/chat/stream  body: { message }
 *
 * @param {string} message
 * @param {{
 *   signal?: AbortSignal,
 *   onChunk?: (chunkText: string) => void,
 *   onMetadata?: (meta: { sources: string[], retrievedChunks: Array<any> }) => void
 * }} [options]
 * @returns {Promise<{ answer: string, sources: string[], retrievedChunks: Array<any> }>}
 */
export async function sendChatMessage(message, { signal, onChunk, onMetadata } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  };
  if (API_KEY) headers['X-API-Key'] = API_KEY;

  const response = await fetch(`${API_BASE}/api/chat/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message }),
    signal,
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || errJson.error || '';
    } catch {
      // ignore JSON parse failure
    }
    throw new Error(errorDetail || `Server merespons dengan status ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';

  // Fallback jika backend mengembalikan JSON biasa (mis. fallback endpoint / non-SSE)
  if (!contentType.includes('text/event-stream')) {
    const data = await response.json();
    const answer = typeof data.answer === 'string' ? data.answer : '';
    const sources = Array.isArray(data.sources) ? data.sources : [];
    const retrievedChunks = Array.isArray(data.retrievedChunks) ? data.retrievedChunks : [];

    if (onMetadata) {
      onMetadata({ sources, retrievedChunks });
    }
    if (onChunk && answer) {
      onChunk(answer);
    }

    return { answer, sources, retrievedChunks };
  }

  if (!response.body) {
    throw new Error('ReadableStream tidak didukung oleh respons browser.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');

  let buffer = '';
  let accumulatedAnswer = '';
  let sources = [];
  let retrievedChunks = [];

  const processBlock = (block) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    let eventType = 'message';
    let dataStr = '';

    const lines = trimmed.split('\n');
    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataStr = line.slice(5).trim();
      }
    }

    if (!dataStr) return;

    let payload = null;
    try {
      payload = JSON.parse(dataStr);
    } catch {
      payload = dataStr;
    }

    if (eventType === 'metadata') {
      if (payload && typeof payload === 'object') {
        sources = Array.isArray(payload.sources) ? payload.sources : sources;
        retrievedChunks = Array.isArray(payload.retrievedChunks) ? payload.retrievedChunks : retrievedChunks;
        if (onMetadata) {
          onMetadata({ sources, retrievedChunks });
        }
      }
    } else if (eventType === 'chunk') {
      const chunkText =
        typeof payload?.text === 'string'
          ? payload.text
          : typeof payload === 'string'
            ? payload
            : '';

      if (chunkText) {
        accumulatedAnswer += chunkText;
        if (onChunk) {
          onChunk(chunkText);
        }
      }
    } else if (eventType === 'done') {
      if (payload && typeof payload === 'object') {
        if (typeof payload.answer === 'string' && payload.answer) {
          accumulatedAnswer = payload.answer;
        }
        if (Array.isArray(payload.sources)) {
          sources = payload.sources;
        }
        if (Array.isArray(payload.retrievedChunks)) {
          retrievedChunks = payload.retrievedChunks;
        }
      }
    } else if (eventType === 'error') {
      const errMsg = payload?.message || payload?.error || 'Kesalahan pada streaming response';
      throw new Error(errMsg);
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Split SSE message blocks separated by double newline
      const parts = buffer.split('\n\n');
      buffer = parts.pop() ?? '';

      for (const part of parts) {
        processBlock(part);
      }
    }

    if (buffer.trim()) {
      processBlock(buffer);
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err;
    }
    throw err;
  } finally {
    reader.releaseLock();
  }

  return {
    answer: accumulatedAnswer,
    sources,
    retrievedChunks,
  };
}

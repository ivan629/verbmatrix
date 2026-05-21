/**
 * Lightweight translation layer.
 *
 * Backend: MyMemory (https://mymemory.translated.net) — free, no API key,
 * CORS-enabled, ~5000 chars/day anonymous. Falls back to source text on any
 * failure so the UI is never blocked.
 *
 * Caching: in-memory + localStorage, keyed by source|target|text. Repeat
 * sessions hit the cache instantly.
 */

import { STORAGE_KEYS } from "../config";

const STORAGE_KEY = STORAGE_KEYS.translationCache;

type Cache = Record<string, string>;

let memCache: Cache = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Cache) : {};
  } catch {
    return {};
  }
})();

let saveTimer: number | undefined;
function schedulePersist() {
  if (saveTimer !== undefined) return;
  saveTimer = window.setTimeout(() => {
    saveTimer = undefined;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memCache));
    } catch {
      /* quota exceeded — drop silently */
    }
  }, 600);
}

const inflight = new Map<string, Promise<string>>();

function makeKey(text: string, source: string, target: string) {
  return `${source}|${target}|${text}`;
}

/** Sync read — returns cached translation or undefined. */
export function getCachedTranslation(
  text: string,
  source: string,
  target: string
): string | undefined {
  if (source === target) return text;
  return memCache[makeKey(text, source, target)];
}

/** Async — fetches from MyMemory if needed, caches result, returns the translation
 *  (or the original text on any failure). */
export async function translate(
  text: string,
  source: string,
  target: string
): Promise<string> {
  if (!text.trim() || source === target) return text;
  const key = makeKey(text, source, target);
  if (memCache[key]) return memCache[key];

  if (inflight.has(key)) return inflight.get(key)!;

  const p = (async () => {
    try {
      const url =
        "https://api.mymemory.translated.net/get?q=" +
        encodeURIComponent(text) +
        "&langpair=" +
        encodeURIComponent(`${source}|${target}`);
      const res = await fetch(url);
      if (!res.ok) return text;
      const data = (await res.json()) as {
        responseData?: { translatedText?: string; match?: number };
        responseStatus?: number;
      };
      const translated = data?.responseData?.translatedText;
      if (typeof translated === "string" && translated.length > 0) {
        // MyMemory occasionally echoes errors as the translation. Filter obvious noise.
        if (/^MYMEMORY WARNING/i.test(translated)) return text;
        memCache[key] = translated;
        schedulePersist();
        return translated;
      }
      return text;
    } catch {
      return text;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, p);
  return p;
}

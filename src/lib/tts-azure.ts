/**
 * Azure Cognitive Services Speech — high-quality Romanian neural TTS.
 *
 * Activated automatically when both VITE_AZURE_SPEECH_KEY and
 * VITE_AZURE_SPEECH_REGION are set in your `.env`. Otherwise the app
 * silently falls back to the browser's built-in SpeechSynthesis.
 *
 * Voices to try (set VITE_AZURE_VOICE):
 *   ro-RO-EmilNeural  — male, default, warm and clear
 *   ro-RO-AlinaNeural — female, slightly brighter
 *
 * Free tier: 500,000 characters per month of neural TTS — more than enough
 * for a year of daily Romanian study.
 *
 * SECURITY: This calls Azure directly from the browser, which embeds your key
 * in the page. That's fine for a personal study tool you run locally, but
 * NEVER deploy this publicly with a real key — proxy through a backend
 * (Cloudflare Worker, Vercel Function, etc.) instead.
 */

const KEY = import.meta.env.VITE_AZURE_SPEECH_KEY as string | undefined;
const REGION = import.meta.env.VITE_AZURE_SPEECH_REGION as string | undefined;
const VOICE = (import.meta.env.VITE_AZURE_VOICE as string | undefined) || "ro-RO-EmilNeural";

export const isAzureConfigured = Boolean(KEY && REGION);

const audioCache = new Map<string, string>(); // text → blob URL
const inflight = new Map<string, Promise<string>>();

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Fetch (or return cached) MP3 blob URL for `text` from Azure TTS.
 * Throws on failure so the caller can fall back.
 */
export async function fetchAzureSpeech(text: string): Promise<string> {
  if (!isAzureConfigured) {
    throw new Error("Azure TTS is not configured");
  }
  const key = text.trim();
  if (!key) throw new Error("Empty text");
  if (audioCache.has(key)) return audioCache.get(key)!;
  if (inflight.has(key)) return inflight.get(key)!;

  const ssml = `<speak version='1.0' xml:lang='ro-RO'><voice xml:lang='ro-RO' name='${VOICE}'>${escapeXml(text)}</voice></speak>`;

  const promise = (async () => {
    try {
      const res = await fetch(
        `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: "POST",
          headers: {
            "Ocp-Apim-Subscription-Key": KEY!,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
            "User-Agent": "romanian-study",
          },
          body: ssml,
        }
      );
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Azure TTS ${res.status}: ${detail.slice(0, 120)}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioCache.set(key, url);
      return url;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}

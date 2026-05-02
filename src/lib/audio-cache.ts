import { AUDIO_MANIFEST } from "../data/audio-manifest";

/**
 * Returns the URL of a pre-generated MP3 for `text`, or null if none exists.
 * Pre-generated audio is the highest-quality tier — recorded once with
 * ElevenLabs (or another provider) and served as static files.
 */
export function lookupAudio(text: string): string | null {
  const key = text.trim();
  const hash = AUDIO_MANIFEST[key];
  if (!hash) return null;
  // Vite's BASE_URL respects the `base` setting in vite.config.ts so this
  // works whether the app is hosted at root or a sub-path.
  return `${import.meta.env.BASE_URL}audio/${hash}.mp3`;
}

export function hasPreGeneratedAudio(text: string): boolean {
  return AUDIO_MANIFEST[text.trim()] !== undefined;
}

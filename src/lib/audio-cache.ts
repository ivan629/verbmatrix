import { tryGetActiveLanguage } from "./active-language";

/**
 * Returns the URL of a pre-generated MP3 for `text`, or null if none exists.
 * Pre-generated audio is the highest-quality tier — recorded once with
 * ElevenLabs (or another provider) and served as static files.
 *
 * The manifest now lives on the active language module rather than as a
 * single global import, so each learning language can ship its own audio.
 */
export function lookupAudio(text: string): string | null {
  const lang = tryGetActiveLanguage();
  if (!lang) return null;
  const key = text.trim();
  const hash = lang.audioManifest[key];
  if (!hash) return null;
  // Vite's BASE_URL respects the `base` setting in vite.config.ts so this
  // works whether the app is hosted at root or a sub-path. We keep the flat
  // /audio/{hash}.mp3 layout for backwards-compatibility with the existing
  // generated files. When you add a second language, switch to per-language
  // subfolders (/audio/{code}/{hash}.mp3) to avoid hash collisions.
  return `${import.meta.env.BASE_URL}audio/${hash}.mp3`;
}

export function hasPreGeneratedAudio(text: string): boolean {
  const lang = tryGetActiveLanguage();
  if (!lang) return false;
  return lang.audioManifest[text.trim()] !== undefined;
}

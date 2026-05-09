import type { ComponentType } from "react";
import type { NavGroup } from "../types";

/**
 * One entry in a language module's lesson list. The engine renders these
 * in array order, anchoring each section on `id` so the sidebar can scroll
 * to it (e.g. id "L3" → href "#L3").
 *
 * Each language fully defines its own list — there's no shared skeleton.
 * One language can have 18 lessons, another can have 5, another can swap
 * vocabulary and dialogues for an entirely different reference structure.
 */
export interface LessonEntry {
  /** DOM id used for anchoring (e.g. "L3", "vocab"). Must be unique within the language. */
  id: string;
  /** The React component that renders the lesson section. */
  Component: ComponentType;
}

/**
 * A short bilingual phrase the engine displays in chrome (Hero / Footer).
 *
 *   text: target-language string, e.g. "Bună ziua!"
 *   en:   English meaning, also used as the i18n key for translating
 *         the gloss into other interface languages.
 */
export interface ChromePhrase {
  text: string;
  en: string;
}

/**
 * A complete learning-language module. Everything the engine needs to
 * present a language lives here.
 */
export interface LanguageModule {
  /** Short ISO-ish code, used for URLs, localStorage, audio paths. */
  code: string;
  /** Display label in the language picker (e.g. "Romanian", "Español"). */
  label: string;
  /** BCP-47 tag for SpeechSynthesis fallback (e.g. "ro-RO", "es-ES"). */
  speechLang: string;

  /**
   * Optional Azure Cognitive Services neural voice ID for high-quality TTS.
   * If unset, the engine falls back to whatever VITE_AZURE_VOICE provides
   * (and ultimately to the browser's built-in SpeechSynthesis using
   * `speechLang`). Examples: "ro-RO-EmilNeural", "es-ES-ElviraNeural".
   */
  azureVoice?: string;

  /**
   * Locale resources keyed by *interface* language code.
   *   { en: { hero_title: "...", ... }, uk: { hero_title: "...", ... } }
   *
   * These get merged into the live i18n bundle by <TargetLanguageProvider>
   * whenever this module becomes active. The keys overlay (and replace)
   * any matching keys in the engine's `src/locales/`.
   */
  locales: Record<string, Record<string, string>>;

  /** Pronunciation function — produces a friendly phonetic guide for a word/phrase. */
  pronounce: (text: string) => string;

  /** Maps target-language text → content-hash filename in /public/audio/. */
  audioManifest: Record<string, string>;

  /** Sidebar navigation groups. Their hrefs (e.g. "#L3") must match the
   *  ids of components rendered in `lessons`. */
  navGroups: NavGroup[];

  /** The lessons rendered, in order, between Hero and Footer. */
  lessons: LessonEntry[];

  /** Demo phrase shown in the hero ("Hover any Romanian text…"). */
  heroExample: ChromePhrase;

  /** Closing blessing in the footer ("Mult succes!"). */
  footerBlessing: ChromePhrase;
}

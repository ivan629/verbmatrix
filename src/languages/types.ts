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
 * Onboarding data — the language-specific content that powers the 5-step
 * first-contact flow. UI chrome (step labels, buttons, prose) lives in
 * engine locales; only the language-specific *content* is per-module.
 *
 *   cognates:      ~24 free-recognition words. Decoded by an English speaker
 *                  with zero prior exposure (informație, restaurant, ...).
 *   firstVerb:     The verb introduced in step 3 — shown in 3 tenses.
 *                  For Romanian: "a vorbi" (to speak).
 *   firstSentence: What the user is asked to say aloud in step 4.
 *                  For Romanian: "Eu vorbesc." (I speak.).
 *
 * `text` fields hold the target-language string. `en` fields are i18n keys
 * (and English fallbacks) used the same way as elsewhere in the module.
 */
export interface OnboardingData {
  cognates: ReadonlyArray<{ text: string; en: string }>;
  firstVerb: {
    infinitive: string;
    /** i18n key — e.g. "to speak" */
    meaning: string;
    forms: ReadonlyArray<{
      /** i18n key for the tense label — "Future", "Present", "Past" */
      tenseLabel: string;
      text: string;
      en: string;
    }>;
  };
  firstSentence: { text: string; en: string };
}

/**
 * A complete learning-language module. Everything the engine needs to
 * present a language lives here.
 */
/** Romanian content for the landing-page CinematicMatrix.
 *  Each entry has `text` (the speakable string) and `weight` (visual size:
 *  3 = largest/central, 2 = medium, 1 = smallest).
 *  Using `text` (rather than a tuple) makes the audio extractor catch it
 *  automatically via its TYPED_FIELDS pattern. */
export interface CinematicEntry {
  text: string;
  weight: 1 | 2 | 3;
}
export interface CinematicData {
  verbs: ReadonlyArray<CinematicEntry>;
  vocab: ReadonlyArray<CinematicEntry>;
}

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

  /**
   * Landing-page locale resources, keyed by *interface* language code.
   * Contains two kinds of keys:
   *   - landing_*    : interface copy specific to this language (e.g. landing_loss_title
   *                    says "…never learn Romanian" not "…never learn a language").
   *   - landing_tl_* : target-language strings shown on the landing page (demo matrix
   *                    cells, speak phrase). These are the same in every UI language
   *                    (the Romanian sentence is Romanian regardless of UI lang), but
   *                    the translation gloss (landing_tl_speak_translation) is localised.
   *
   * The audio generator scans landing.*.json files for landing_tl_* keys and
   * generates pronunciation audio for them separately from the lesson audio.
   *
   * Merged into the live bundle by <TargetLanguageProvider> on language switch,
   * exactly like `locales` above.
   */
  landingLocales: Record<string, Record<string, string>>;

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

  /** First-contact flow content. The engine reads this to render the 5-step
   *  onboarding once per (browser × language). */
  onboarding: OnboardingData;

  /** Landing-page cinematic showcase content (verb cloud + vocab cloud). */
  cinematic: CinematicData;
}

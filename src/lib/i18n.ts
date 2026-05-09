import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import uk from "../locales/uk.json";

const STORAGE_KEY = "ro-study-lang";

/**
 * AVAILABLE_LANGUAGES — the list shown in the sidebar dropdown for the
 * **interface** language (English / Українська / …).
 *
 * NOTE: This is the language the UI is *displayed in*, NOT the language
 * the user is *learning*. The learning language is managed by
 * `<TargetLanguageProvider>` and is independent.
 *
 * To add a new interface language:
 *   1. Create `src/locales/<code>.json` (copy `en.json` and translate)
 *   2. Import it at the top of this file
 *   3. Add it to the `resources` block below
 *   4. Add an entry here
 *
 * Each learning-language module (under `src/languages/<code>/locales/`)
 * also ships its own translations for the same set of UI codes — those
 * get merged into this bundle at runtime by `<TargetLanguageProvider>`.
 */
export const AVAILABLE_LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "uk", label: "Українська" },
];

const stored = (() => {
  if (typeof window === "undefined") return undefined;
  try {
    return localStorage.getItem(STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
})();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    uk: { translation: uk },
  },
  lng: stored && AVAILABLE_LANGUAGES.some((l) => l.code === stored) ? stored : "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }, // React already escapes
  // Disable the dot/colon parsing of keys so we can use English text containing
  // punctuation as a key (for inline phrase glosses) without it being split.
  keySeparator: false,
  nsSeparator: false,
  // When a key has no translation in the active language, return the key
  // itself — which IS the English source text for inline phrase glosses.
  // Hierarchical UI keys (e.g. "hero_title") that are missing show as the
  // raw key, which is intentional during development.
  returnEmptyString: false,
  react: {
    // Synchronous resource loading + simple components → no Suspense needed.
    useSuspense: false,
  },
});

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
});

export default i18n;

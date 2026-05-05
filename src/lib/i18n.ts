import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import it from "../locales/it.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";
import de from "../locales/de.json";
import hu from "../locales/hu.json";
import uk from "../locales/uk.json";
import ru from "../locales/ru.json";
import pl from "../locales/pl.json";

const STORAGE_KEY = "ro-study-lang";

/**
 * AVAILABLE_LANGUAGES — the list shown in the sidebar dropdown.
 *
 * To add a new language:
 *   1. Create `src/locales/<code>.json` (copy `en.json` and translate)
 *   2. Import it at the top of this file
 *   3. Add it to the `resources` block below
 *   4. Add an entry here
 */
export const AVAILABLE_LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "it", label: "Italiano" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "hu", label: "Magyar" },
  { code: "uk", label: "Українська" },
  { code: "ru", label: "Русский" },
  { code: "pl", label: "Polski" },
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
    it: { translation: it },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de },
    hu: { translation: hu },
    uk: { translation: uk },
    ru: { translation: ru },
    pl: { translation: pl },
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

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import i18n from "../lib/i18n";
import { LANGUAGES, getLanguageByCode } from "../languages";
import { setActiveLanguage } from "../lib/active-language";
import {
  readCodeFromPath, navigateToCode, navigateToHome, subscribeToPath,
} from "../lib/url-routing";
import type { LanguageModule } from "../languages/types";

const STORAGE_KEY = "ro-study-learning-lang";

interface TargetLanguageContextValue {
  /** The fully-loaded module for the currently active learning language.
   *  When `isUnchosen` is true, this is the fallback module (LANGUAGES[0])
   *  for type safety; consumers should branch on `isUnchosen` instead. */
  module: LanguageModule;
  /** ISO-ish code of the active language, e.g. "ro". Falls back to
   *  LANGUAGES[0].code when the user is at the home page. */
  code: string;
  /** Switch which language the user is learning. Persists to URL + localStorage. */
  setCode: (code: string) => void;
  /** Navigate to the language-picker home page ("/"). The active code is
   *  cleared in state, but localStorage retains `lastPickedCode` so the
   *  picker can highlight the user's previous selection. */
  goHome: () => void;
  /** Every registered learning-language module. */
  available: typeof LANGUAGES;
  /** True iff the URL has no language code — show the picker. */
  isUnchosen: boolean;
  /** The last language the user chose, even if they're now at home. Used
   *  by the picker to mark a card as "Current". `null` for first-time visitors. */
  lastPickedCode: string | null;
}

/**
 * Read the active code from the URL only — localStorage no longer
 * auto-redirects. The home page ("/") is a real page; users who arrive
 * there see the picker, regardless of any prior selection.
 *
 * Returns null when the URL has no code (or an unknown one).
 */
function readInitialCode(): string | null {
  const fromUrl = readCodeFromPath();
  if (fromUrl && LANGUAGES.some((l) => l.code === fromUrl)) {
    return fromUrl;
  }
  return null;
}

/**
 * Read the previously-picked code from localStorage, if any. This is purely
 * informational — the picker uses it to highlight the user's previous choice
 * with a "Current" badge. Navigation is driven entirely by the URL.
 */
function readLastPicked(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && LANGUAGES.some((l) => l.code === v)) return v;
  } catch {
    /* private mode / quota — degrade silently */
  }
  return null;
}

/**
 * Merge a language module's locale strings into the live i18n bundle.
 * `addResourceBundle(deep:true, overwrite:true)` deep-merges and replaces
 * existing keys — exactly what we want when swapping modules.
 */
function applyLocales(module: LanguageModule) {
  for (const [lng, resources] of Object.entries(module.locales)) {
    i18n.addResourceBundle(lng, "translation", resources, true, true);
  }
}

const TargetLanguageContext = createContext<TargetLanguageContextValue | null>(null);

export function TargetLanguageProvider({ children }: { children: ReactNode }) {
  // Initial active code comes only from the URL.
  const [code, setCodeState] = useState<string | null>(() => readInitialCode());
  const [lastPickedCode, setLastPickedCode] = useState<string | null>(() => readLastPicked());

  // Persist code to localStorage whenever the user picks one. This drives
  // `lastPickedCode`, used by the picker for the "Current" highlight.
  useEffect(() => {
    if (code === null) return;
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch { /* ignore */ }
    setLastPickedCode(code);
  }, [code]);

  // Listen for back/forward navigation — re-read the URL and update state.
  // Critically, this also handles `/foo → /` (popping back to home), which
  // sets the active code to null and re-renders the picker.
  useEffect(() => {
    return subscribeToPath(() => {
      const fromUrl = readCodeFromPath();
      if (fromUrl) {
        if (LANGUAGES.some((l) => l.code === fromUrl) && fromUrl !== code) {
          setCodeState(fromUrl);
        }
      } else if (code !== null) {
        // Navigated to "/" — go to unchosen / picker state.
        setCodeState(null);
      }
    });
  }, [code]);

  // Resolve the active module. When unchosen, fall back to LANGUAGES[0] only
  // for type purposes — the picker renders instead of the lessons anyway.
  const module = useMemo(
    () => getLanguageByCode(code ?? LANGUAGES[0].code),
    [code]
  );
  const lastApplied = useRef<LanguageModule | null>(null);

  // Apply the module synchronously DURING render so child components — which
  // call `t()`, `<RO />`, `lookupAudio()`, etc. — see the right language on
  // their very first paint. The ref guard makes the side-effect idempotent
  // across re-renders (StrictMode-safe).
  if (lastApplied.current !== module) {
    setActiveLanguage(module);
    applyLocales(module);
    lastApplied.current = module;
  }

  // Belt-and-braces: re-sync after commit. Cheap and ensures a hot-reload
  // of i18n resources doesn't desync from the active module.
  useEffect(() => {
    setActiveLanguage(module);
    applyLocales(module);
  }, [module]);

  const setCode = useCallback((c: string) => {
    if (!LANGUAGES.some((l) => l.code === c)) return;
    setCodeState(c);
    navigateToCode(c);
    // localStorage write happens in the effect above — single source of truth.
  }, []);

  const goHome = useCallback(() => {
    setCodeState(null);
    navigateToHome();
  }, []);

  const value = useMemo(
    () => ({
      module,
      code: code ?? module.code,
      setCode,
      goHome,
      available: LANGUAGES,
      isUnchosen: code === null,
      lastPickedCode,
    }),
    [module, code, setCode, goHome, lastPickedCode]
  );

  return (
    <TargetLanguageContext.Provider value={value}>
      {children}
    </TargetLanguageContext.Provider>
  );
}

export function useTargetLanguage() {
  const ctx = useContext(TargetLanguageContext);
  if (!ctx) {
    throw new Error("useTargetLanguage must be used inside <TargetLanguageProvider>");
  }
  return ctx;
}

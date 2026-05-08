import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import i18n from "../lib/i18n";
import { LANGUAGES, getLanguageByCode } from "../languages";
import { setActiveLanguage } from "../lib/active-language";
import type { LanguageModule } from "../languages/types";

const STORAGE_KEY = "ro-study-learning-lang";

interface TargetLanguageContextValue {
  /** The fully-loaded module for the currently active learning language. */
  module: LanguageModule;
  /** ISO-ish code, e.g. "ro". */
  code: string;
  /** Switch which language the user is learning. Persists to localStorage. */
  setCode: (code: string) => void;
  /** Every registered learning-language module. */
  available: typeof LANGUAGES;
}

function readInitial(): string {
  if (typeof window === "undefined") return LANGUAGES[0].code;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGUAGES.some((l) => l.code === stored)) return stored;
  } catch {
    /* ignore */
  }
  return LANGUAGES[0].code;
}

/**
 * Merge a language module's locale strings into the live i18n bundle.
 * `addResourceBundle(deep:true, overwrite:true)` deep-merges and replaces
 * existing keys, which is exactly what we want when swapping modules.
 */
function applyLocales(module: LanguageModule) {
  for (const [lng, resources] of Object.entries(module.locales)) {
    i18n.addResourceBundle(lng, "translation", resources, true, true);
  }
}

const TargetLanguageContext = createContext<TargetLanguageContextValue | null>(null);

export function TargetLanguageProvider({ children }: { children: ReactNode }) {
  const [code, setCodeState] = useState<string>(readInitial);
  const module = useMemo(() => getLanguageByCode(code), [code]);
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
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ module, code, setCode, available: LANGUAGES }),
    [module, code, setCode]
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

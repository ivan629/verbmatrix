import {
  createContext, useContext, useState, useCallback, useMemo,
  type ReactNode,
} from "react";

const STORAGE_KEY = "vm:target-lang";

interface LanguageContextValue {
  /** ISO 639-1 code, e.g. "en", "es". Default "en". */
  lang: string;
  /** Set the active target language. Persists to localStorage. */
  setLang: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "en";
    } catch {
      return "en";
    }
  });

  const setLang = useCallback((l: string) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

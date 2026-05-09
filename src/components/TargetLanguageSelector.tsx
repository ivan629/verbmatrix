import { useTranslation } from "react-i18next";
import { useTargetLanguage } from "../context/TargetLanguage";

/**
 * Picker for which language the user is *learning*.
 *
 * Hidden by default — only one language module is registered today (Romanian).
 * The moment a second module appears in `src/languages/index.ts`, this
 * dropdown auto-renders next to the UI-language selector. No code changes
 * needed elsewhere; the registry drives everything.
 */
export function TargetLanguageSelector() {
  const { t } = useTranslation();
  const { code, setCode, available } = useTargetLanguage();

  if (available.length <= 1) return null;

  return (
    <div>
      <label
        htmlFor="ro-learning-lang"
        className="block font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--ink-4)] mb-2"
      >
        {t("target_language_selector_label")}
      </label>
      <div className="relative">
        <select
          id="ro-learning-lang"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-label={t("target_language_selector_aria")}
          className="
            appearance-none w-full bg-[var(--surface)] hover:bg-[var(--surface-2)]
            text-[var(--ink-2)] text-[12.5px] font-medium
            border border-[var(--border)] rounded-md
            py-2 pl-3 pr-8 cursor-pointer transition-colors
            focus:outline-none focus:border-[var(--accent)]
          "
        >
          {available.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--ink-3)]"
        >
          <path
            d="M2 3.5l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

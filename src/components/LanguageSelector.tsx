import { useTranslation } from "react-i18next";
import { AVAILABLE_LANGUAGES } from "../lib/i18n";

export function LanguageSelector() {
  const { i18n, t } = useTranslation();

  // If only one language is available, hide the selector entirely — there's
  // nothing to choose. The user will see the dropdown reappear automatically
  // as soon as they add a second language to AVAILABLE_LANGUAGES.
  if (AVAILABLE_LANGUAGES.length <= 1) return null;

  return (
    <div>
      <label
        htmlFor="ro-target-lang"
        className="block font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--ink-4)] mb-2"
      >
        {t("language_selector_label")}
      </label>
      <div className="relative">
        <select
          id="ro-target-lang"
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          aria-label={t("language_selector_label")}
          className="
            appearance-none w-full bg-[var(--surface)] hover:bg-[var(--surface-2)]
            text-[var(--ink-2)] text-[12.5px] font-medium
            border border-[var(--border)] rounded-md
            py-2 pl-3 pr-8 cursor-pointer transition-colors
            focus:outline-none focus:border-[var(--accent)]
          "
        >
          {AVAILABLE_LANGUAGES.map((l) => (
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

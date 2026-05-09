import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AVAILABLE_LANGUAGES } from "../lib/i18n";

/**
 * Floating interface-language toggle, fixed in the top-right corner of
 * the viewport. Persistent across home and lesson pages.
 *
 * Custom-built (not a native <select>) for typographic consistency with
 * the rest of the app: monospace labels, gold accent on the active item,
 * subtle drop shadow, animated chevron. Closes on outside click + Esc.
 *
 * Hidden during onboarding (a focused flow that has its own header), and
 * auto-hidden when only one interface language is registered.
 *
 * Note: this is the *interface* language (UI strings) — independent of
 * the target *learning* language, which is switched via the home page.
 */
export function FloatingUILanguage() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click + Esc. The mousedown check stays inside the
  // container check, so clicking the trigger or a menu item never
  // self-closes via this listener — both are handled by their onClick.
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Auto-hide when only one language exists.
  if (AVAILABLE_LANGUAGES.length <= 1) return null;

  // Match by exact code, with a fallback that handles regional variants
  // like "en-US" → "en". Falls back to the first registered language if
  // i18n.language doesn't match anything (defensive — shouldn't normally fire).
  const activeCode = i18n.resolvedLanguage ?? i18n.language;
  const current =
    AVAILABLE_LANGUAGES.find(
      (l) => l.code === activeCode ||
             activeCode.toLowerCase().startsWith(l.code.toLowerCase() + "-")
    ) ?? AVAILABLE_LANGUAGES[0];

  function handleSelect(code: string) {
    i18n.changeLanguage(code);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="fixed top-4 right-4 z-50 no-print">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("language_selector_label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="
          group cursor-pointer
          bg-[var(--surface)] hover:bg-[var(--surface-2)]
          text-[var(--ink-2)] hover:text-[var(--ink)]
          text-[12px] font-mono
          border border-[var(--border)] hover:border-[var(--ink-3)]
          rounded-md
          py-1.5 pl-3 pr-2.5
          transition-colors
          focus:outline-none focus-visible:border-[var(--ink-3)]
          shadow-[var(--shadow-1)]
          flex items-center gap-2.5
        "
      >
        <span>{current.label}</span>
        <svg
          aria-hidden="true"
          width="9"
          height="9"
          viewBox="0 0 10 10"
          className={`text-[var(--ink-4)] transition-transform duration-200 ease-out ${
            open ? "rotate-180" : ""
          }`}
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
      </button>

      {/* Menu */}
      {open && (
        <ul
          role="listbox"
          aria-label={t("language_selector_label")}
          className="
            absolute top-[calc(100%+6px)] right-0
            min-w-[180px]
            bg-[var(--surface)]
            border border-[var(--border)]
            rounded-md
            shadow-[var(--shadow-2)]
            py-1
            overflow-hidden
          "
        >
          {AVAILABLE_LANGUAGES.map((lng) => {
            const isActive = lng.code === current.code;
            return (
              <li key={lng.code}>
                <button
                  type="button"
                  onClick={() => handleSelect(lng.code)}
                  role="option"
                  aria-selected={isActive}
                  className={`
                    w-full text-left
                    text-[12px] font-mono
                    px-3.5 py-2
                    flex items-center justify-between gap-3
                    transition-colors
                    focus:outline-none
                    ${isActive
                      ? "text-[var(--gold)] bg-[var(--gold-soft)]"
                      : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] focus-visible:bg-[var(--surface-2)]"
                    }
                  `}
                >
                  <span>{lng.label}</span>
                  {isActive && (
                    <span aria-hidden="true" className="text-[8px] leading-none">●</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

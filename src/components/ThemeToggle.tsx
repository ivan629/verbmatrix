import { useTranslation } from "react-i18next";
import { useTheme } from "../context/Theme";

/**
 * Minimal single-button theme toggle. Shows the icon of the OPPOSITE
 * state — the convention is "click this to go to that mode" (sun in
 * dark mode, moon in light mode).
 *
 * The Theme context still supports a "system" preference internally;
 * this toggle simply commits the user to an explicit choice on click.
 * (To return to system tracking, clear localStorage.)
 */
export function ThemeToggle() {
  const { t } = useTranslation();
  const { resolved, setPreference } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";
  const label = t("theme_switch_to_label", { mode: t(next === "dark" ? "theme_dark" : "theme_light") });

  return (
    <button
      type="button"
      onClick={() => setPreference(next)}
      aria-label={label}
      title={label}
      className="
        w-9 h-9 rounded-md
        flex items-center justify-center
        text-[var(--ink-3)] hover:text-[var(--ink)]
        hover:bg-[var(--surface-2)]
        transition-colors
      "
    >
      {resolved === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

// ─── Icons ──────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="7.5" cy="7.5" r="2.6" />
      <path d="M7.5 1.2v1.6M7.5 12.2v1.6M1.2 7.5h1.6M12.2 7.5h1.6M3 3l1.1 1.1M10.9 10.9 12 12M3 12l1.1-1.1M10.9 4.1 12 3" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.5 9A4.5 4.5 0 1 1 6 2.5a3.6 3.6 0 0 0 6.5 6.5z" />
    </svg>
  );
}

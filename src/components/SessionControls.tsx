/**
 * SessionControls — vertical icon cluster, bottom-right.
 *
 * Three tiny icon buttons stacked vertically:
 *   ▶    Slow speed
 *   ▶▶   Fast (normal) speed
 *   🌐   Language picker (opens dropdown to the left)
 *
 * Icon-only by design — no text labels in the cluster itself. Tooltips
 * (native `title`) and aria-labels handle accessibility and discovery.
 *
 * Keyboard: 1 = slow, 2 = fast (normal). Skipped while typing.
 * Shift+click any <RO> still triggers one-shot slow — handled in RO.tsx.
 */

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AVAILABLE_LANGUAGES } from "../lib/i18n";
import { usePlayback, type SpeedKey } from "../context/Playback";
import { trackEvent } from "../config";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}

const BTN_BASE =
  "flex items-center justify-center w-9 h-9 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold)]";

export function SessionControls() {
  return (
    <div className="fixed bottom-3 right-3 z-50 flex flex-col gap-1 bg-[var(--surface)]/85 border border-[var(--border)] rounded-lg backdrop-blur-sm shadow-sm p-1 select-none">
      <SpeedButton tier="slow" />
      <SpeedButton tier="normal" />
      <LanguageButton />
    </div>
  );
}

// ─── Speed (one button per tier) ──────────────────────────────────────────

function SpeedButton({ tier }: { tier: SpeedKey }) {
  const { t } = useTranslation();
  const { tier: active, setTier } = usePlayback();

  useEffect(() => {
    if (tier !== "slow") return; // single global keyboard listener; mount on the first instance
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (e.key === "1") { e.preventDefault(); setTier("slow"); }
      else if (e.key === "2") { e.preventDefault(); setTier("normal"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [tier, setTier]);

  const isActive = active === tier;
  const label = tier === "slow" ? t("playback_speed_slow") : t("playback_speed_normal");

  return (
    <button
      type="button"
      onClick={() => setTier(tier)}
      aria-pressed={isActive}
      aria-label={label}
      title={label}
      className={
        BTN_BASE + " " +
        (isActive
          ? "bg-[var(--gold)] text-[var(--bg)]"
          : "text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]")
      }
    >
      {tier === "slow" ? <SlowIcon /> : <FastIcon />}
    </button>
  );
}

// ─── Language (icon button + dropdown opening leftward) ───────────────────

function LanguageButton() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Single-language deployments don't need this control at all.
  if (AVAILABLE_LANGUAGES.length <= 1) return null;

  const activeCode = i18n.resolvedLanguage ?? i18n.language;
  const current =
    AVAILABLE_LANGUAGES.find(
      (l) => l.code === activeCode || activeCode.toLowerCase().startsWith(l.code.toLowerCase() + "-")
    ) ?? AVAILABLE_LANGUAGES[0]!;

  const handleSelect = (code: string) => {
    trackEvent("ui-language-switch", { from: i18n.language, to: code, source: "session-controls" });
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("language_selector_label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={current.label}
        className={
          BTN_BASE + " " +
          (open
            ? "text-[var(--ink)] bg-[var(--surface-2)]"
            : "text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]")
        }
      >
        <GlobeIcon />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t("language_selector_label")}
          className="absolute right-[calc(100%+6px)] bottom-0 min-w-[140px] bg-[var(--surface)] border border-[var(--border)] rounded-md shadow-[var(--shadow-2)] py-1 overflow-hidden"
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
                  className={
                    "w-full text-left text-[11px] font-mono px-3 py-2 flex items-center justify-between gap-3 transition-colors " +
                    (isActive
                      ? "text-[var(--gold)] bg-[var(--gold-soft)]"
                      : "text-[var(--ink-2)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]")
                  }
                >
                  <span>{lng.label}</span>
                  {isActive && <span aria-hidden="true" className="text-[8px] leading-none">●</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Inline SVG icons (monochrome, currentColor) ──────────────────────────

function SlowIcon() {
  // Single play triangle — universal "play one step" cue.
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4.5 3 L12.5 8 L4.5 13 Z" />
    </svg>
  );
}

function FastIcon() {
  // Double play triangle — universal "fast-forward" cue.
  return (
    <svg width="15" height="13" viewBox="0 0 20 16" fill="currentColor" aria-hidden="true">
      <path d="M2 3 L9 8 L2 13 Z" />
      <path d="M10 3 L17 8 L10 13 Z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M1.75 8 H14.25" />
      <path d="M8 1.75 C 10.4 4 11.5 6 11.5 8 S 10.4 12 8 14.25" />
      <path d="M8 1.75 C 5.6 4 4.5 6 4.5 8 S 5.6 12 8 14.25" />
    </svg>
  );
}

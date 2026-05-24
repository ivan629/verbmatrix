/**
 * SpeedPill — minimal audio speed toggle.
 *
 * Two buttons (Normal / Slow) in a tiny pill, bottom-right. No icons, no
 * "SPEED" label, no hint popup. The active tier sits in foreground ink;
 * the inactive one fades back. Keyboard: 1 = Normal, 2 = Slow.
 *
 * Shift+click any <RO> word still plays it at Slow regardless of the
 * current tier — that lives in RO.tsx via Playback.requestSlowOverride.
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SPEEDS, usePlayback, type SpeedKey } from "../context/Playback";

const TIER_ORDER: readonly SpeedKey[] = ["normal", "slow"] as const;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
}

export function SpeedPill() {
  const { t } = useTranslation();
  const { tier, setTier } = usePlayback();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      if (e.key === "1") { e.preventDefault(); setTier("normal"); }
      else if (e.key === "2") { e.preventDefault(); setTier("slow"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setTier]);

  return (
    <div
      role="radiogroup"
      aria-label={t("playback_speed_aria")}
      className="fixed bottom-3 right-3 z-50 flex items-center bg-[var(--surface)]/85 border border-[var(--border)] rounded-full backdrop-blur-sm shadow-sm select-none text-[10.5px] font-mono uppercase tracking-[0.08em]"
    >
      {TIER_ORDER.map((key) => {
        const isActive = tier === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTier(key)}
            className={
              "py-1 px-2.5 rounded-full transition-colors " +
              (isActive
                ? "text-[var(--ink)]"
                : "text-[var(--ink-4)] hover:text-[var(--ink-2)]")
            }
          >
            {t(SPEEDS[key].labelKey)}
          </button>
        );
      })}
    </div>
  );
}

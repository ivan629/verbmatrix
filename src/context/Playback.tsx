/**
 * Playback context — controls audio speed across every TTS source.
 *
 * Three named tiers instead of a continuous slider: the choice maps to how
 * learners actually think ("slow to study, normal to listen, fast to
 * challenge") and removes decision fatigue. The 0.75 / 1.0 / 1.15 values
 * are the Goldilocks band — slow enough to track each syllable, fast enough
 * to feel native, never so extreme that the synthesised voice distorts.
 *
 * Persists to localStorage so the choice survives reloads.
 *
 * The TTS engine (lib/tts.ts) reads via `getPlaybackSettings()` — a plain
 * function rather than a hook — because it's called inside a non-React
 * audio queue.  `consumeSlowOverride()` lets components ask for a one-shot
 * Slow play (e.g. shift+click on a word) without changing the global tier.
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from "react";

export const SPEEDS = {
  slow:   { value: 0.75, labelKey: "playback_speed_slow",   icon: "◐" },
  normal: { value: 1.00, labelKey: "playback_speed_normal", icon: "●" },
} as const satisfies Record<string, { value: number; labelKey: string; icon: string }>;

export type SpeedKey = keyof typeof SPEEDS;

const STORAGE_KEY = "verbmatrix.playbackSpeed";
const DEFAULT_TIER: SpeedKey = "normal";
const REPEAT_COUNT = 1;

export interface PlaybackSettings {
  /** Multiplier passed to audio.playbackRate / SpeechSynthesisUtterance.rate */
  speed: number;
  /** How many times to repeat a single utterance per click */
  repeat: number;
}

interface PlaybackContextValue {
  tier: SpeedKey;
  setTier: (tier: SpeedKey) => void;
  /** Plays the next utterance at Slow regardless of current tier. Consumed once. */
  requestSlowOverride: () => void;
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

// ─── Module-level mirror — read by the non-React TTS engine ────────────────

let activeTier: SpeedKey = DEFAULT_TIER;
let slowOverridePending = false;

export function getPlaybackSettings(): PlaybackSettings {
  if (slowOverridePending) {
    slowOverridePending = false;
    return { speed: SPEEDS.slow.value, repeat: REPEAT_COUNT };
  }
  return { speed: SPEEDS[activeTier].value, repeat: REPEAT_COUNT };
}

// ─── Provider ──────────────────────────────────────────────────────────────

function readStoredTier(): SpeedKey {
  if (typeof window === "undefined") return DEFAULT_TIER;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "slow" || stored === "normal") return stored;
  } catch {
    // localStorage may be blocked (private mode, embedded). Fall through to default.
  }
  return DEFAULT_TIER;
}

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<SpeedKey>(readStoredTier);

  // Keep the module-level mirror in sync so getPlaybackSettings() sees updates.
  useEffect(() => { activeTier = tier; }, [tier]);

  const setTier = useCallback((next: SpeedKey) => {
    setTierState(next);
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
  }, []);

  const requestSlowOverride = useCallback(() => {
    slowOverridePending = true;
  }, []);

  const value = useMemo<PlaybackContextValue>(
    () => ({ tier, setTier, requestSlowOverride }),
    [tier, setTier, requestSlowOverride]
  );

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlayback(): PlaybackContextValue {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlayback must be used inside <PlaybackProvider>");
  return ctx;
}

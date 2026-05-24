/**
 * Playback settings — fixed at normal speed.
 *
 * Audio plays at native 1.0× and repeats once per click. There is no UI
 * for changing speed; the previous slow/normal toggle was removed because
 * (a) it added a floating widget that competed with the lesson chrome, and
 * (b) ElevenLabs pre-generated MP3s don't gain useful clarity from rate
 * shifting in HTML5 Audio — the artefact-free way to offer "slow" is to
 * generate a separate slow MP3 per phrase, which we are not doing.
 *
 * This file remains so `lib/tts.ts` keeps its single source-of-truth import
 * for playback knobs. If a future tier system is added (e.g. per-language
 * slow MP3s), it lives here.
 *
 * ─── Backwards-compat exports ─────────────────────────────────────────
 * The names below (SPEEDS / SpeedKey / usePlayback / tier / setTier) are
 * kept ONLY so any old SessionControls.tsx / SpeedPill.tsx files in the
 * codebase still compile until they are deleted. They are not used
 * anywhere actively. Speed is permanently "normal"; setters are no-ops.
 *
 * RECOMMENDATION: delete the orphan files instead of carrying this dead
 * baggage forever:
 *
 *   rm src/components/SessionControls.tsx
 *   rm src/components/SpeedPill.tsx
 *
 * Once deleted, everything below `getPlaybackSettings()` can also go.
 */

import { createContext, useContext, type ReactNode } from "react";

export interface PlaybackSettings {
  /** Multiplier passed to audio.playbackRate / SpeechSynthesisUtterance.rate */
  speed: number;
  /** How many times to repeat a single click */
  repeat: number;
}

const REPEAT_COUNT = 1;

export function getPlaybackSettings(): PlaybackSettings {
  return { speed: 1.0, repeat: REPEAT_COUNT };
}

// ─── Legacy speed-tier exports (kept for compilation only) ─────────────

export const SPEEDS = {
  slow:   { rate: 0.7, label: "Slow",   labelKey: "speed_slow"   },
  normal: { rate: 1.0, label: "Normal", labelKey: "speed_normal" },
} as const;

export type SpeedKey = keyof typeof SPEEDS;

interface PlaybackContextValue {
  /** Current speed key ("slow" | "normal"). Always "normal" — speed UI removed. */
  speed: SpeedKey;
  /** No-op setter — speed is fixed. */
  setSpeed: (s: SpeedKey) => void;
  /** Alias for `speed` (legacy name used by old SessionControls/SpeedPill). */
  tier: SpeedKey;
  /** Alias for `setSpeed` (legacy name). */
  setTier: (s: SpeedKey) => void;
}

const noop = () => {};

const PlaybackContext = createContext<PlaybackContextValue>({
  speed:   "normal",
  setSpeed: noop,
  tier:    "normal",
  setTier:  noop,
});

/**
 * No-op provider — kept for backwards-compatibility with App.tsx. The
 * speed state is fixed at "normal"; setSpeed/setTier are no-ops.
 */
export function PlaybackProvider({ children }: { children: ReactNode }) {
  return (
    <PlaybackContext.Provider value={{
      speed:   "normal",
      setSpeed: noop,
      tier:    "normal",
      setTier:  noop,
    }}>
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  return useContext(PlaybackContext);
}

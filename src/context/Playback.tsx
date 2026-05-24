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
 */

import type { ReactNode } from "react";

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

/**
 * No-op provider — kept for backwards-compatibility with App.tsx, can be
 * deleted in a future cleanup once App stops wrapping with it.
 */
export function PlaybackProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

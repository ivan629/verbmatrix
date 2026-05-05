/**
 * Playback settings — locked to the values that work best for language study.
 * No UI controls, no localStorage, no React context. The TTS player reads
 * from `getPlaybackSettings()` at call time.
 *
 * Why these values:
 *   speed = 0.85 — slower than native (so beginners can track each word)
 *                  but not so slow it sounds robotic and trains bad pronunciation.
 *   repeat = 1   — click the word again to hear it again. More natural than
 *                  globally configuring "always repeat 3×" and then forgetting why.
 */

export interface PlaybackSettings {
  speed: number;
  repeat: number;
}

const SETTINGS: PlaybackSettings = { speed: 0.85, repeat: 1 };

export function getPlaybackSettings(): PlaybackSettings {
  return SETTINGS;
}

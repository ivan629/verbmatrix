import { type ReactNode } from "react";

/**
 * Playback settings.
 * Currently fixed at speed = 1×, repeat = 1× (single click → single play at
 * normal speed). The architecture is left in place so the controls can be
 * re-added later if needed — `getPlaybackSettings()` in tts.ts still reads
 * from here.
 */
export interface PlaybackSettings {
  speed: number;
  repeat: number;
}

const FIXED: PlaybackSettings = { speed: 1, repeat: 1 };

// Clean up any persisted values from earlier versions so old localStorage
// entries don't quietly carry over into the new behavior.
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("ro-study-playback");
  } catch {
    /* ignore */
  }
}

export function getPlaybackSettings(): PlaybackSettings {
  return FIXED;
}

export function PlaybackProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

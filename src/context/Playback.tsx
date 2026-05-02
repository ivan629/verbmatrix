import {
  createContext, useContext, useCallback, useEffect, useMemo, useState,
  type ReactNode,
} from "react";

/** Listen-and-repeat playback settings, persisted in localStorage. */
export interface PlaybackSettings {
  /** Audio playback rate. 1 = normal, 0.85 = slower, 0.7 = clearly slow. */
  speed: number;
  /** How many times each click plays the audio. 1 = once, 2 = twice, 3 = thrice. */
  repeat: number;
}

interface PlaybackContextValue extends PlaybackSettings {
  setSpeed: (s: number) => void;
  setRepeat: (r: number) => void;
}

const DEFAULT: PlaybackSettings = { speed: 1, repeat: 1 };
const STORAGE_KEY = "ro-study-playback";

function load(): PlaybackSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw);
    return {
      speed: typeof parsed.speed === "number" ? parsed.speed : DEFAULT.speed,
      repeat: typeof parsed.repeat === "number" ? parsed.repeat : DEFAULT.repeat,
    };
  } catch {
    return DEFAULT;
  }
}
function persist(s: PlaybackSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

// Module-level ref so non-React code (the TTS hook's playback callback) can
// read the latest settings without re-subscribing on every render.
const ref: { current: PlaybackSettings } = {
  current: typeof window !== "undefined" ? load() : DEFAULT,
};

/** Read the latest settings from anywhere (used by the TTS player). */
export function getPlaybackSettings(): PlaybackSettings {
  return ref.current;
}

const PlaybackContext = createContext<PlaybackContextValue>({
  ...DEFAULT,
  setSpeed: () => {},
  setRepeat: () => {},
});

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PlaybackSettings>(() => load());

  // Keep the module-level ref in sync with the React state.
  useEffect(() => {
    ref.current = settings;
  }, [settings]);

  const setSpeed = useCallback((speed: number) => {
    setSettings((prev) => {
      const next = { ...prev, speed };
      persist(next);
      return next;
    });
  }, []);

  const setRepeat = useCallback((repeat: number) => {
    setSettings((prev) => {
      const next = { ...prev, repeat };
      persist(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ ...settings, setSpeed, setRepeat }),
    [settings, setSpeed, setRepeat]
  );

  return (
    <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>
  );
}

export function usePlayback() {
  return useContext(PlaybackContext);
}

import { useCallback, useEffect, useRef } from "react";
import { isAzureConfigured, fetchAzureSpeech } from "./tts-azure";
import { lookupAudio } from "./audio-cache";
import { tryGetActiveLanguage } from "./active-language";
import { getPlaybackSettings } from "../context/Playback";

/**
 * Speech synthesis with three quality tiers:
 *
 *   1. **Pre-generated MP3** (best — typically ElevenLabs Multilingual v2,
 *      generated once by `npm run generate-audio` and shipped as static files)
 *   2. **Azure Neural** (very good — runtime API call, configured via .env)
 *   3. **Browser SpeechSynthesis** (universal fallback)
 *
 * Honours the global Playback settings (speed + repeat) on every tier.
 *
 * The browser-fallback BCP-47 tag (`ro-RO`, `es-ES`, …) comes from the active
 * language module so this works the same across every learning language.
 *
 * The calling component gets the same `speak(text, el)` callback regardless
 * of which tier is active.
 */

type SpeakFn = (text: string, element?: HTMLElement | null) => void;

const REPEAT_GAP_MS = 1100; // pause between repetitions for listen-and-repeat

function sleep(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}

let currentAudio: HTMLAudioElement | null = null;
let cancelToken = 0;

function stopEverything() {
  cancelToken++;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/** Play an MP3 url once at the given rate. Resolves when finished or errored. */
function playMp3Once(url: string, rate: number, token: number): Promise<void> {
  return new Promise((resolve) => {
    if (token !== cancelToken) return resolve();
    const audio = new Audio(url);
    audio.playbackRate = rate;
    // Preserve pitch when slowed/sped up so the voice stays natural-sounding
    // rather than going deeper/higher. Defaults to true in modern browsers
    // but we set it explicitly for guaranteed consistent behavior.
    audio.preservesPitch = true;
    currentAudio = audio;
    const done = () => {
      if (currentAudio === audio) currentAudio = null;
      resolve();
    };
    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(done);
  });
}

/** Play via browser SpeechSynthesis once. Resolves when done. */
function playBrowserOnce(text: string, rate: number, token: number): Promise<void> {
  return new Promise((resolve) => {
    if (token !== cancelToken) return resolve();
    if (typeof window === "undefined" || !window.speechSynthesis) return resolve();
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);

    // BCP-47 tag of the current learning language (e.g. ro-RO).
    // Falls back to ro-RO if the provider hasn't mounted yet (shouldn't
    // happen in practice — the provider wraps the entire app).
    const speechLang = tryGetActiveLanguage()?.speechLang ?? "ro-RO";
    u.lang = speechLang;
    u.rate = Math.max(0.4, rate * 0.95); // browsers vary; nudge slightly slower
    u.pitch = 1;
    const voices = synth.getVoices();
    const langPrefix = speechLang.split("-")[0];
    const matchVoice =
      voices.find((v) => v.lang === speechLang) ??
      voices.find((v) => v.lang.startsWith(langPrefix));
    if (matchVoice) u.voice = matchVoice;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    synth.speak(u);
  });
}

export function useTTS(): SpeakFn {
  const activeRef = useRef<HTMLElement | null>(null);

  // Trigger voice list load (Chrome populates async).
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.getVoices();
    const handler = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = handler;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const markPlaying = useCallback((el: HTMLElement | null | undefined) => {
    if (activeRef.current && activeRef.current !== el) {
      activeRef.current.classList.remove("playing");
    }
    if (el) {
      el.classList.add("playing");
      activeRef.current = el;
    }
  }, []);

  const clearPlaying = useCallback(() => {
    if (activeRef.current) {
      activeRef.current.classList.remove("playing");
      activeRef.current = null;
    }
  }, []);

  return useCallback<SpeakFn>(
    (text, element) => {
      if (!text) return;

      // Stop anything else first.
      stopEverything();
      markPlaying(element);

      const { speed, repeat } = getPlaybackSettings();
      const myToken = ++cancelToken; // claim a fresh play session

      const pregen = lookupAudio(text);

      // Choose the playback function for this single repetition.
      const playOnce = async (): Promise<void> => {
        if (myToken !== cancelToken) return;
        if (pregen) {
          return playMp3Once(pregen, speed, myToken);
        }
        if (isAzureConfigured) {
          try {
            const url = await fetchAzureSpeech(text);
            return playMp3Once(url, speed, myToken);
          } catch {
            return playBrowserOnce(text, speed, myToken);
          }
        }
        return playBrowserOnce(text, speed, myToken);
      };

      // Run the repeat loop, awaiting each iteration so they don't overlap.
      (async () => {
        for (let i = 0; i < repeat; i++) {
          if (myToken !== cancelToken) return;
          await playOnce();
          if (i < repeat - 1) {
            if (myToken !== cancelToken) return;
            await sleep(REPEAT_GAP_MS);
          }
        }
        if (myToken === cancelToken) clearPlaying();
      })();
    },
    [markPlaying, clearPlaying]
  );
}

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import { STORAGE_KEYS, trackEvent } from "../config";
import { useTargetLanguage } from "./TargetLanguage";

// ─── Public shape ────────────────────────────────────────────────

interface LessonNavValue {
  /** ID of the lesson currently in the upper portion of the viewport.
   *  Used by the sidebar (you-are-here highlight), focus mode (which one
   *  to show), and last-position persistence. Null until the first
   *  IntersectionObserver callback fires. */
  activeId: string | null;

  /** Each <LessonSection> calls this on mount with its DOM node and on
   *  unmount with null, registering itself with the shared observer.
   *  No-op if called with the same (id, el) twice. */
  registerSection: (id: string, el: HTMLElement | null) => void;

  /** Whether focus mode is on (only the active lesson is visible). */
  focusMode: boolean;
  /** Toggle focus mode. Persists to localStorage. */
  toggleFocusMode: () => void;

  /** Has the user marked this lesson complete? */
  isComplete: (lessonId: string) => boolean;
  /** Flip a lesson's completion state. Persists per language. */
  toggleComplete: (lessonId: string) => void;
  /** How many lessons in the active language are marked complete. */
  completedCount: number;
}

const LessonNavContext = createContext<LessonNavValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────

export function LessonNavProvider({ children }: { children: ReactNode }) {
  const { module } = useTargetLanguage();

  // ── Active section tracking ─────────────────────────────────────
  // One shared IntersectionObserver. Each LessonSection registers its
  // DOM element via registerSection. The active section is the one
  // whose top is closest to (but below) the 30% viewport line.

  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Update map of who's currently intersecting (we keep state
        // outside React for the observer's own bookkeeping — it's just
        // a snapshot the next callback overwrites).
        const intersecting: Array<{ id: string; top: number }> = [];
        for (const [id, el] of sectionsRef.current) {
          const rect = el.getBoundingClientRect();
          // Visible if any portion of the section is in the viewport
          if (rect.bottom > 0 && rect.top < window.innerHeight) {
            intersecting.push({ id, top: rect.top });
          }
        }
        if (intersecting.length === 0) return;
        // Sort by top: pick the topmost section whose top is above the
        // 30% line. If none qualify, fall back to the topmost intersecting.
        intersecting.sort((a, b) => a.top - b.top);
        const refLine = window.innerHeight * 0.3;
        const winner = intersecting.find(s => s.top <= refLine) ?? intersecting[0];
        setActiveId(prev => (prev === winner.id ? prev : winner.id));
      },
      {
        // Fire when sections cross the upper third of the viewport.
        threshold: [0, 0.15, 0.5, 0.85, 1],
        rootMargin: "0px 0px -50% 0px",
      }
    );
    observerRef.current = observer;
    // Observe sections registered before the observer existed.
    for (const el of sectionsRef.current.values()) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const registerSection = useCallback((id: string, el: HTMLElement | null) => {
    const prev = sectionsRef.current.get(id);
    if (prev && prev !== el && observerRef.current) {
      observerRef.current.unobserve(prev);
    }
    if (el) {
      sectionsRef.current.set(id, el);
      observerRef.current?.observe(el);
    } else {
      sectionsRef.current.delete(id);
    }
  }, []);

  // ── Focus mode ──────────────────────────────────────────────────

  const [focusMode, setFocusMode] = useState<boolean>(() => {
    try { return localStorage.getItem(STORAGE_KEYS.focusMode) === "1"; }
    catch { return false; }
  });

  const toggleFocusMode = useCallback(() => {
    setFocusMode(v => {
      const next = !v;
      try {
        if (next) localStorage.setItem(STORAGE_KEYS.focusMode, "1");
        else localStorage.removeItem(STORAGE_KEYS.focusMode);
      } catch { /* private mode */ }
      trackEvent(next ? "focus-mode-on" : "focus-mode-off");
      return next;
    });
  }, []);

  // F key toggles focus mode (when not typing in an input).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "f" && e.key !== "F") return;
      const target = e.target as HTMLElement | null;
      if (target && target.matches('input, textarea, [contenteditable="true"]')) return;
      e.preventDefault();
      toggleFocusMode();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleFocusMode]);

  // Reflect focus state on <body> so CSS can target [data-focus-mode="on"]
  // and [data-active-lesson="..."] without prop-drilling.
  useEffect(() => {
    if (focusMode && activeId) {
      document.body.setAttribute("data-focus-mode", "on");
      document.body.setAttribute("data-active-lesson", activeId);
    } else {
      document.body.removeAttribute("data-focus-mode");
      document.body.removeAttribute("data-active-lesson");
    }
  }, [focusMode, activeId]);

  // When focus mode toggles, scroll the active lesson into view so the user
  // doesn't get disoriented (e.g. dropping into focus while reading the
  // bottom of a long lesson — without this, they'd see the lesson's
  // bottom paragraph centred with nothing above or below).
  useEffect(() => {
    if (!focusMode || !activeId) return;
    const el = document.getElementById(activeId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Completion tracking ─────────────────────────────────────────

  function readCompletedMap(langCode: string): Record<string, boolean> {
    try {
      const prefix = `${STORAGE_KEYS.completedPrefix}${langCode}:`;
      const result: Record<string, boolean> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          result[key.slice(prefix.length)] = true;
        }
      }
      return result;
    } catch {
      return {};
    }
  }

  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(
    () => readCompletedMap(module.code)
  );

  // Reload when language switches.
  useEffect(() => {
    setCompletedMap(readCompletedMap(module.code));
  }, [module.code]);

  const isComplete = useCallback(
    (lessonId: string) => !!completedMap[lessonId],
    [completedMap]
  );

  const toggleComplete = useCallback((lessonId: string) => {
    const key = `${STORAGE_KEYS.completedPrefix}${module.code}:${lessonId}`;
    setCompletedMap(prev => {
      const next = { ...prev };
      if (next[lessonId]) {
        delete next[lessonId];
        try { localStorage.removeItem(key); } catch { /* ignore */ }
        trackEvent("lesson-unmarked", { language: module.code, lesson: lessonId });
      } else {
        next[lessonId] = true;
        try { localStorage.setItem(key, "1"); } catch { /* ignore */ }
        trackEvent("lesson-completed", { language: module.code, lesson: lessonId });
      }
      return next;
    });
  }, [module.code]);

  const completedCount = useMemo(
    () => Object.keys(completedMap).length,
    [completedMap]
  );

  // ── Last-position scroll restoration ────────────────────────────
  // On module switch (which happens at first load too), restore the user's
  // last reading position — but only if the URL has no anchor. An anchor
  // is the user's explicit intent and beats the persisted position.

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (window.location.hash) return;
        const key = `${STORAGE_KEYS.lastPositionPrefix}${module.code}`;
        const lastId = localStorage.getItem(key);
        if (!lastId) return;
        const el = document.getElementById(lastId);
        if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
      } catch { /* ignore */ }
    }, 80); // give lessons one tick to mount
    return () => clearTimeout(t);
  }, [module.code]);

  // Persist active position (debounced — 1s after the user stops scrolling).
  useEffect(() => {
    if (!activeId) return;
    const key = `${STORAGE_KEYS.lastPositionPrefix}${module.code}`;
    const t = setTimeout(() => {
      try { localStorage.setItem(key, activeId); } catch { /* ignore */ }
    }, 1000);
    return () => clearTimeout(t);
  }, [activeId, module.code]);

  // ── Value ───────────────────────────────────────────────────────

  const value = useMemo<LessonNavValue>(
    () => ({
      activeId, registerSection,
      focusMode, toggleFocusMode,
      isComplete, toggleComplete,
      completedCount,
    }),
    [activeId, registerSection, focusMode, toggleFocusMode, isComplete, toggleComplete, completedCount]
  );

  return (
    <LessonNavContext.Provider value={value}>
      {children}
    </LessonNavContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────

export function useLessonNav(): LessonNavValue {
  const ctx = useContext(LessonNavContext);
  if (!ctx) throw new Error("useLessonNav must be used inside <LessonNavProvider>");
  return ctx;
}

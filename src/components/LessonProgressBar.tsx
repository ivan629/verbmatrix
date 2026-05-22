import { useEffect, useState } from "react";

/**
 * Thin gold progress bar fixed to the top of the viewport.
 *
 * Tracks scroll through the entire textbook (every-lesson, end-to-end).
 * Psychologically: orientation. Without a progress signal, learners pace
 * themselves badly — either rushing because it feels endless, or stopping
 * early because they don't know they're nearly through.
 *
 * Hidden on the landing page (when isUnchosen is true in App.tsx) — only
 * renders during actual lesson reading.
 *
 * Implementation: a single scroll listener using requestAnimationFrame for
 * smoothness, computing `scrollTop / (scrollHeight - innerHeight)`.
 * Transform-based scaleX is GPU-friendly and won't trigger layout.
 */
export function LessonProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafPending = false;

    function compute() {
      rafPending = false;
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollable = (doc.scrollHeight - window.innerHeight);
      const ratio = scrollable > 0 ? scrollTop / scrollable : 0;
      setProgress(Math.max(0, Math.min(1, ratio)));
    }

    function onScroll() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(compute);
    }

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="lesson-progress-bar" aria-hidden="true">
      <div
        className="lesson-progress-bar-fill"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

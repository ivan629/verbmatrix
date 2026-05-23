import { useEffect, useRef } from "react";

/**
 * Scroll-triggered reveal animation.
 *
 * Returns a ref to attach to the element. When the element enters the
 * viewport (with `threshold` visible), the `.revealed` class is added,
 * triggering the CSS animation defined in globals.css.
 *
 * The element should have one of: `.reveal`, `.reveal-scale`, `.stagger`,
 * or `.matrix-stagger` as a class — each has its own keyframe in CSS.
 *
 * Options:
 *   - threshold: how much of the element must be visible (0–1, default 0.15)
 *   - once: if true (default), the animation only fires once
 *   - rootMargin: offset to trigger earlier/later (default "-40px")
 *
 * The returned ref is typed as React.RefObject<T> rather than
 * RefObject<T | null> so it can be attached directly to JSX without
 * triggering the LegacyRef type mismatch in older @types/react versions.
 * The .current is still null until the element mounts — typed cast is
 * safe because React never reads .current synchronously during render.
 */
interface RevealOptions {
  threshold?: number;
  once?: boolean;
  rootMargin?: string;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
    options: RevealOptions = {},
): React.RefObject<T> {
  const ref = useRef<T | null>(null);
  const { threshold = 0.15, once = true, rootMargin = "-40px" } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion — reveal immediately without animation.
    const prefersReduced = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      el.classList.add("revealed");
      return;
    }

    const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          if (entry.isIntersecting) {
            el.classList.add("revealed");
            if (once) observer.unobserve(el);
          }
        },
        { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return ref as React.RefObject<T>;
}

/**
 * Batch version — observes multiple elements with the same options.
 * Useful for grids/lists where each child should reveal independently.
 *
 * Returns a callback ref to attach to a parent container. All direct
 * children with `.reveal` or `.reveal-scale` will be observed.
 */
export function useScrollRevealChildren<T extends HTMLElement = HTMLDivElement>(
    options: RevealOptions = {},
): React.RefObject<T> {
  const ref = useRef<T | null>(null);
  const { threshold = 0.1, once = true, rootMargin = "-40px" } = options;

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const prefersReduced = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
    ).matches;

    const children = container.querySelectorAll(".reveal, .reveal-scale");
    if (prefersReduced) {
      children.forEach((c) => c.classList.add("revealed"));
      return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              if (once) observer.unobserve(entry.target);
            }
          });
        },
        { threshold, rootMargin },
    );

    children.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return ref as React.RefObject<T>;
}

import {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
  type MouseEvent, type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useTTS } from "../lib/tts";
import { pronounce } from "../lib/pronounce";
import { useTranslated } from "../lib/useTranslated";

interface ROProps {
  /** The Romanian text. Used for TTS, pronunciation, and (if no children) display. */
  text: string;
  /** Optional English meaning — also serves as the canonical source for translation. */
  en?: string;
  /** Optional pronunciation override; otherwise auto-generated. */
  pron?: string;
  /** Optional custom children for display. Defaults to `text`. */
  children?: ReactNode;
  /** Hide the underline / tooltip styling — useful when nesting. */
  bare?: boolean;
  /** What to actually speak, if different from the visible text. */
  speakAs?: string;
  className?: string;
}

/**
 * `<RO />` — wraps Romanian text with:
 *   • dotted underline on hover
 *   • tooltip showing meaning (in selected target language) + pronunciation
 *   • click → TTS
 *
 * The tooltip is rendered via a React portal to `document.body` so it escapes
 * every `overflow: hidden` / `overflow: auto` ancestor in the page (matrix
 * tables, rounded card containers, etc.) and is never clipped.
 */
export function RO({
  text, en, pron, children, bare = false, speakAs, className = "",
}: ROProps) {
  const speak = useTTS();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(false);
  const tapTimeoutRef = useRef<number | undefined>(undefined);

  // Translation source preference: English meaning if we have it, else the Romanian itself.
  const englishTranslation = useTranslated(en, "en");
  const romanianTranslation = useTranslated(en ? undefined : text, "ro");
  const meaning = en ? englishTranslation.display : romanianTranslation.display;

  const triggerTranslation = useCallback(() => {
    englishTranslation.trigger();
    romanianTranslation.trigger();
  }, [englishTranslation, romanianTranslation]);

  const handleEnter = useCallback(() => {
    setActive(true);
    triggerTranslation();
  }, [triggerTranslation]);

  const handleLeave = useCallback(() => {
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = undefined;
    }
    setActive(false);
  }, []);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLSpanElement>) => {
      e.stopPropagation();
      const isTouch = window.matchMedia?.("(hover: none)").matches ?? false;
      if (isTouch) {
        setActive(true);
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = window.setTimeout(() => setActive(false), 2400);
      }
      triggerTranslation();
      speak(speakAs ?? text, e.currentTarget);
    },
    [speak, text, speakAs, triggerTranslation]
  );

  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    };
  }, []);

  if (bare) {
    return (
      <span
        ref={triggerRef}
        onClick={handleClick}
        className={`cursor-pointer ${className}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            speak(speakAs ?? text, triggerRef.current);
          }
        }}
      >
        {children ?? text}
      </span>
    );
  }

  const pronunciation = pron ?? pronounce(text);

  return (
    <>
      <span
        ref={triggerRef}
        onClick={handleClick}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        onTouchStart={triggerTranslation}
        className={`ro ${className}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            triggerTranslation();
            speak(speakAs ?? text, triggerRef.current);
          }
        }}
        aria-label={meaning ? `${text}, meaning ${meaning}` : text}
      >
        {children ?? text}
      </span>
      {active && (
        <Tooltip
          trigger={triggerRef.current}
          meaning={meaning}
          pronunciation={pronunciation}
        />
      )}
    </>
  );
}

// ─── Portal-rendered tooltip ────────────────────────────────────

interface TooltipProps {
  trigger: HTMLElement | null;
  meaning?: string;
  pronunciation?: string;
}

interface Position {
  top: number;
  left: number;
  arrowLeft: number; // 0..1 — fractional horizontal position of the arrow within the tooltip
  placement: "top" | "bottom";
}

const TOOLTIP_GAP = 8;
const TOOLTIP_MAX_WIDTH = 280;
const VIEWPORT_PADDING = 8;
const ESTIMATED_HEIGHT = 50;

function Tooltip({ trigger, meaning, pronunciation }: TooltipProps) {
  const [pos, setPos] = useState<Position | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!trigger) return;

    const compute = () => {
      const rect = trigger.getBoundingClientRect();
      const tooltipEl = tooltipRef.current;
      const tooltipWidth = tooltipEl
        ? tooltipEl.offsetWidth
        : Math.min(TOOLTIP_MAX_WIDTH, 200);
      const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : ESTIMATED_HEIGHT;

      // Prefer placement above; flip below if not enough room.
      const placement: "top" | "bottom" =
        rect.top >= tooltipHeight + TOOLTIP_GAP + VIEWPORT_PADDING ? "top" : "bottom";

      // Center horizontally on the trigger.
      const triggerCenter = rect.left + rect.width / 2;

      // Clamp the tooltip's left edge so it stays within the viewport.
      const halfWidth = tooltipWidth / 2;
      const minCenter = halfWidth + VIEWPORT_PADDING;
      const maxCenter = window.innerWidth - halfWidth - VIEWPORT_PADDING;
      const clampedCenter = Math.max(minCenter, Math.min(maxCenter, triggerCenter));

      const tooltipLeft = clampedCenter - halfWidth;

      // Arrow should point at the actual trigger center, even when the tooltip
      // has been clamped.
      const arrowLeft = (triggerCenter - tooltipLeft) / tooltipWidth;
      const arrowLeftClamped = Math.max(0.08, Math.min(0.92, arrowLeft));

      const top =
        placement === "top"
          ? rect.top + window.scrollY - tooltipHeight - TOOLTIP_GAP
          : rect.bottom + window.scrollY + TOOLTIP_GAP;

      setPos({
        top,
        left: tooltipLeft + window.scrollX,
        arrowLeft: arrowLeftClamped,
        placement,
      });
    };

    // Initial compute (with estimated height), then a second pass after the
    // tooltip element has actually rendered so dimensions are exact.
    compute();
    const id = requestAnimationFrame(compute);
    return () => cancelAnimationFrame(id);
  }, [trigger, meaning, pronunciation]);

  if (!trigger) return null;

  // Render the tooltip even before `pos` is ready, but invisible — so
  // tooltipRef.current exists for the second-pass measurement.
  const style: React.CSSProperties = pos
    ? { position: "absolute", top: pos.top, left: pos.left, opacity: 1 }
    : { position: "absolute", top: -9999, left: -9999, opacity: 0 };

  return createPortal(
    <div
      ref={tooltipRef}
      className={`ro-tip-portal ${pos ? `ro-tip-${pos.placement}` : ""}`}
      style={style}
      role="tooltip"
    >
      {meaning && <span className="ro-tip-en">{meaning}</span>}
      {meaning && pronunciation && <span className="ro-tip-divider" />}
      {pronunciation && <span className="ro-tip-pron">{pronunciation}</span>}
      {pos && (
        <span
          className="ro-tip-arrow"
          style={{ left: `${pos.arrowLeft * 100}%` }}
          aria-hidden="true"
        />
      )}
    </div>,
    document.body
  );
}

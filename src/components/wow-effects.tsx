/**
 * Wow-effect primitives. Built for instant feel — every animation is
 * GPU-compositable (transform + opacity only), uses requestAnimationFrame
 * for any JS-driven motion, and respects prefers-reduced-motion.
 *
 * Components:
 *   - CountdownTimer    — 5-minute live countdown with milestone messages
 *   - MagneticButton    — Cursor-attracting wrapper for CTAs
 *   - PageCurl          — SVG section transition with paper-curl effect
 *   - DrawMatrix        — SVG matrix that draws line-by-line, then numbers fill in
 *   - HoverPhonetic     — Romanian word with floating pronunciation on hover
 *   - StrikeText        — Word with animated hand-drawn strikethrough
 *   - CircledText       — Word with animated hand-drawn circle
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

// ─── Live countdown timer ──────────────────────────────────────
// Counts down from 5:00 in real time. When user scrolls past it,
// it pauses. Hits zero → flashes "Time's up. That's how long it
// takes." then restarts. Tied to the "5 minutes" promise.

export function CountdownTimer({ className = "" }: { className?: string }) {
  const [seconds, setSeconds] = useState(300); // 5:00
  const [phase, setPhase] = useState<"counting" | "done" | "resetting">("counting");
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);

  // Pause when offscreen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Tick every second
  useEffect(() => {
    if (phase !== "counting") return;
    const interval = setInterval(() => {
      if (!isVisibleRef.current) return; // pause when offscreen
      setSeconds((s) => {
        if (s <= 1) {
          setPhase("done");
          setTimeout(() => {
            setPhase("resetting");
            setTimeout(() => {
              setSeconds(300);
              setPhase("counting");
            }, 400);
          }, 3000);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div ref={containerRef} className={`inline-flex items-center gap-2 ${className}`}>
      {phase === "done" ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold-bright)]">
          ⏱ That's how long it takes
        </span>
      ) : (
        <>
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--gold)] opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--gold-bright)]" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
            First sentence in
          </span>
          <span className="font-mono text-[11px] text-white/80 tabular-nums tracking-wider">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
        </>
      )}
    </div>
  );
}

// ─── Magnetic button wrapper ───────────────────────────────────
// Wraps a button so the cursor attracts it when nearby. Uses rAF
// for smooth movement, pointer events for proximity detection.

export function MagneticButton({
  children,
  className = "",
  strength = 0.35,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function update() {
      // Smooth lerp toward target
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.15;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.15;
      if (el) {
        el.style.transform = `translate3d(${currentRef.current.x}px, ${currentRef.current.y}px, 0)`;
      }
      // Keep ticking while there's distance to cover
      const dx = targetRef.current.x - currentRef.current.x;
      const dy = targetRef.current.y - currentRef.current.y;
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        rafRef.current = requestAnimationFrame(update);
      } else {
        rafRef.current = undefined;
      }
    }

    function startTick() {
      if (rafRef.current === undefined) {
        rafRef.current = requestAnimationFrame(update);
      }
    }

    function onMove(e: MouseEvent) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const radius = Math.max(rect.width, rect.height) * 1.2;
      if (distance < radius) {
        targetRef.current = { x: dx * strength, y: dy * strength };
      } else {
        targetRef.current = { x: 0, y: 0 };
      }
      startTick();
    }

    function onLeave() {
      targetRef.current = { x: 0, y: 0 };
      startTick();
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, [strength]);

  return (
    <div ref={ref} className={`gpu inline-block ${className}`} {...rest}>
      {children}
    </div>
  );
}

// ─── Page curl divider ─────────────────────────────────────────
// SVG that creates a paper-being-turned effect between sections.
// Stays cheap because it's pure SVG, not blur/transform.

export function PageCurl({
  direction = "down",
  fromColor = "#07060a",
  toColor = "#f5f1e7",
}: {
  direction?: "down" | "up";
  fromColor?: string;
  toColor?: string;
}) {
  // The curl is a wavy path; the shadow underneath gives the dimensional feel
  return (
    <div className="relative w-full pointer-events-none" style={{ height: "120px", overflow: "hidden" }}>
      <svg
        className="absolute inset-x-0 w-full"
        style={{
          [direction === "down" ? "top" : "bottom"]: 0,
          height: "120px",
          transform: direction === "up" ? "scaleY(-1)" : "none",
        }}
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Soft shadow gradient under the curl */}
          <linearGradient id="curl-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.20)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
          {/* Curl highlight — subtle gold sheen */}
          <linearGradient id="curl-highlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={fromColor} />
            <stop offset="60%" stopColor={fromColor} />
            <stop offset="100%" stopColor={`color-mix(in srgb, ${fromColor} 70%, #d49545)`} />
          </linearGradient>
        </defs>

        {/* Background fill — the new section color */}
        <rect width="1200" height="120" fill={toColor} />

        {/* Shadow under the curl */}
        <path
          d="M0,0 Q300,40 600,20 T1200,30 L1200,60 Q900,70 600,50 T0,55 Z"
          fill="url(#curl-shadow)"
          transform="translate(0, 10)"
        />

        {/* The curled page itself */}
        <path
          d="M0,0 Q300,60 600,30 T1200,40 L1200,0 Z"
          fill="url(#curl-highlight)"
        />

        {/* Top edge with a subtle highlight line */}
        <path
          d="M0,0 Q300,60 600,30 T1200,40"
          fill="none"
          stroke={`color-mix(in srgb, ${fromColor} 60%, #d49545)`}
          strokeWidth="0.5"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}

// ─── Draw-in matrix ────────────────────────────────────────────
// 3×3 SVG matrix where lines draw themselves first, then numbers
// fill cells one at a time. Replaces the splash-in cards.

export function DrawMatrix({
  size = 320,
  className = "",
  active = true,
}: {
  size?: number;
  className?: string;
  active?: boolean;
}) {
  const cells = [
    ["O să vorbesc?", "Eu vorbesc.", "N-am vorbit."],
    ["Vorbești?", "Tu vorbești.", "Tu nu vorbești."],
    ["A vorbit?", "El a vorbit.", "El n-a vorbit."],
  ];
  const colors = ["#2a5a8a", "#2d6342", "#8f3128"];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 320 320"
      className={className}
      fill="none"
      stroke="currentColor"
    >
      <defs>
        <linearGradient id="draw-cell-center" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f4be7a" />
          <stop offset="100%" stopColor="#e87a70" />
        </linearGradient>
      </defs>

      {/* Outer frame — draws first */}
      <rect
        x="10" y="10" width="300" height="300" rx="8"
        strokeWidth="1.5"
        style={{
          strokeDasharray: 1200,
          strokeDashoffset: active ? 0 : 1200,
          transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* Vertical dividers */}
      <line
        x1="113" y1="10" x2="113" y2="310"
        strokeWidth="1"
        style={{
          strokeDasharray: 300,
          strokeDashoffset: active ? 0 : 300,
          transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.6s",
        }}
      />
      <line
        x1="216" y1="10" x2="216" y2="310"
        strokeWidth="1"
        style={{
          strokeDasharray: 300,
          strokeDashoffset: active ? 0 : 300,
          transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.7s",
        }}
      />

      {/* Horizontal dividers */}
      <line
        x1="10" y1="113" x2="310" y2="113"
        strokeWidth="1"
        style={{
          strokeDasharray: 300,
          strokeDashoffset: active ? 0 : 300,
          transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.8s",
        }}
      />
      <line
        x1="10" y1="216" x2="310" y2="216"
        strokeWidth="1"
        style={{
          strokeDasharray: 300,
          strokeDashoffset: active ? 0 : 300,
          transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.9s",
        }}
      />

      {/* Cell text — fades in after lines draw */}
      {cells.map((row, r) =>
        row.map((text, c) => {
          const isCenter = r === 1 && c === 1;
          // Stagger: cells appear after 1.4s, each 80ms apart
          const delay = 1.4 + (r * 3 + c) * 0.08;
          return (
            <g key={`${r}-${c}`} style={{
              opacity: active ? 1 : 0,
              transition: `opacity 0.4s ease ${delay}s`,
            }}>
              {isCenter && (
                <rect
                  x={113 + 5}
                  y={113 + 5}
                  width={103 - 10}
                  height={103 - 10}
                  rx="4"
                  fill="url(#draw-cell-center)"
                  opacity="0.18"
                />
              )}
              <text
                x={(c * 103) + 113 / 2 + (c === 0 ? 51 : c === 1 ? 51 : 51)}
                y={(r * 103) + 113 / 2 + (r === 0 ? 51 : r === 1 ? 51 : 51)}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize="10"
                fontWeight="500"
                fill={isCenter ? "currentColor" : colors[c]}
                letterSpacing="-0.02em"
              >
                {text}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}

// ─── Hover phonetic — floating pronunciation ───────────────────
// Wraps a Romanian word. On hover (desktop) or tap (mobile), a small
// gold pill appears above it with the phonetic spelling.

export function HoverPhonetic({
  word,
  phonetic,
  onClick,
}: {
  word: string;
  phonetic: string;
  onClick?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-block cursor-pointer"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={onClick}
    >
      <span className="hand-underline">{word}</span>
      <span
        className={`absolute left-1/2 bottom-full mb-2 px-2.5 py-1 rounded-full bg-[var(--ink)] text-[var(--bg)] font-mono text-[10px] uppercase tracking-[0.14em] whitespace-nowrap pointer-events-none transition-all duration-200`}
        style={{
          transform: `translateX(-50%) translateY(${open ? "0" : "4px"})`,
          opacity: open ? 1 : 0,
        }}
      >
        [{phonetic}]
      </span>
    </span>
  );
}

// ─── Animated strikethrough text ───────────────────────────────
// "studying" appears, then a hand-drawn line strikes through it.

export function StrikeText({
  children,
  className = "",
  active = true,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  active?: boolean;
  delay?: number;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span style={{ opacity: active ? 0.45 : 1, transition: "opacity 0.6s ease" }}>
        {children}
      </span>
      <svg
        className="absolute pointer-events-none"
        style={{ left: "-2%", top: "50%", width: "104%", height: "30px", transform: "translateY(-50%)" }}
        viewBox="0 0 200 30"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M2,16 Q60,12 100,15 Q140,18 198,14"
          stroke="var(--rose)"
          strokeWidth="3"
          strokeLinecap="round"
          style={{
            strokeDasharray: 220,
            strokeDashoffset: active ? 0 : 220,
            transition: `stroke-dashoffset 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
          }}
        />
      </svg>
    </span>
  );
}

// ─── Animated hand-drawn circle ────────────────────────────────
// "speaking" gets circled with a gold pen-stroke that draws itself.

export function CircledText({
  children,
  className = "",
  active = true,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  active?: boolean;
  delay?: number;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span>{children}</span>
      <svg
        className="absolute pointer-events-none"
        style={{
          left: "-10%", top: "-15%",
          width: "120%", height: "130%",
        }}
        viewBox="0 0 220 80"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M14,40 Q22,12 110,10 Q200,14 208,40 Q210,68 110,72 Q14,68 14,40 Z"
          stroke="var(--gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            strokeDasharray: 700,
            strokeDashoffset: active ? 0 : 700,
            transition: `stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
          }}
        />
      </svg>
    </span>
  );
}

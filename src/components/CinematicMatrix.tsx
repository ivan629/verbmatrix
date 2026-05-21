import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Scroll-driven cinematic matrix section.
 *
 * The user enters this section. The matrix grows from 1 cell to 9 cells.
 * Then numbers cascade: "1 verb" → "9 cells" → "32 verbs" → "500 words" →
 * "all from a single grid."
 *
 * Implemented with scroll progress (0..1) driving CSS variables and stage
 * indices. The section is `sticky` so the user scrolls THROUGH it while
 * the visual stays pinned and morphs.
 */

interface Stage {
  /** When this stage activates (0..1 scroll progress through the section) */
  at: number;
  /** Headline displayed at this stage */
  headline: string;
  /** Caption below the headline */
  caption: string;
  /** Visual variant: which graphic to show */
  variant: "single" | "matrix" | "verbs" | "vocab" | "all";
}

const STAGES: Stage[] = [
  { at: 0.00, headline: "One word.", caption: "vorbesc", variant: "single" },
  { at: 0.22, headline: "Nine sentences.", caption: "3 tenses × 3 forms", variant: "matrix" },
  { at: 0.46, headline: "Thirty-two verbs.", caption: "ninety percent of speech", variant: "verbs" },
  { at: 0.70, headline: "Five hundred words.", caption: "the whole daily vocabulary", variant: "vocab" },
  { at: 0.90, headline: "All from one system.", caption: "the verb matrix", variant: "all" },
];

const VERB_LIST = [
  "a fi", "a avea", "a face", "a merge", "a veni", "a vorbi", "a lucra",
  "a locui", "a vrea", "a putea", "a ști", "a vedea", "a da", "a lua",
  "a mânca", "a bea", "a dormi", "a citi", "a scrie", "a înțelege",
  "a plăcea", "a cumpăra", "a pleca", "a sta", "a învăța", "a plăti",
  "a deschide", "a închide", "a spune", "a ajunge", "a chema", "a suna",
];

const VOCAB_SAMPLE = [
  "apă", "pâine", "carne", "lapte", "ouă", "vin", "bere", "cafea", "ceai",
  "casă", "masă", "scaun", "ușă", "fereastră", "cer", "soare", "lună",
  "mare", "munte", "câmp", "pădure", "om", "femeie", "copil", "prieten",
  "carte", "pix", "oraș", "sat", "drum", "tren", "bună", "rău", "mare",
  "mic", "frumos", "vechi", "nou", "rece", "cald", "ușor", "greu",
];

export function CinematicMatrix() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let rafPending = false;

    function compute() {
      rafPending = false;
      const rect = section!.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const totalScrollable = rect.height - viewportH;
      const scrolled = -rect.top;
      const raw = scrolled / totalScrollable;
      setProgress(Math.max(0, Math.min(1, raw)));
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

  // Determine active stage
  const activeStage = STAGES.reduce((acc, s) => (progress >= s.at ? s : acc), STAGES[0]);
  const stageIdx = STAGES.indexOf(activeStage);

  return (
    <section
      ref={sectionRef}
      className="scope-dark relative"
      style={{ height: "500vh" /* 5 viewport heights — long scroll runway */ }}
    >
      {/* Sticky stage — pinned while the user scrolls through */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background gradient */}
        <div
          className="absolute inset-0 transition-all duration-1000 ease-out"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at ${20 + progress * 60}% ${30 + progress * 40}%, rgba(244,190,122, ${0.10 + progress * 0.12}), transparent 60%),
              radial-gradient(ellipse 60% 50% at ${80 - progress * 60}% ${70 - progress * 40}%, rgba(232,122,112, ${0.06 + progress * 0.10}), transparent 60%),
              #07060a
            `,
          }}
        />

        {/* Grid overlay — opacity shifts with progress */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            backgroundImage: "linear-gradient(rgba(255,235,200,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,235,200,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            opacity: 0.02 + progress * 0.04,
          }}
        />

        {/* Stage progress indicator (right edge) */}
        <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
          {STAGES.map((s, i) => (
            <div
              key={i}
              className="w-px transition-all duration-500"
              style={{
                height: i === stageIdx ? "32px" : "12px",
                background: i === stageIdx ? "var(--gold-bright)" : "var(--ink-5)",
              }}
            />
          ))}
        </div>

        {/* Stage counter (top right) */}
        <div className="absolute top-8 md:top-12 right-6 md:right-12 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 z-20">
          {String(stageIdx + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}
        </div>

        {/* Status label (top left) */}
        <div className="absolute top-8 md:top-12 left-6 md:left-12 flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 z-20">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--gold)]"
            style={{
              animation: "countdown-pulse 1.6s ease-in-out infinite",
              boxShadow: "0 0 6px rgba(244,190,122,0.4)",
            }}
          />
          <span>The matrix in motion</span>
        </div>

        {/* The cinematic stage */}
        <div className="relative z-10 w-full max-w-[1100px] px-5 md:px-12 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">

          {/* Left: text */}
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[var(--gold-bright)] mb-5">
              § Stage {stageIdx + 1}
            </div>
            <h2
              key={`headline-${stageIdx}`}
              className="font-display text-white font-light tracking-[-0.035em] leading-[0.95]
                         text-[clamp(2.4rem,6.5vw,5.2rem)] mb-6 text-scramble"
            >
              {activeStage.headline}
            </h2>
            <p
              key={`caption-${stageIdx}`}
              className="font-display italic text-[clamp(1rem,1.8vw,1.3rem)] text-white/60 leading-[1.5] text-scramble"
              style={{ fontVariationSettings: '"SOFT" 100, "WONK" 0', animationDelay: "0.1s" }}
            >
              — {activeStage.caption}
            </p>
          </div>

          {/* Right: visual that transforms */}
          <div className="relative w-full aspect-square max-w-[500px] mx-auto">
            <CinematicVisual variant={activeStage.variant} progress={progress} />
          </div>
        </div>

        {/* Progress bar (bottom) */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5 z-20">
          <div
            className="h-full transition-transform duration-100 ease-out origin-left"
            style={{
              transform: `scaleX(${progress})`,
              background: "var(--signature-gradient)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

// ─── The morphing visual ────────────────────────────────────────

function CinematicVisual({ variant, progress }: { variant: string; progress: number }) {
  if (variant === "single") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="glow-pulse glass-strong rounded-2xl px-8 py-6 shadow-heavy">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold-bright)] mb-2 text-center">verb</div>
          <div className="font-display text-[3rem] md:text-[4rem] text-white font-light tracking-tight">
            vorbesc
          </div>
          <div className="font-mono text-[11px] text-white/50 mt-1 text-center">I speak</div>
        </div>
      </div>
    );
  }

  if (variant === "matrix") {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="grid grid-cols-3 gap-3 w-full max-w-[420px] aspect-square">
          {[
            ["O să vorbesc?", "Eu o să vorbesc.", "N-o să vorbesc."],
            ["Vorbesc eu?", "Eu vorbesc.", "Eu nu vorbesc."],
            ["Am vorbit eu?", "Eu am vorbit.", "Nu am vorbit."],
          ].flat().map((text, i) => {
            const col = i % 3;
            const colorClasses = ["text-[var(--question)]", "text-[var(--affirm)]", "text-[var(--neg)]"];
            return (
              <div
                key={i}
                className={`glass rounded-xl p-3 flex items-center justify-center text-center font-mono text-[10px] md:text-[12px] ${colorClasses[col]}`}
                style={{
                  animation: `splash-in 0.6s var(--ease-out-expo) both`,
                  animationDelay: `${i * 50}ms`,
                }}
              >
                <span className="leading-tight">{text}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === "verbs") {
    return (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="grid grid-cols-4 gap-1.5 w-full max-w-[440px]">
          {VERB_LIST.map((verb, i) => (
            <div
              key={verb}
              className="glass rounded-lg py-2 px-2.5 text-center"
              style={{
                animation: `splash-in 0.5s var(--ease-out-expo) both`,
                animationDelay: `${i * 25}ms`,
              }}
            >
              <span className="font-display text-[11px] md:text-[13px] text-white/85 italic">{verb}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "vocab") {
    return (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="flex flex-wrap gap-2 justify-center max-w-[480px] px-4">
          {VOCAB_SAMPLE.map((word, i) => (
            <span
              key={word + i}
              className="px-3 py-1.5 rounded-full glass font-display text-[12px] md:text-[14px] text-white/80"
              style={{
                animation: `splash-in 0.45s var(--ease-out-expo) both`,
                animationDelay: `${i * 18}ms`,
              }}
            >
              {word}
            </span>
          ))}
          <span className="px-3 py-1.5 rounded-full font-mono text-[10px] text-[var(--gold-bright)] uppercase tracking-wider self-center">
            + 460 more
          </span>
        </div>
      </div>
    );
  }

  // "all" — collapsed final state — the brand mark
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        {/* Big rotating circle */}
        <div
          className="absolute -inset-32 rounded-full pointer-events-none"
          style={{
            background: "conic-gradient(from 0deg, transparent, var(--gold-soft), transparent 60%)",
            animation: "shimmer 4s linear infinite",
            opacity: 0.4,
          }}
        />
        {/* 3×3 matrix as the resolved identity */}
        <div className="relative grid grid-cols-3 gap-2 w-[200px] md:w-[240px] aspect-square"
             style={{ animation: "splash-in 0.8s var(--ease-out-expo) both" }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md"
              style={{
                background: i === 4
                  ? "var(--signature-gradient)"
                  : "rgba(255,255,255,0.06)",
                border: i === 4 ? "none" : "1px solid rgba(255,255,255,0.10)",
                boxShadow: i === 4 ? "var(--shadow-gold)" : "none",
              }}
            />
          ))}
        </div>
        <div className="text-center mt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--gold-bright)]"
             style={{ animation: "fade-in 0.8s ease 0.6s both" }}>
          The verb matrix
        </div>
      </div>
    </div>
  );
}

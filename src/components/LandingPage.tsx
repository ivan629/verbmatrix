import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTargetLanguage } from "../context/TargetLanguage";
import { BRAND, PRICING, getPricing, trackEvent, type LanguagePricing } from "../config";
import { useAccess } from "../context/Access";
import { LicenseKeyModal } from "./LicenseKeyModal";
import { useScrollReveal, useScrollRevealChildren } from "../lib/useScrollReveal";
import { useTTS } from "../lib/tts";
import { ThemeToggle } from "./ThemeToggle";
import { CinematicMatrix } from "./CinematicMatrix";
import {
  CountdownTimer, MagneticButton, PageCurl, DrawMatrix,
  HoverPhonetic, StrikeText, CircledText,
} from "./wow-effects";
import {
  MatrixMark, TypographicSeal, Asterism, SoundWave,
  DayProgression, LanguageOrb, OpenBook, Chevron, QuoteMark,
  DecorativeNumber, FloatingVerbCard, FloatingMatrixCell,
  FloatingDialogue, FloatingAudioPlayer, FloatingVocabCard,
  AuroraOrbs,
} from "./illustrations";

// ─── Cursor-following gold orb (hero only) ───────────────────────

function CursorOrb() {
  const orbRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only enable on desktop with a fine pointer (mouse)
    const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(desktop && !reduceMotion);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let rafId: number;
    let lastUpdate = 0;
    const tick = (now: number) => {
      // Throttle to 60fps cap (browser does this anyway, but explicit)
      if (now - lastUpdate >= 16) {
        currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.08;
        currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.08;
        if (orbRef.current) {
          orbRef.current.style.transform = `translate3d(${currentRef.current.x - 200}px, ${currentRef.current.y - 200}px, 0)`;
        }
        lastUpdate = now;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={orbRef} className="pointer-events-none fixed top-0 left-0 z-0 hidden lg:block"
      style={{
        width: 400, height: 400,
        background: "radial-gradient(circle, rgba(244,190,122,0.10), transparent 70%)",
        filter: "blur(40px)",
        willChange: "transform",
      }}
    />
  );
}

// ─── Animated counter ────────────────────────────────────────────

function AnimatedCounter({ to, suffix = "", duration = 1500 }: { to: number; suffix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(to * eased));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{value}{suffix}</span>;
}

// ─── Demo verbs for the interactive matrix ──────────────────────

const DEMO_VERBS = [
  { infinitive: "a vorbi", en: "to speak", cells: [
    ["O să vorbesc?", "Eu o să vorbesc.", "N-o să vorbesc."],
    ["Vorbesc eu?", "Eu vorbesc.", "Eu nu vorbesc."],
    ["Am vorbit eu?", "Eu am vorbit.", "Nu am vorbit."],
  ]},
  { infinitive: "a face", en: "to do", cells: [
    ["O să fac?", "Eu o să fac.", "N-o să fac."],
    ["Fac eu?", "Eu fac.", "Eu nu fac."],
    ["Am făcut eu?", "Eu am făcut.", "Nu am făcut."],
  ]},
  { infinitive: "a merge", en: "to go", cells: [
    ["O să merg?", "Eu o să merg.", "N-o să merg."],
    ["Merg eu?", "Eu merg.", "Eu nu merg."],
    ["Am mers eu?", "Eu am mers.", "Nu am mers."],
  ]},
];

function InteractiveMatrix({ dark = false }: { dark?: boolean }) {
  const { t } = useTranslation();
  const [verbIdx, setVerbIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const verb = DEMO_VERBS[verbIdx];

  const cycleVerb = useCallback(() => {
    setVerbIdx((i) => (i + 1) % DEMO_VERBS.length);
    setAnimKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const timer = setInterval(cycleVerb, 6500);
    return () => clearInterval(timer);
  }, [cycleVerb]);

  const tenseLabels = [t("landing_grid_future"), t("landing_grid_present"), t("landing_grid_past")];
  const colSymbols = ["?", "+", "−"];
  const colSemantics = ["question", "affirm", "neg"] as const;

  return (
    <div className="w-full max-w-[520px] mx-auto">
      <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
        {DEMO_VERBS.map((v, i) => (
          <button
            key={v.infinitive}
            onClick={() => { setVerbIdx(i); setAnimKey((k) => k + 1); }}
            className={`
              font-mono text-[0.74rem] px-3 py-1.5 rounded-full transition-all duration-300
              ${i === verbIdx
                ? "bg-[var(--gold)] text-white shadow-lg"
                : dark
                  ? "text-[var(--ink-3)] hover:text-[var(--ink)] bg-white/5 hover:bg-white/10 backdrop-blur"
                  : "text-[var(--ink-3)] hover:text-[var(--ink)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"
              }
            `}
          >
            {v.infinitive}
          </button>
        ))}
      </div>

      <div className={`relative rounded-[var(--radius-lg)] border overflow-hidden ${
        dark ? "glass border-white/10" : "bg-[var(--surface)] border-[var(--border)] shadow-soft"
      }`}>
        <span className={`absolute top-2 left-2 font-mono text-[9px] ${dark ? "text-white/30" : "text-[var(--ink-5)]"}`}>+</span>
        <span className={`absolute top-2 right-2 font-mono text-[9px] ${dark ? "text-white/30" : "text-[var(--ink-5)]"}`}>+</span>
        <span className={`absolute bottom-2 left-2 font-mono text-[9px] ${dark ? "text-white/30" : "text-[var(--ink-5)]"}`}>+</span>
        <span className={`absolute bottom-2 right-2 font-mono text-[9px] ${dark ? "text-white/30" : "text-[var(--ink-5)]"}`}>+</span>

        <div className={`grid grid-cols-[70px_1fr_1fr_1fr] border-b ${dark ? "border-white/10" : "border-[var(--border)]"}`}>
          <div className={dark ? "bg-white/5" : "bg-[var(--surface-2)]"} />
          {colSymbols.map((s, i) => (
            <div key={s}
              className={`py-2.5 px-2 sm:px-3 text-center font-mono text-[10px] uppercase tracking-[0.14em] font-semibold border-l text-[var(--${colSemantics[i]})] ${dark ? "border-white/10" : "border-[var(--border)]"}`}>
              <span className="hidden sm:inline">{s} </span>
              <span>{t(["matrix_col_question","matrix_col_affirmative","matrix_col_negative"][i])}</span>
            </div>
          ))}
        </div>

        <div key={animKey} className="matrix-stagger revealed">
          {tenseLabels.map((tense, row) => (
            <div key={tense} className={`grid grid-cols-[70px_1fr_1fr_1fr] border-b last:border-b-0 ${dark ? "border-white/10" : "border-[var(--border)]"}`}>
              <div className={`py-3.5 px-3 font-mono text-[9px] uppercase tracking-[0.12em] flex items-center ${dark ? "bg-white/5 text-white/50" : "bg-[var(--surface-2)] text-[var(--ink-4)]"}`}>
                {tense}
              </div>
              {verb.cells[row].map((text, col) => (
                <div
                  key={`${row}-${col}`}
                  className={`py-3.5 px-2 sm:px-3 font-mono text-[0.7rem] sm:text-[0.78rem] text-[var(--${colSemantics[col]})] border-l cell-transition leading-tight ${dark ? "border-white/10 bg-white/[0.02]" : "border-[var(--border)] bg-[var(--surface)]"}`}
                >
                  {text}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <p className={`text-center font-mono text-[10px] uppercase tracking-[0.16em] mt-4 ${dark ? "text-white/40" : "text-[var(--ink-4)]"}`}>
        <span className={dark ? "text-white/60" : "text-[var(--ink-3)]"}>{verb.infinitive}</span> — {verb.en}
      </p>
    </div>
  );
}

// ─── FAQ ────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  { q: "landing_faq_1_q", a: "landing_faq_1_a" },
  { q: "landing_faq_2_q", a: "landing_faq_2_a" },
  { q: "landing_faq_3_q", a: "landing_faq_3_a" },
  { q: "landing_faq_4_q", a: "landing_faq_4_a" },
  { q: "landing_faq_5_q", a: "landing_faq_5_a" },
] as const;

function FAQItem({ q, a, num }: { q: string; a: string; num: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border)] last:border-b-0 group">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full text-left py-6 flex items-start gap-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-4)] mt-1.5 shrink-0 w-6">{num}</span>
        <span className="flex-1 font-display text-[1.05rem] sm:text-[1.15rem] text-[var(--ink)] leading-snug group-hover:text-[var(--gold)] transition-colors">
          {t(q)}
        </span>
        <Chevron open={open} className="text-[var(--ink-3)] mt-2 shrink-0" />
      </button>
      {open && (
        <div className="pb-6 pl-11 -mt-2 text-[0.95rem] text-[var(--ink-2)] leading-[1.7] max-w-[620px] fade-in">
          {t(a)}
        </div>
      )}
    </div>
  );
}

// ─── Language Card ──────────────────────────────────────────────

function LanguageCard({ lang, pricing, isCurrent, comingSoon, onSelect, onActivate, hasAccess }: {
  lang: { code: string; label: string; heroExample: { text: string; en: string } };
  pricing: LanguagePricing;
  isCurrent: boolean;
  comingSoon: boolean;
  onSelect: () => void;
  onActivate: () => void;
  hasAccess: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={`relative flex flex-col h-full bg-[var(--surface)] border rounded-[var(--radius-lg)] p-7 md:p-8 card-hover overflow-hidden ${
      comingSoon ? "border-[var(--border)] opacity-50 pointer-events-none"
      : isCurrent ? "border-[var(--gold)] shadow-soft" : "border-[var(--border)]"
    }`}>
      <div className="flex items-start justify-between mb-6">
        <LanguageOrb code={lang.code} size={64} className="text-[var(--ink-3)]" />
        <div className="flex flex-col items-end gap-1.5">
          {hasAccess && (
            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--affirm)] flex items-center gap-1.5 bg-[var(--affirm-bg)] px-2 py-1 rounded-full">
              <span aria-hidden="true">✓</span> {t("landing_owned")}
            </span>
          )}
          {isCurrent && !hasAccess && (
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--gold)] flex items-center gap-1.5">
              <span aria-hidden="true" className="marker-dot" /> {t("picker_current")}
            </span>
          )}
          {comingSoon && (
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-4)]">{t("landing_coming_soon")}</span>
          )}
        </div>
      </div>

      <div className="font-display text-[1.6rem] text-[var(--ink)] tracking-tight leading-tight mb-1">{lang.label}</div>
      <div className="font-display italic text-[1.05rem] text-[var(--gold)] leading-tight">"{lang.heroExample.text}"</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-4)] mt-1.5 mb-6">
        {t(lang.heroExample.en, { defaultValue: lang.heroExample.en })}
      </div>

      <div className="flex-1" />

      <div className="pt-5 border-t border-[var(--border)]">
        {comingSoon ? (
          <div className="font-mono text-[11px] text-[var(--ink-4)] uppercase tracking-[0.12em] text-center py-2">
            {t("landing_notify_soon")}
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between mb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-3)]">
                {t("landing_lifetime_access")}
              </span>
              <span className="font-display text-[1.4rem] text-[var(--ink)] font-medium tracking-tight">
                {pricing.priceFormatted}
              </span>
            </div>
            {hasAccess ? (
              <button type="button" onClick={onSelect} className="btn-tactile w-full">
                {t("landing_open_course")} →
              </button>
            ) : (
              <div className="flex gap-2">
                <button type="button"
                  onClick={() => {
                    trackEvent("purchase-click", { language: lang.code, price: pricing.price });
                    if (pricing.checkoutUrl) window.open(pricing.checkoutUrl, "_blank");
                  }}
                  className="btn-tactile flex-1">
                  {t("landing_get_access")}
                </button>
                <button type="button" onClick={onActivate}
                  className="px-4 rounded-[var(--radius)] border border-[var(--border)] text-[var(--ink-3)] font-mono text-[11px] uppercase tracking-[0.1em] hover:border-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
                  title={t("landing_have_key")}>
                  Key
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Landing Page ──────────────────────────────────────────

export function LandingPage() {
  const { t } = useTranslation();
  const { available, setCode, lastPickedCode } = useTargetLanguage();
  const { hasAccess } = useAccess();
  const [keyModal, setKeyModal] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [annotationsActive, setAnnotationsActive] = useState(false);

  // Annotations fire 1.6s after mount (after headline reveal-blur completes)
  useEffect(() => {
    const t = setTimeout(() => setAnnotationsActive(true), 1600);
    return () => clearTimeout(t);
  }, []);

  // Scroll progress for nav background fade (rAF-throttled)
  useEffect(() => {
    let rafPending = false;
    const compute = () => {
      rafPending = false;
      const scrolled = window.scrollY;
      setScrollProgress(Math.min(scrolled / 100, 1));
    };
    const handler = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(compute);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Pause heavy animations when tab is hidden — saves battery
  useEffect(() => {
    const onVisibilityChange = () => {
      document.documentElement.style.setProperty(
        "--play-state",
        document.hidden ? "paused" : "running"
      );
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const problemRef = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const methodRef = useScrollRevealChildren();
  const timelineRef = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const insideRef = useScrollRevealChildren();
  const langRef = useScrollRevealChildren();
  const faqRef = useScrollReveal<HTMLDivElement>();

  // TTS for interactive floating UI
  const speak = useTTS();
  const handlePlay = useCallback((text: string) => {
    speak(text);
  }, [speak]);

  const comingSoonCodes = useMemo(
    () => Object.keys(PRICING).filter((code) => code !== "all" && !available.some((l) => l.code === code)),
    [available],
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] paper-grain relative">

      {/* Cursor-following gold orb (desktop only) */}
      <CursorOrb />

      {/* ════════ STICKY NAV ════════ */}
      <header
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          background: `color-mix(in srgb, #08080a ${scrollProgress * 70}%, transparent)`,
          backdropFilter: scrollProgress > 0.1 ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrollProgress > 0.1 ? "blur(20px)" : "none",
          borderBottom: scrollProgress > 0.1 ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <MatrixMark size={26} />
            <div className="font-display text-[1.05rem] tracking-tight leading-none font-medium">
              {BRAND.name}
              <span className="text-white/50 ml-1.5 font-normal italic">{BRAND.suffix}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-5">
            <a href="#languages" className="hidden sm:inline-flex font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/60 hover:text-white transition-colors py-2">
              {t("landing_nav_try")}
            </a>
            <a href="#languages" className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-black bg-white px-4 py-2.5 rounded-full font-semibold btn-lift">
              {t("landing_get_access")}
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">

        {/* ════════ HERO — DARK THEATRICAL ════════ */}
        <section className="scope-dark bg-noir relative overflow-hidden pt-32 md:pt-40 pb-32 md:pb-40 px-5 md:px-12">
          <AuroraOrbs tone="gold" />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />

          <div className="max-w-[1200px] mx-auto relative">

            {/* Status indicator (Linear-style) */}
            <div className="flex items-center justify-between mb-12 md:mb-16">
              <div className="flex items-center gap-2.5 text-white/40 font-mono text-[10px] uppercase tracking-[0.18em]">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--gold)]"
                  style={{
                    animation: "countdown-pulse 1.6s ease-in-out infinite",
                    boxShadow: "0 0 6px rgba(244,190,122,0.4)",
                  }}
                />
                {t("landing_hero_status")}
              </div>
              <div className="hidden md:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                <span>{t("landing_hero_meta")}</span>
                <span>·</span>
                <span>v2026</span>
              </div>
            </div>

            {/* HUGE HEADLINE — editorial annotations.
                Structure: each line is its own block. The reveal-blur animation
                only animates opacity + scale (no translation), so the SVG strike
                and circle measure positions remain stable. */}
            <h1 className="font-display text-white font-light tracking-[-0.04em] leading-[1.05]
                           text-[clamp(2.6rem,8.5vw,6.6rem)]
                           max-w-[1100px] mb-12 md:mb-16">
              <span className="block reveal-blur revealed" style={{ animationDelay: "0.1s" }}>
                <span>Stop </span>
                <StrikeText active={annotationsActive} delay={0.2}>studying.</StrikeText>
              </span>
              <span className="block reveal-blur revealed text-shimmer font-display-wonk"
                style={{ animationDelay: "0.4s" }}>
                <span>Start </span>
                <CircledText active={annotationsActive} delay={0.6}>speaking.</CircledText>
              </span>
              <span className="block reveal-blur revealed text-white/75 italic font-display-wonk mt-3
                               text-[clamp(1.7rem,5.5vw,4rem)]"
                style={{ animationDelay: "0.7s" }}>
                From day one.
              </span>
            </h1>

            {/* Subtle countdown nestled below — concrete proof */}
            <div className="mb-12 md:mb-14 reveal-blur revealed" style={{ animationDelay: "1.0s" }}>
              <CountdownTimer />
            </div>

            {/* Asymmetric two-column: subtitle left, matrix demo right */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_540px] gap-12 lg:gap-20 items-start">

              {/* Left: subtitle + CTAs + floating UI scattered */}
              <div className="relative">
                <p className="text-[clamp(1.1rem,1.6vw,1.3rem)] text-white/70 leading-[1.5] mb-10 max-w-[480px] reveal-blur revealed"
                   style={{ animationDelay: "1.2s" }}>
                  {t("landing_hero_subtitle")}
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-3 reveal-blur revealed"
                     style={{ animationDelay: "1.4s" }}>
                  <MagneticButton strength={0.25} className="w-full sm:w-auto">
                    <a href="#languages" className="btn-tactile btn-gold w-full sm:w-auto">
                      {t("landing_cta_primary")} <span aria-hidden="true">→</span>
                    </a>
                  </MagneticButton>
                  <MagneticButton strength={0.2} className="w-full sm:w-auto">
                    <a href="#method" className="btn-glass w-full sm:w-auto">
                      {t("landing_cta_secondary")}
                    </a>
                  </MagneticButton>
                </div>

                <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 flex items-center gap-3 reveal-blur revealed"
                     style={{ animationDelay: "1.6s" }}>
                  <span className="marker-dot bg-[var(--gold)]" />
                  <span>{t("landing_hero_trust")}</span>
                </div>

                {/* Floating UI scattered around — hidden on small screens */}
                <div className="hidden lg:block absolute -bottom-32 -left-12 float-1 reveal-blur revealed pointer-events-none" style={{ animationDelay: "1.8s" }}>
                  <FloatingAudioPlayer onPlay={handlePlay} />
                </div>
              </div>

              {/* Right: matrix demo with floating UI around it */}
              <div className="relative">
                <div className="reveal-blur revealed" style={{ animationDelay: "1.0s" }}>
                  <InteractiveMatrix dark />
                </div>

                {/* Floating product UI — desktop only */}
                <div className="hidden lg:block absolute -top-10 -right-12 float-2 reveal-blur revealed pointer-events-none" style={{ animationDelay: "1.6s" }}>
                  <FloatingVerbCard onPlay={handlePlay} />
                </div>
                <div className="hidden lg:block absolute -bottom-16 -left-20 float-3 reveal-blur revealed pointer-events-none" style={{ animationDelay: "2.0s" }}>
                  <FloatingDialogue onPlay={handlePlay} />
                </div>
              </div>
            </div>

            {/* Bottom-edge tiny editorial marks */}
            <div className="mt-24 md:mt-32 flex items-center justify-between text-white/30 font-mono text-[9.5px] uppercase tracking-[0.2em]">
              <span>■ {t("landing_hero_corner_1")}</span>
              <span className="hidden md:inline">{t("landing_hero_corner_2")}</span>
              <span>□ {t("landing_hero_corner_3")}</span>
            </div>
          </div>

        </section>

        {/* Page-curl transition from dark hero to cream */}
        <div className="-mb-px"><PageCurl direction="down" fromColor="#07060a" toColor="#f5f1e7" /></div>

        {/* ════════ PROBLEM — CREAM, PULL QUOTE ════════ */}
        <section ref={problemRef} className="scope-cream reveal bg-watercolor relative px-5 md:px-12 py-28 md:py-40">
          <div className="max-w-[860px] mx-auto text-center relative">
            <QuoteMark className="mx-auto mb-6" />
            <blockquote className="font-display italic font-light text-[clamp(1.6rem,3.6vw,2.6rem)] leading-[1.25] tracking-[-0.02em] text-[var(--ink)]"
                        style={{ fontVariationSettings: '"SOFT" 100, "WONK" 0' }}>
              {t("landing_problem_quote")}
            </blockquote>
            <div className="mt-10 flex items-center justify-center gap-3 text-[var(--ink-3)]">
              <span className="w-12 h-px bg-[var(--ink-4)]" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.2em]">
                {t("landing_problem_attribution")}
              </span>
              <span className="w-12 h-px bg-[var(--ink-4)]" />
            </div>
          </div>
        </section>

        {/* ════════ THE CINEMATIC MOMENT — SCROLL-DRIVEN ════════ */}
        {/* This is the holy-shit section. Pinned scroll, transforming
            visual that morphs from 1 word → 9 cells → 32 verbs → 500
            vocab words → the brand mark. Five stages over 5 viewport
            heights of scroll. */}
        <CinematicMatrix />

        {/* ════════ METHOD — CREAM, NUMBERED EDITORIAL ════════ */}
        <section id="method" ref={methodRef} className="scope-cream relative px-5 md:px-12 py-24 md:py-32 scroll-mt-16 border-t border-[var(--border)]">
          <div className="max-w-[1100px] mx-auto relative">
            <div className="reveal mb-20 md:mb-28 text-center">
              <div className="eyebrow mb-5">§ {t("landing_method_kicker")}</div>
              <h2 className="font-display text-[clamp(2.2rem,4.8vw,3.6rem)] font-light text-[var(--ink)] tracking-[-0.03em] leading-[1.04] max-w-[760px] mx-auto">
                {t("landing_method_title_part1")}{" "}
                <span className="font-display-wonk text-gradient-gold">{t("landing_method_title_part2")}</span>
              </h2>
            </div>

            <div className="space-y-20 md:space-y-32">
              {[
                { num: "01", title: "landing_method_1_title", body: "landing_method_1_body" },
                { num: "02", title: "landing_method_2_title", body: "landing_method_2_body" },
                { num: "03", title: "landing_method_3_title", body: "landing_method_3_body" },
              ].map((step, i) => (
                <div key={step.num}
                  className={`reveal grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 md:gap-16 items-start ${
                    i === 1 ? "md:pl-20 lg:pl-40" : i === 2 ? "md:pl-10 lg:pl-20" : ""
                  }`}>
                  <DecorativeNumber num={step.num} />
                  <div className="md:pt-6">
                    <h3 className="font-display text-[1.6rem] md:text-[2.1rem] text-[var(--ink)] tracking-[-0.025em] leading-[1.1] mb-5">
                      {t(step.title)}
                    </h3>
                    <p className="text-[1.05rem] text-[var(--ink-2)] leading-[1.7] measure">
                      {t(step.body)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ TIMELINE — CREAM with animated counters ════════ */}
        <section ref={timelineRef} className="scope-cream reveal px-5 md:px-12 py-24 md:py-32 relative overflow-hidden">
          {/* Subtle aurora behind */}
          <div className="absolute inset-0 pointer-events-none opacity-50">
            <AuroraOrbs tone="warm" />
          </div>

          <div className="max-w-[1000px] mx-auto relative">
            <div className="text-center mb-14">
              <div className="eyebrow mb-5">{t("landing_timeline_kicker")}</div>
              <h2 className="font-display text-[clamp(1.9rem,4vw,2.8rem)] font-light text-[var(--ink)] tracking-[-0.025em] leading-[1.08] max-w-[680px] mx-auto">
                {t("landing_timeline_title")}
              </h2>
            </div>

            {/* Animated counters — fire when scrolled into view */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-20">
              {[
                { num: 5, suffix: " min", label: "to your first sentence" },
                { num: 32, suffix: "", label: "structured days" },
                { num: 32, suffix: "", label: "core verbs" },
                { num: 500, suffix: "+", label: "vocabulary words" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="display-numeral font-display text-[clamp(2.6rem,5vw,3.8rem)] text-[var(--gold)] mb-2">
                    <AnimatedCounter to={s.num} suffix={s.suffix} duration={1400 + i * 200} />
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-3)]">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full overflow-x-auto pb-4 -mx-5 px-5 md:mx-0 md:px-0">
              <DayProgression className="min-w-[560px] w-full h-[100px] block mx-auto" />
            </div>

            <p className="text-center mt-12 text-[1rem] text-[var(--ink-3)] italic font-display max-w-[560px] mx-auto leading-[1.6]"
               style={{ fontVariationSettings: '"SOFT" 100' }}>
              {t("landing_timeline_caption")}
            </p>
          </div>
        </section>

        {/* Marquee divider — text streaming horizontally */}
        <div className="scope-cream py-10 border-t border-b border-[var(--border)] overflow-hidden relative">
          <div className="marquee">
            <div className="marquee-track flex items-center gap-8 font-display italic text-[1.4rem] md:text-[1.8rem] text-[var(--ink-3)]"
                 style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
              {Array.from({ length: 2 }).map((_, dupe) => (
                <div key={dupe} className="flex items-center gap-8 px-4">
                  <span>vorbesc</span>
                  <span className="marker-dot" />
                  <span>I speak</span>
                  <span className="marker-dot" />
                  <span>am vorbit</span>
                  <span className="marker-dot" />
                  <span>I spoke</span>
                  <span className="marker-dot" />
                  <span>o să vorbesc</span>
                  <span className="marker-dot" />
                  <span>I will speak</span>
                  <span className="marker-dot" />
                  <span>vorbește!</span>
                  <span className="marker-dot" />
                  <span>speak!</span>
                  <span className="marker-dot" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page-curl transition from cream marquee to dark "Inside" */}
        <div className="-mb-px"><PageCurl direction="down" fromColor="#f5f1e7" toColor="#07060a" /></div>

        {/* ════════ WHAT'S INSIDE — DARK MASTERPIECE ════════ */}
        <section ref={insideRef} className="scope-dark relative cv-auto px-5 md:px-12 py-32 md:py-40 overflow-hidden">
          <AuroraOrbs tone="gold" />
          <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />

          <div className="max-w-[1100px] mx-auto relative">
            <div className="reveal text-center mb-20">
              <OpenBook className="mx-auto mb-6 text-white/40" />
              <div className="eyebrow mb-4">{t("landing_includes_kicker")}</div>
              <h2 className="font-display text-[clamp(2rem,4.4vw,3.4rem)] font-light text-white tracking-[-0.03em] leading-[1.05]">
                {t("landing_includes_title")}
              </h2>
            </div>

            {/* Two-column: editorial TOC + floating UI showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-14 lg:gap-20 items-start">

              {/* TOC */}
              <ol className="divide-y divide-white/10">
                {[
                  { ch: "I", title: "landing_includes_matrix", desc: "landing_includes_matrix_desc" },
                  { ch: "II", title: "landing_includes_verbs", desc: "landing_includes_verbs_desc" },
                  { ch: "III", title: "landing_includes_vocab", desc: "landing_includes_vocab_desc" },
                  { ch: "IV", title: "landing_includes_dialogues", desc: "landing_includes_dialogues_desc" },
                  { ch: "V", title: "landing_includes_audio", desc: "landing_includes_audio_desc" },
                  { ch: "VI", title: "landing_includes_plan", desc: "landing_includes_plan_desc" },
                ].map((item) => (
                  <li key={item.ch} className="reveal py-6 grid grid-cols-[40px_1fr] gap-5 items-baseline">
                    <span className="font-display italic text-[var(--gold)] text-[1.2rem]">§ {item.ch}</span>
                    <div>
                      <div className="font-display text-[1.15rem] md:text-[1.3rem] text-white tracking-tight leading-snug mb-1">
                        {t(item.title)}
                      </div>
                      <div className="text-[0.92rem] text-white/55 leading-[1.6]">
                        {t(item.desc, { defaultValue: "" })}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Floating product UI stack */}
              <div className="relative hidden lg:block min-h-[500px]">
                <div className="absolute top-0 right-8 float-1">
                  <FloatingVerbCard onPlay={handlePlay} />
                </div>
                <div className="absolute top-40 -left-8 float-2">
                  <FloatingMatrixCell onPlay={handlePlay} />
                </div>
                <div className="absolute top-72 right-0 float-3">
                  <FloatingVocabCard onPlay={handlePlay} />
                </div>
                <div className="absolute bottom-0 left-4 float-1" style={{ animationDelay: "2s" }}>
                  <FloatingDialogue onPlay={handlePlay} />
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* Page-curl transition from dark "inside" to cream "languages" */}
        <div className="-mb-px"><PageCurl direction="down" fromColor="#07060a" toColor="#f5f1e7" /></div>

        {/* ════════ LANGUAGES — CREAM ════════ */}
        <section id="languages" ref={langRef} className="scope-cream relative cv-auto px-5 md:px-12 py-24 md:py-32 scroll-mt-16">
          <div className="max-w-[1100px] mx-auto">
            <div className="reveal text-center mb-16">
              <div className="eyebrow mb-5">{t("landing_languages_kicker")}</div>
              <h2 className="font-display text-[clamp(2rem,4.4vw,3.4rem)] font-light text-[var(--ink)] tracking-[-0.03em] leading-[1.05] mb-5">
                {t("landing_languages_title")}
              </h2>
              <p className="text-[1.05rem] text-[var(--ink-2)] max-w-[560px] mx-auto leading-[1.65]">
                {t("landing_languages_subtitle")}
              </p>
            </div>

            <ul className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-[920px] mx-auto">
              {available.map((lang) => (
                <li key={lang.code} className="reveal">
                  <LanguageCard
                    lang={lang} pricing={getPricing(lang.code)}
                    isCurrent={lang.code === lastPickedCode} comingSoon={false}
                    onSelect={() => setCode(lang.code)}
                    onActivate={() => setKeyModal(lang.code)}
                    hasAccess={hasAccess(lang.code)}
                  />
                </li>
              ))}
              {comingSoonCodes.map((code) => (
                <li key={code} className="reveal">
                  <div className="relative flex flex-col h-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-7 md:p-8 opacity-40 min-h-[300px]">
                    <div className="flex items-start justify-between mb-6">
                      <LanguageOrb code={code} size={64} className="text-[var(--ink-4)]" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-4)]">{t("landing_coming_soon")}</span>
                    </div>
                    <div className="font-display text-[1.6rem] text-[var(--ink-3)] tracking-tight italic">
                      {t(`landing_lang_${code}`, { defaultValue: code.toUpperCase() })}
                    </div>
                    <div className="flex-1" />
                    <div className="pt-5 border-t border-[var(--border)] flex items-baseline justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-4)]">{t("landing_lifetime_access")}</span>
                      <span className="font-display text-[1.4rem] text-[var(--ink-4)]">{getPricing(code).priceFormatted}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* All-access bundle */}
            <div className="mt-14 max-w-[720px] mx-auto reveal">
              <div className="relative bg-[#0c0c0e] text-white rounded-[var(--radius-xl)] p-10 md:p-14 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.06]" style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                  backgroundSize: "20px 20px",
                }} />
                <AuroraOrbs tone="gold" />
                <div className="relative">
                  <div className="flex items-center gap-2.5 mb-5">
                    <MatrixMark size={22} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
                      {t("landing_bundle_kicker")}
                    </span>
                  </div>
                  <h3 className="font-display text-[clamp(1.7rem,3.4vw,2.4rem)] font-light tracking-[-0.025em] leading-[1.05] mb-5 max-w-[440px]">
                    {t("landing_bundle_title")}
                  </h3>
                  <p className="text-[0.98rem] opacity-75 mb-8 leading-[1.65] max-w-[440px]">
                    {t("landing_bundle_body")}
                  </p>
                  <div className="flex items-center justify-between gap-6 flex-wrap">
                    <div>
                      <div className="font-display text-[3rem] font-light leading-none tracking-[-0.04em]">{PRICING.all.priceFormatted}</div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-60 mt-1.5">
                        {t("landing_lifetime_access")}
                      </div>
                    </div>
                    <MagneticButton strength={0.25} className="inline-block">
                      <button type="button"
                        onClick={() => {
                          trackEvent("purchase-click", { language: "all", price: PRICING.all.price });
                          if (PRICING.all.checkoutUrl) window.open(PRICING.all.checkoutUrl, "_blank");
                        }}
                        className="btn-tactile btn-gold">
                        {t("landing_get_access")} →
                      </button>
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════ GUARANTEE ════════ */}
        <section className="scope-cream px-5 md:px-12 py-16 md:py-24">
          <div className="max-w-[620px] mx-auto text-center">
            <Asterism className="!my-0 !mb-7" />
            <div className="eyebrow mb-5">{t("landing_guarantee_kicker")}</div>
            <p className="font-display italic font-light text-[1.15rem] md:text-[1.3rem] text-[var(--ink)] leading-[1.55]"
               style={{ fontVariationSettings: '"SOFT" 100' }}>
              {t("landing_guarantee_body")}
            </p>
          </div>
        </section>

        {/* ════════ FAQ ════════ */}
        <section ref={faqRef} className="scope-cream reveal cv-auto px-5 md:px-12 py-24 border-t border-[var(--border)]">
          <div className="max-w-[800px] mx-auto">
            <div className="text-center mb-14">
              <div className="eyebrow mb-4">{t("landing_faq_kicker")}</div>
              <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-light text-[var(--ink)] tracking-tight">
                {t("landing_faq_title")}
              </h2>
            </div>
            <div>
              {FAQ_ITEMS.map((item, i) => (
                <FAQItem key={item.q} q={item.q} a={item.a} num={String(i + 1).padStart(2, "0")} />
              ))}
            </div>
          </div>
        </section>

        {/* Page-curl transition from cream FAQ to dark final CTA */}
        <div className="-mb-px"><PageCurl direction="down" fromColor="#f5f1e7" toColor="#07060a" /></div>

        {/* ════════ FINAL CTA — DARK CRESCENDO ════════ */}
        <section className="scope-dark bg-noir relative cv-auto px-5 md:px-12 py-32 md:py-44 overflow-hidden">
          <AuroraOrbs tone="gold" />
          <div className="max-w-[840px] mx-auto text-center relative">
            <h2 className="font-display text-white text-[clamp(2.4rem,6vw,4.4rem)] font-light tracking-[-0.035em] leading-[1.02] mb-8">
              {t("landing_final_cta_title")}{" "}
              <span className="font-display-wonk text-shimmer">{t("landing_final_cta_emphasis")}</span>
            </h2>
            <p className="text-[1.08rem] text-white/65 mb-12 max-w-[520px] mx-auto leading-[1.65]">
              {t("landing_final_cta_subtitle")}
            </p>
            <MagneticButton strength={0.3} className="inline-block">
              <a href="#languages" className="btn-tactile btn-gold inline-flex">
                {t("landing_cta_primary")} <span aria-hidden="true">→</span>
              </a>
            </MagneticButton>
          </div>
        </section>
      </main>

      {/* ════════ FOOTER ════════ */}
      <footer className="scope-dark relative cv-auto px-5 md:px-12 py-16 border-t border-white/10">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-12 mb-12">
            <div>
              <TypographicSeal size={100} className="text-white/80 mb-5" />
              <p className="font-display italic text-white/60 text-[0.95rem] max-w-[280px] leading-snug"
                 style={{ fontVariationSettings: '"SOFT" 100' }}>
                {BRAND.tagline}
              </p>
            </div>
            <div className="flex flex-wrap items-start gap-x-8 gap-y-4 font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/50">
              <button type="button" onClick={() => setKeyModal("all")}
                className="hover:text-white transition-colors">
                {t("landing_footer_activate")}
              </button>
              <a href="#terms" className="hover:text-white transition-colors">{t("landing_footer_terms")}</a>
              <a href="#privacy" className="hover:text-white transition-colors">{t("landing_footer_privacy")}</a>
              <a href={`mailto:${BRAND.contactEmail}`} className="hover:text-white transition-colors">{t("landing_footer_contact")}</a>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
            <span className="font-mono text-[10px] text-white/40">
              © {BRAND.launchYear} {BRAND.name}. {t("landing_footer_rights")}
            </span>
            <span className="font-mono text-[10px] text-white/40 italic">
              {t("landing_footer_made")}
            </span>
          </div>
        </div>
      </footer>

      {keyModal && <LicenseKeyModal languageCode={keyModal} onClose={() => setKeyModal(null)} />}
    </div>
  );
}

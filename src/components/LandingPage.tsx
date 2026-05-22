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
  MatrixMark, LanguageOrb, Chevron, DayProgression,
  CrossHair,
} from "./illustrations";

/* ═══════════════════════════════════════════════════════════════════════
   v4 — DISTINCT SECTIONS, CLEAN VISUAL LANGUAGE
   ───────────────────────────────────────────────────────────────────────
   Each section has its own visual signature while staying credible:
     1. Hero          — Dark + growing tree-line backdrop + glass demo
     2. Cinematic     — Dark scroll-driven (signature moment)
     3. Method        — Manuscript margin (left rule + drop number)
     4. Timeline      — Stat tiles with gradient underline
     5. Includes      — Spec-sheet items with crosshairs
     6. Testimonials  — Premium glass cards with avatars
     7. Languages     — Card grid + featured dark bundle panel
     8. Guarantee     — Centered seal moment
     9. FAQ           — Clean expandable list
     10. Final CTA    — Dark + growing tree-line backdrop (bookend)
   ═══════════════════════════════════════════════════════════════════════ */

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

const AUTO_CYCLE_MS = 8500;
const AUTO_RESUME_DELAY = 20_000;

function InteractiveMatrix({ dark = false }: { dark?: boolean }) {
  const { t } = useTranslation();
  const [verbIdx, setVerbIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);
  const lastInteractionRef = useRef(0);
  const verb = DEMO_VERBS[verbIdx];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          isVisibleRef.current = entry.isIntersecting;
        },
        { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isVisibleRef.current) return;
      if (performance.now() - lastInteractionRef.current < AUTO_RESUME_DELAY) return;
      setVerbIdx((i) => (i + 1) % DEMO_VERBS.length);
      setAnimKey((k) => k + 1);
    }, AUTO_CYCLE_MS);
    return () => clearInterval(timer);
  }, []);

  const handleVerbClick = useCallback((i: number) => {
    lastInteractionRef.current = performance.now();
    setVerbIdx(i);
    setAnimKey((k) => k + 1);
  }, []);

  if (!verb) return null;

  const tenseLabels = [t("landing_grid_future"), t("landing_grid_present"), t("landing_grid_past")];
  const colSymbols = ["?", "+", "−"];
  const colSemantics = ["question", "affirm", "neg"] as const;

  return (
      <div ref={containerRef} className="w-full max-w-[520px] mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          {DEMO_VERBS.map((v, i) => (
              <button
                  key={v.infinitive}
                  type="button"
                  onClick={() => handleVerbClick(i)}
                  className={`font-mono text-[0.74rem] px-3 py-1.5 rounded-full transition-all duration-200 ${
                      i === verbIdx
                          ? (dark ? "bg-white text-black" : "bg-[var(--ink)] text-[var(--bg)]")
                          : (dark
                              ? "text-white/55 hover:text-white bg-white/5 hover:bg-white/10"
                              : "text-[var(--ink-3)] hover:text-[var(--ink)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)]")
                  }`}
              >
                {v.infinitive}
              </button>
          ))}
        </div>

        <div className={`relative rounded-[var(--radius-lg)] border overflow-hidden ${
            dark ? "bg-white/[0.03] border-white/12" : "bg-[var(--surface)] border-[var(--border)] shadow-soft"
        }`}>
          <CrossHair size={10} className={`absolute top-2 left-2 ${dark ? "text-white/25" : "text-[var(--ink-4)]"}`} />
          <CrossHair size={10} className={`absolute top-2 right-2 ${dark ? "text-white/25" : "text-[var(--ink-4)]"}`} />
          <CrossHair size={10} className={`absolute bottom-2 left-2 ${dark ? "text-white/25" : "text-[var(--ink-4)]"}`} />
          <CrossHair size={10} className={`absolute bottom-2 right-2 ${dark ? "text-white/25" : "text-[var(--ink-4)]"}`} />

          <div className={`grid grid-cols-[70px_1fr_1fr_1fr] border-b ${dark ? "border-white/10" : "border-[var(--border)]"}`}>
            <div className={dark ? "bg-white/[0.03]" : "bg-[var(--surface-2)]"} />
            {colSymbols.map((s, i) => (
                <div key={s}
                     className={`py-2.5 px-2 sm:px-3 text-center font-mono text-[10px] uppercase tracking-[0.14em] font-semibold border-l text-[var(--${colSemantics[i]})] ${dark ? "border-white/10" : "border-[var(--border)]"}`}>
                  <span className="hidden sm:inline">{s} </span>
                  <span>{t(["matrix_col_question","matrix_col_affirmative","matrix_col_negative"][i] ?? "")}</span>
                </div>
            ))}
          </div>

          <div key={animKey} className="matrix-stagger revealed">
            {tenseLabels.map((tense, row) => (
                <div key={tense} className={`grid grid-cols-[70px_1fr_1fr_1fr] border-b last:border-b-0 ${dark ? "border-white/10" : "border-[var(--border)]"}`}>
                  <div className={`py-3.5 px-3 font-mono text-[9px] uppercase tracking-[0.12em] flex items-center ${dark ? "bg-white/[0.03] text-white/45" : "bg-[var(--surface-2)] text-[var(--ink-4)]"}`}>
                    {tense}
                  </div>
                  {verb.cells[row]?.map((text, col) => (
                      <div
                          key={`${row}-${col}`}
                          className={`py-3.5 px-2 sm:px-3 font-mono text-[0.7rem] sm:text-[0.78rem] text-[var(--${colSemantics[col]})] border-l cell-transition leading-tight ${dark ? "border-white/10" : "border-[var(--border)] bg-[var(--surface)]"}`}
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

// ─── Avatar — initials in a colored circle ──────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name
      .split(" ")
      .filter((s) => !s.includes("."))
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  const palette = ["#2a5a8a", "#2d6342", "#8f3128", "#5b4b8a", "#7a5028"];
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = palette[hash % palette.length] ?? palette[0];
  return (
      <div className="avatar-initials" style={{ background: color }} aria-hidden="true">
        {initials}
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
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-4)] mt-1.5 shrink-0 w-6 tabular-nums">{num}</span>
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
      <div className={`card-glass card-lift hover-sheen relative flex flex-col h-full p-7 md:p-8 overflow-hidden ${
          comingSoon ? "opacity-70 pointer-events-none" : ""
      } ${isCurrent && !comingSoon ? "border-warm" : ""}`}>
        <div className="flex items-start justify-between mb-6 relative z-[2]">
          <LanguageOrb code={lang.code} size={52} className="text-[var(--ink-3)]" />
          <div className="flex flex-col items-end gap-1.5">
            {hasAccess && (
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--affirm)] flex items-center gap-1.5 bg-[var(--affirm-bg)] px-2 py-1 rounded-full">
              <span aria-hidden="true">✓</span> {t("landing_owned")}
            </span>
            )}
            {comingSoon && (
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-4)]">{t("landing_coming_soon")}</span>
            )}
          </div>
        </div>

        <div className="relative z-[2]">
          <div className="font-display text-[1.5rem] text-[var(--ink)] tracking-tight leading-tight mb-1.5">{lang.label}</div>
          <div className="font-mono text-[11px] text-[var(--ink-3)] leading-tight mb-1">"{lang.heroExample.text}"</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-4)] mt-0.5 mb-6">
            {t(lang.heroExample.en, { defaultValue: lang.heroExample.en })}
          </div>
        </div>

        <div className="flex-1" />

        <div className="pt-5 border-t border-[var(--border)] relative z-[2]">
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
                  <span className="font-display text-[1.4rem] text-[var(--ink)] font-medium tracking-tight tabular-nums">
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
  const [navSolid, setNavSolid] = useState(false);

  useEffect(() => {
    let rafPending = false;
    const compute = () => {
      rafPending = false;
      setNavSolid(window.scrollY > 60);
    };
    const handler = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(compute);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

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

  const methodRef = useScrollRevealChildren<HTMLElement>();
  const timelineRef = useScrollReveal<HTMLElement>({ threshold: 0.3 });
  const insideRef = useScrollRevealChildren<HTMLElement>();
  const langRef = useScrollRevealChildren<HTMLElement>();
  const testimonialsRef = useScrollRevealChildren<HTMLElement>();
  const faqRef = useScrollReveal<HTMLElement>();

  const speak = useTTS();
  const _handlePlay = useCallback((text: string) => { speak(text); }, [speak]);

  const comingSoonCodes = useMemo(
      () => Object.keys(PRICING).filter((code) => code !== "all" && !available.some((l) => l.code === code)),
      [available],
  );

  return (
      <div className="min-h-screen flex flex-col bg-[var(--bg)] relative">

        {/* ═════════ STICKY NAV ═════════ */}
        <header
            className="nav-shell fixed top-0 left-0 right-0 z-40"
            data-solid={navSolid}
            style={{ ["--nav-tint-a" as string]: navSolid ? "0.85" : "0" }}
        >
          <div className="max-w-[1200px] mx-auto px-5 md:px-12 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MatrixMark size={24} />
              <div className="font-display text-[1rem] tracking-tight leading-none font-medium text-white">
                {BRAND.name}
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-6">
              <a href="#method" className="hidden sm:inline-flex font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/60 hover:text-white transition-colors py-2">
                Method
              </a>
              <a href="#languages" className="hidden sm:inline-flex font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/60 hover:text-white transition-colors py-2">
                Pricing
              </a>
              <a href="#faq" className="hidden sm:inline-flex font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/60 hover:text-white transition-colors py-2">
                FAQ
              </a>
              <a href="#languages" className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-black bg-white px-4 py-2.5 rounded-full font-semibold hover:bg-white/90 transition-colors">
                {t("landing_get_access")}
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1 relative z-10">

          {/* ═════════ 1. HERO — DARK + ATMOSPHERIC ═════════ */}
          <section className="scope-dark bg-noir relative overflow-hidden pt-28 md:pt-32 pb-20 md:pb-24 px-5 md:px-12">

            {/* Atmospheric backdrop */}
            <div className="atmos-hero" />

            {/* Static grid texture — no animation, just the squares */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              zIndex: 1,
            }} />

            <div className="max-w-[1200px] mx-auto relative" style={{ zIndex: 2 }}>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_540px] gap-14 lg:gap-20 items-start">

                <div>
                  {/* Eyebrow: dot + status + extending hairline.
                    Reads as editorial / live software, not marketing tagline. */}
                  <div className="flex items-center gap-3 mb-7 reveal-blur revealed">
                    <span className="live-dot" />
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/55 whitespace-nowrap">
                    {t("landing_hero_status")}
                  </span>
                    <span className="eyebrow-line" />
                  </div>

                  <h1 className="font-display text-white font-light tracking-[-0.035em] leading-[1.04]
                               text-[clamp(2.4rem,6vw,4.8rem)] mb-5">
                  <span className="block reveal-blur revealed" style={{ animationDelay: "0s" }}>
                    {t("landing_hero_line1")}
                  </span>
                    <span className="block reveal-blur revealed" style={{ animationDelay: "0.1s" }}>
                    {t("landing_hero_line2")}
                  </span>
                    <span className="block reveal-blur revealed italic text-white/70 mt-2"
                          style={{ animationDelay: "0.2s" }}>
                    {t("landing_hero_line3")}
                  </span>
                  </h1>

                  {/* Small gold rule under the headline — visual punctuation */}
                  <hr className="hero-rule mb-6 reveal-blur revealed"
                      style={{ animationDelay: "0.3s" }} />

                  <p className="text-[clamp(1rem,1.4vw,1.15rem)] text-white/65 leading-[1.55] mb-7 max-w-[480px] reveal-blur revealed"
                     style={{ animationDelay: "0.4s" }}>
                    {t("landing_hero_subtitle")}
                  </p>

                  <div className="flex flex-col sm:flex-row items-start gap-3 mb-6 reveal-blur revealed"
                       style={{ animationDelay: "0.55s" }}>
                    <a href="#languages" className="btn-tactile btn-gold w-full sm:w-auto inline-flex">
                      {t("landing_cta_primary")} <span aria-hidden="true">→</span>
                    </a>
                    <a href="#method" className="btn-glass w-full sm:w-auto inline-flex">
                      {t("landing_cta_secondary")}
                    </a>
                  </div>

                  {/* Proof line — crosshair anchor + spec-style trust line */}
                  <div className="flex items-center gap-3 reveal-blur revealed"
                       style={{ animationDelay: "0.7s" }}>
                    <CrossHair size={10} className="text-[var(--gold)] flex-shrink-0" strokeWidth={1.5} />
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/45">
                    {t("landing_hero_trust")}
                  </span>
                  </div>
                </div>

                {/* Demo card — premium glass with editorial header strip */}
                <div className="relative reveal-blur revealed" style={{ animationDelay: "0.55s" }}>
                  <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/45">
                    {t("landing_hero_demo_label")}
                  </div>
                  <div className="card-glass p-5 md:p-6">
                    {/* Header strip — LIVE indicator + brand */}
                    <div className="demo-header">
                      <div className="flex items-center gap-2">
                        <span className="live-dot" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/65 font-semibold">
                        Live
                      </span>
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                        VerbMatrix · Romanian
                      </div>
                    </div>

                    <InteractiveMatrix dark />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ═════════ 2. CINEMATIC (signature scroll moment) ═════════ */}
          <CinematicMatrix />

          {/* ═════════ 3. METHOD — MANUSCRIPT MARGIN ═════════ */}
          <section id="method" ref={methodRef} className="scope-cream emerges-from-dark relative px-5 md:px-12 py-28 md:py-36 scroll-mt-16">
            <div className="atmos-cream" />
            <div className="max-w-[920px] mx-auto relative" style={{ zIndex: 1 }}>
              <div className="reveal mb-20 text-center">
                <div className="eyebrow mb-5">{t("landing_method_kicker")}</div>
                <h2 className="font-display text-[clamp(2rem,4.4vw,3.2rem)] font-light text-[var(--ink)] tracking-[-0.025em] leading-[1.08] max-w-[680px] mx-auto">
                  {t("landing_method_title_part1")} {t("landing_method_title_part2")}
                </h2>
              </div>

              <div className="space-y-16 md:space-y-20">
                {[
                  { num: "01", title: "landing_method_1_title", body: "landing_method_1_body" },
                  { num: "02", title: "landing_method_2_title", body: "landing_method_2_body" },
                  { num: "03", title: "landing_method_3_title", body: "landing_method_3_body" },
                ].map((step) => (
                    <div key={step.num}
                         className="reveal grid grid-cols-1 md:grid-cols-[120px_1fr] gap-5 md:gap-12 items-start">
                      <div className="font-display text-[clamp(2.6rem,4vw,3.4rem)] text-[var(--gold)] font-light leading-none tracking-tight tabular-nums md:text-right">
                        {step.num}
                      </div>
                      <div className="manuscript-step">
                        <h3 className="font-display text-[1.4rem] md:text-[1.7rem] text-[var(--ink)] tracking-[-0.02em] leading-[1.2] mb-3 font-medium">
                          {t(step.title)}
                        </h3>
                        <p className="text-[1.02rem] text-[var(--ink-2)] leading-[1.7] max-w-[640px]">
                          {t(step.body)}
                        </p>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </section>

          <hr className="fade-rule mx-auto max-w-[800px]" />

          {/* ═════════ 4. TIMELINE — STAT TILES ═════════ */}
          <section ref={timelineRef} className="scope-cream reveal relative px-5 md:px-12 py-24 md:py-32">
            <div className="max-w-[1000px] mx-auto relative">
              <div className="text-center mb-14">
                <div className="eyebrow mb-5">{t("landing_timeline_kicker")}</div>
                <h2 className="font-display text-[clamp(1.7rem,3.4vw,2.4rem)] font-light text-[var(--ink)] tracking-[-0.02em] leading-[1.15] max-w-[680px] mx-auto">
                  {t("landing_timeline_title")}
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-16">
                {[
                  { num: "5 min",  label: "to your first sentence" },
                  { num: "32",     label: "structured days" },
                  { num: "32",     label: "core verbs · 90% of speech" },
                  { num: "500+",   label: "vocabulary words" },
                ].map((s, i) => (
                    <div key={i} className="stat-tile">
                      <div className="font-display text-[clamp(2rem,3.6vw,2.8rem)] mb-2 font-light tracking-tight tabular-nums text-[var(--ink)]">
                        {s.num}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-3)] leading-snug max-w-[160px] mx-auto">
                        {s.label}
                      </div>
                    </div>
                ))}
              </div>

              <div className="w-full overflow-x-auto pb-4 -mx-5 px-5 md:mx-0 md:px-0">
                <DayProgression className="min-w-[560px] w-full h-[100px] block mx-auto" />
              </div>

              <p className="text-center mt-10 text-[0.98rem] text-[var(--ink-3)] max-w-[560px] mx-auto leading-[1.65]">
                {t("landing_timeline_caption")}
              </p>
            </div>
          </section>

          <hr className="fade-rule mx-auto max-w-[800px]" />

          {/* ═════════ 5. INCLUDES — SPEC SHEET ═════════ */}
          <section ref={insideRef} className="scope-cream relative px-5 md:px-12 py-24 md:py-32">
            <div className="max-w-[960px] mx-auto">
              <div className="reveal text-center mb-14">
                <div className="eyebrow mb-5">{t("landing_includes_kicker")}</div>
                <h2 className="font-display text-[clamp(1.9rem,3.8vw,2.6rem)] font-light text-[var(--ink)] tracking-[-0.02em] leading-[1.1]">
                  {t("landing_includes_title")}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                {[
                  { num: "01", title: "landing_includes_matrix",    desc: "landing_includes_matrix_desc" },
                  { num: "02", title: "landing_includes_verbs",     desc: "landing_includes_verbs_desc" },
                  { num: "03", title: "landing_includes_vocab",     desc: "landing_includes_vocab_desc" },
                  { num: "04", title: "landing_includes_dialogues", desc: "landing_includes_dialogues_desc" },
                  { num: "05", title: "landing_includes_audio",     desc: "landing_includes_audio_desc" },
                  { num: "06", title: "landing_includes_plan",      desc: "landing_includes_plan_desc" },
                ].map((item) => (
                    <div key={item.num} className="reveal spec-item flex items-start gap-4">
                      <CrossHair size={12} className="text-[var(--gold)] mt-1.5 shrink-0" strokeWidth={1.5} />
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-4)] tabular-nums">{item.num}</span>
                          <span className="font-display text-[1.05rem] text-[var(--ink)] tracking-tight font-medium">
                        {t(item.title)}
                      </span>
                        </div>
                        <div className="text-[0.92rem] text-[var(--ink-2)] leading-[1.6]">
                          {t(item.desc, { defaultValue: "" })}
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </section>

          <hr className="fade-rule mx-auto max-w-[800px]" />

          {/* ═════════ 6. TESTIMONIALS — PREMIUM CARDS ═════════ */}
          <section ref={testimonialsRef} className="scope-cream relative px-5 md:px-12 py-24 md:py-32">
            <div className="atmos-cream" />
            <div className="max-w-[1100px] mx-auto relative" style={{ zIndex: 1 }}>
              <div className="text-center mb-14">
                <div className="eyebrow mb-5">{t("landing_testimonials_kicker")}</div>
                <h2 className="font-display text-[clamp(1.9rem,3.8vw,2.6rem)] font-light text-[var(--ink)] tracking-[-0.02em] leading-[1.1]">
                  {t("landing_testimonials_title")}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((n) => (
                    <figure key={n} className="card-glass card-lift hover-sheen reveal p-6 md:p-7 flex flex-col">
                      <div className="text-[var(--gold)] font-display text-[2.2rem] leading-none mb-2 opacity-50">"</div>
                      <blockquote className="text-[0.98rem] leading-[1.65] text-[var(--ink)] flex-1 -mt-2">
                        {t(`landing_testimonial_${n}_quote`)}
                      </blockquote>
                      <figcaption className="mt-6 pt-5 border-t border-[var(--border)] flex items-center gap-3">
                        <Avatar name={t(`landing_testimonial_${n}_name`)} />
                        <div className="min-w-0">
                          <div className="font-display text-[0.95rem] text-[var(--ink)] font-medium tracking-tight truncate">
                            {t(`landing_testimonial_${n}_name`)}
                          </div>
                          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] truncate">
                            {t(`landing_testimonial_${n}_role`)} · {t(`landing_testimonial_${n}_city`)}
                          </div>
                        </div>
                      </figcaption>
                    </figure>
                ))}
              </div>

              <p className="text-center mt-10 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-4)]">
                {t("landing_testimonials_disclaimer")}
              </p>
            </div>
          </section>

          <hr className="fade-rule mx-auto max-w-[800px]" />

          {/* ═════════ 7. LANGUAGES + BUNDLE ═════════ */}
          <section id="languages" ref={langRef} className="scope-cream relative px-5 md:px-12 py-24 md:py-32 scroll-mt-16">
            <div className="max-w-[1100px] mx-auto">
              <div className="reveal text-center mb-16">
                <div className="eyebrow mb-5">{t("landing_languages_kicker")}</div>
                <h2 className="font-display text-[clamp(2rem,4vw,2.8rem)] font-light text-[var(--ink)] tracking-[-0.025em] leading-[1.08] mb-5">
                  {t("landing_languages_title")}
                </h2>
                <p className="text-[1rem] text-[var(--ink-2)] max-w-[560px] mx-auto leading-[1.65]">
                  {t("landing_languages_subtitle")}
                </p>
              </div>

              <ul className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-[920px] mx-auto mb-12">
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
                      <LanguageCard
                          lang={{
                            code,
                            label: t(`landing_lang_${code}`, { defaultValue: code.toUpperCase() }),
                            heroExample: { text: "—", en: "" },
                          }}
                          pricing={getPricing(code)}
                          isCurrent={false} comingSoon={true}
                          onSelect={() => {}} onActivate={() => {}} hasAccess={false}
                      />
                    </li>
                ))}
              </ul>

              {/* Bundle — dark featured panel inside cream section */}
              <div className="max-w-[800px] mx-auto reveal">
                <div className="cta-dark-panel p-8 md:p-10 relative">
                  <div className="relative z-[2] flex items-start justify-between gap-6 flex-wrap">
                    <div className="flex-1 min-w-[260px]">
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)] mb-3">
                        ★ {t("landing_bundle_kicker")}
                      </div>
                      <h3 className="font-display text-[clamp(1.5rem,2.8vw,2.1rem)] font-medium tracking-[-0.02em] leading-[1.1] mb-3 text-white">
                        {t("landing_bundle_title")}
                      </h3>
                      <p className="text-[0.95rem] text-white/65 leading-[1.65] max-w-[420px]">
                        {t("landing_bundle_body")}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-display text-[2.6rem] text-white font-light leading-none tracking-[-0.03em] tabular-nums">
                          {PRICING.all?.priceFormatted ?? "—"}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55 mt-1.5">
                          {t("landing_lifetime_access")}
                        </div>
                      </div>
                      <button type="button"
                              onClick={() => {
                                if (!PRICING.all) return;
                                trackEvent("purchase-click", { language: "all", price: PRICING.all.price });
                                if (PRICING.all.checkoutUrl) window.open(PRICING.all.checkoutUrl, "_blank");
                              }}
                              className="btn-tactile btn-gold">
                        {t("landing_get_access")} →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <hr className="fade-rule mx-auto max-w-[800px]" />

          {/* ═════════ 8. GUARANTEE — INTIMATE SEAL MOMENT ═════════ */}
          <section className="scope-cream px-5 md:px-12 py-20 md:py-28">
            <div className="max-w-[640px] mx-auto text-center">
              <div className="guarantee-seal">
                <div className="eyebrow mb-4">{t("landing_guarantee_kicker")}</div>
                <p className="text-[1.05rem] md:text-[1.18rem] text-[var(--ink-2)] leading-[1.7]">
                  {t("landing_guarantee_body")}
                </p>
              </div>
            </div>
          </section>

          <hr className="fade-rule mx-auto max-w-[800px]" />

          {/* ═════════ 9. FAQ ═════════ */}
          <section id="faq" ref={faqRef} className="scope-cream reveal px-5 md:px-12 py-24 scroll-mt-16">
            <div className="max-w-[800px] mx-auto">
              <div className="text-center mb-14">
                <div className="eyebrow mb-4">{t("landing_faq_kicker")}</div>
                <h2 className="font-display text-[clamp(1.8rem,3.4vw,2.4rem)] font-light text-[var(--ink)] tracking-tight">
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

          {/* ═════════ 10. FINAL CTA — DARK + TREE LINES (bookend) ═════════ */}
          <section className="scope-dark bg-noir emerges-from-cream relative px-5 md:px-12 py-28 md:py-36 overflow-hidden border-t border-white/[0.06]">
            <div className="atmos-final" />

            {/* Static grid texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              zIndex: 1,
            }} />

            <div className="max-w-[760px] mx-auto text-center relative" style={{ zIndex: 2 }}>
              <h2 className="font-display text-white text-[clamp(2rem,4.4vw,3.4rem)] font-light tracking-[-0.025em] leading-[1.08] mb-7">
                {t("landing_final_cta_title")}{" "}
                <span className="italic">{t("landing_final_cta_emphasis")}</span>
              </h2>
              <p className="text-[1rem] text-white/60 mb-10 max-w-[480px] mx-auto leading-[1.65]">
                {t("landing_final_cta_subtitle")}
              </p>
              <a href="#languages" className="btn-tactile btn-gold inline-flex">
                {t("landing_cta_primary")} <span aria-hidden="true">→</span>
              </a>
            </div>
          </section>
        </main>

        {/* ═════════ FOOTER ═════════ */}
        <footer className="scope-dark relative px-5 md:px-12 py-14 border-t border-white/[0.06]">
          <div className="max-w-[1100px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
              <div className="flex items-center gap-2.5">
                <MatrixMark size={22} />
                <div className="font-display text-[1rem] font-medium text-white tracking-tight">{BRAND.name}</div>
              </div>
              <div className="flex flex-wrap items-center gap-x-7 gap-y-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/55">
                <button type="button" onClick={() => setKeyModal("all")}
                        className="hover:text-white transition-colors">
                  {t("landing_footer_activate")}
                </button>
                <a href="#terms" className="hover:text-white transition-colors">{t("landing_footer_terms")}</a>
                <a href="#privacy" className="hover:text-white transition-colors">{t("landing_footer_privacy")}</a>
                <a href={`mailto:${BRAND.contactEmail}`} className="hover:text-white transition-colors">{t("landing_footer_contact")}</a>
                <ThemeToggle />
              </div>
            </div>
            <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-3">
            <span className="font-mono text-[10px] text-white/40">
              © {BRAND.launchYear} {BRAND.name}. {t("landing_footer_rights")}
            </span>
              <span className="font-mono text-[10px] text-white/40">
              {BRAND.contactEmail}
            </span>
            </div>
          </div>
        </footer>

        {keyModal && <LicenseKeyModal languageCode={keyModal} onClose={() => setKeyModal(null)} />}
      </div>
  );
}
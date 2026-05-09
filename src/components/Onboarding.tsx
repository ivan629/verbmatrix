import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTTS } from "../lib/tts";
import { useTargetLanguage } from "../context/TargetLanguage";
import { tryGetActiveLanguage } from "../lib/active-language";
import { RO } from "./RO";

/**
 * Five-minute first-contact flow, run once per (browser × language).
 *
 * Goal: get the user to speak a sentence in the target language aloud
 * within five minutes of arrival. Time-to-first-success is one of the
 * strongest predictors of week-2 retention in language apps.
 *
 * The five steps each take roughly one minute:
 *   1. Hook         — "you already understand more than you think"
 *   2. Cognates     — listen-and-recognise reel (24 free words)
 *   3. First verb   — the canonical first verb in 3 tenses
 *   4. First cell   — user speaks a sentence aloud, hears it back
 *   5. Reveal       — show the matrix system; offer the start
 *
 * UI chrome is fully translated via i18next. Per-language content
 * (cognates, first verb, first sentence) comes from the active
 * language module's `onboarding` field.
 *
 * The seen-flag is per-language so a user who switches target languages
 * later goes through onboarding for the new language too.
 */

const SEEN_KEY_PREFIX = "study-onboarded:";

function seenKeyFor(code: string): string {
  return `${SEEN_KEY_PREFIX}${code}`;
}

function hasSeenOnboarding(code: string): boolean {
  try {
    return localStorage.getItem(seenKeyFor(code)) === "1";
  } catch {
    return false;
  }
}

function markOnboardingSeen(code: string): void {
  try {
    localStorage.setItem(seenKeyFor(code), "1");
  } catch {
    /* private browsing / quota — degrade silently */
  }
}

interface OnboardingProps {
  /** Called when the user completes or skips. Parent dismounts the overlay. */
  readonly onComplete: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useTranslation();
  const { module } = useTargetLanguage();
  const { onboarding } = module;
  const [step, setStep] = useState<Step>(1);
  const [step4Revealed, setStep4Revealed] = useState(false);
  const speak = useTTS();

  const next = useCallback(() => {
    setStep((s) => (s < 5 ? ((s + 1) as Step) : s));
  }, []);

  const finish = useCallback(() => {
    markOnboardingSeen(module.code);
    onComplete();
  }, [onComplete, module.code]);

  const revealStep4 = useCallback(() => {
    setStep4Revealed(true);
    window.setTimeout(() => speak(onboarding.firstSentence.text), 200);
  }, [speak, onboarding.firstSentence.text]);

  // Keyboard: Space/Enter advance, Esc skip. Step 4 has a two-stage
  // interaction — first reveal, then advance.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        if (step === 4 && !step4Revealed) {
          revealStep4();
          return;
        }
        if (step < 5) next();
        else finish();
      } else if (e.code === "Escape") {
        finish();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, step4Revealed, next, finish, revealStep4]);

  // Lock body scroll while overlay is up.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg)] overflow-y-auto">
      <div className="min-h-full flex flex-col">
        <header className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[var(--border)]">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)]">
            {t("onboarding_minutes_label")}
          </span>
          <button
            type="button"
            onClick={finish}
            className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-4)] hover:text-[var(--ink-2)] transition-colors"
          >
            {t("onboarding_skip")}
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[680px]">
            {step === 1 && <StepHook onNext={next} />}
            {step === 2 && <StepCognates onNext={next} />}
            {step === 3 && <StepFirstVerb onNext={next} />}
            {step === 4 && (
              <StepFirstCell
                onNext={next}
                revealed={step4Revealed}
                onReveal={revealStep4}
              />
            )}
            {step === 5 && <StepReveal onComplete={finish} />}
          </div>
        </main>

        <footer className="px-6 md:px-12 py-5 border-t border-[var(--border)]">
          <StepDots current={step} />
        </footer>
      </div>
    </div>
  );
}

/**
 * Hook for App.tsx — returns whether onboarding should be shown right now,
 * scoped to the active learning language. The dismiss callback marks the
 * seen flag for that language and hides the overlay.
 */
export function useShouldShowOnboarding(): [boolean, () => void] {
  const lang = tryGetActiveLanguage();
  const code = lang?.code ?? "";
  const [show, setShow] = useState<boolean>(() =>
    code ? !hasSeenOnboarding(code) : false
  );

  // If the active language changes (user switches target) and the new
  // language hasn't been onboarded yet, re-show onboarding.
  useEffect(() => {
    if (!code) {
      setShow(false);
      return;
    }
    setShow(!hasSeenOnboarding(code));
  }, [code]);

  const dismiss = useCallback(() => setShow(false), []);
  return [show, dismiss];
}

// ─── Steps ──────────────────────────────────────────────────────

function StepHook({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="text-center fade-in">
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--gold)] mb-4">
        {t("onboarding_step1_kicker")}
      </div>
      <h1 className="font-display text-[2.4rem] md:text-[3.2rem] text-[var(--ink)] tracking-tight leading-[1.05] mb-6">
        {t("onboarding_step1_title")}
      </h1>
      <p className="text-[var(--ink-2)] text-[1.05rem] leading-[1.65] max-w-[520px] mx-auto mb-8">
        {t("onboarding_step1_body")}
      </p>
      <p className="text-[var(--ink-3)] text-[0.95rem] italic mb-10 max-w-[480px] mx-auto">
        {t("onboarding_step1_aside")}
      </p>
      <button
        type="button"
        onClick={onNext}
        className="font-mono text-[12px] uppercase tracking-[0.14em] py-3 px-7 bg-[var(--ink)] text-[var(--surface)] rounded-[var(--radius)] hover:opacity-90 transition-opacity"
      >
        {t("onboarding_step1_cta")}
      </button>
    </div>
  );
}

function StepCognates({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const { module } = useTargetLanguage();
  return (
    <div className="fade-in">
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--gold)] mb-3 text-center">
        {t("onboarding_step2_kicker")}
      </div>
      <h2 className="font-display text-[2rem] md:text-[2.4rem] text-[var(--ink)] tracking-tight leading-[1.1] mb-3 text-center">
        {t("onboarding_step2_title")}
      </h2>
      <p className="text-[var(--ink-3)] text-[0.95rem] mb-8 text-center max-w-[480px] mx-auto">
        {t("onboarding_step2_subtitle")}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-10">
        {module.onboarding.cognates.map((c) => (
          <div
            key={c.text}
            className="border border-[var(--border)] rounded-[var(--radius)] py-3 px-3 hover:bg-[var(--surface-2)] transition-colors text-center"
          >
            <div className="font-display text-[1.05rem] text-[var(--ink)]">
              <RO text={c.text} en={c.en} />
            </div>
            <div className="font-mono text-[10px] text-[var(--ink-4)] uppercase tracking-[0.1em] mt-1">
              {t(c.en)}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center">
        <button
          type="button"
          onClick={onNext}
          className="font-mono text-[12px] uppercase tracking-[0.14em] py-3 px-7 bg-[var(--ink)] text-[var(--surface)] rounded-[var(--radius)] hover:opacity-90 transition-opacity"
        >
          {t("onboarding_step2_cta")}
        </button>
      </div>
    </div>
  );
}

function StepFirstVerb({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation();
  const { module } = useTargetLanguage();
  const { firstVerb } = module.onboarding;

  return (
    <div className="fade-in text-center">
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--gold)] mb-3">
        {t("onboarding_step3_kicker")}
      </div>
      <h2 className="font-display text-[2rem] md:text-[2.4rem] text-[var(--ink)] tracking-tight leading-[1.1] mb-8">
        {t("onboarding_step3_title")}
      </h2>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] py-8 px-6 my-6 shadow-[var(--shadow-1)]">
        <div className="font-display text-[1.6rem] text-[var(--ink)] mb-1">
          <RO text={firstVerb.infinitive} en={firstVerb.meaning} />
        </div>
        <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)] mb-8">
          {t(firstVerb.meaning)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-[520px] mx-auto">
          {firstVerb.forms.map((row) => (
            <div
              key={row.text}
              className="border border-[var(--border)] rounded-[var(--radius)] py-4 px-3 hover:bg-[var(--surface-2)] transition-colors"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-4)] mb-2">
                {t(`onboarding_tense_${row.tenseLabel}`)}
              </div>
              <div className="font-display text-[1.05rem] text-[var(--ink)]">
                <RO text={row.text} en={row.en} />
              </div>
              <div className="font-mono text-[0.8rem] text-[var(--ink-3)] mt-2">
                {module.pronounce(row.text)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[var(--ink-3)] text-[0.92rem] italic mb-6 max-w-[480px] mx-auto">
        {t("onboarding_step3_aside")}
      </p>

      <button
        type="button"
        onClick={onNext}
        className="font-mono text-[12px] uppercase tracking-[0.14em] py-3 px-7 bg-[var(--ink)] text-[var(--surface)] rounded-[var(--radius)] hover:opacity-90 transition-opacity"
      >
        {t("onboarding_step3_cta")}
      </button>
    </div>
  );
}

function StepFirstCell({
  onNext, revealed, onReveal,
}: {
  onNext: () => void;
  revealed: boolean;
  onReveal: () => void;
}) {
  const { t } = useTranslation();
  const { module } = useTargetLanguage();
  const { firstSentence } = module.onboarding;

  return (
    <div className="fade-in text-center">
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--gold)] mb-3">
        {t("onboarding_step4_kicker")}
      </div>
      <h2 className="font-display text-[2rem] md:text-[2.4rem] text-[var(--ink)] tracking-tight leading-[1.1] mb-3">
        {t("onboarding_step4_title")}
      </h2>
      <p className="text-[var(--ink-3)] text-[0.95rem] mb-8 max-w-[440px] mx-auto">
        {t("onboarding_step4_prompt", { en: t(firstSentence.en) })}
      </p>

      <div className="my-10">
        {!revealed ? (
          <button
            type="button"
            onClick={onReveal}
            className="font-mono text-[12px] uppercase tracking-[0.14em] py-4 px-9 bg-[var(--ink)] text-[var(--surface)] rounded-[var(--radius)] hover:opacity-90 transition-opacity"
          >
            {t("onboarding_step4_reveal")}
          </button>
        ) : (
          <div className="fade-in">
            <div className="font-display text-[2.4rem] text-[var(--affirm)] tracking-tight mb-2">
              <RO text={firstSentence.text} en={firstSentence.en} />
            </div>
            <div className="font-mono text-[0.92rem] text-[var(--ink-3)] mb-3">
              {module.pronounce(firstSentence.text)}
            </div>
          </div>
        )}
      </div>

      {revealed && (
        <button
          type="button"
          onClick={onNext}
          className="font-mono text-[12px] uppercase tracking-[0.14em] py-3 px-7 bg-[var(--ink)] text-[var(--surface)] rounded-[var(--radius)] hover:opacity-90 transition-opacity fade-in"
        >
          {t("onboarding_step4_cta")}
        </button>
      )}
    </div>
  );
}

function StepReveal({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="fade-in text-center">
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--gold)] mb-3">
        {t("onboarding_step5_kicker")}
      </div>
      <h2 className="font-display text-[2.2rem] md:text-[2.8rem] text-[var(--ink)] tracking-tight leading-[1.05] mb-6">
        {t("onboarding_step5_title")}
      </h2>
      <p className="text-[var(--ink-2)] text-[1.05rem] leading-[1.65] max-w-[520px] mx-auto mb-3">
        {t("onboarding_step5_body")}
      </p>
      <p className="text-[var(--ink-3)] text-[0.95rem] mb-10 max-w-[480px] mx-auto">
        {t("onboarding_step5_aside")}
      </p>

      <div className="grid grid-cols-3 gap-2 max-w-[440px] mx-auto mb-10 text-[0.85rem] font-mono">
        {(["Future", "Present", "Past"] as const).map((tense) => (
          <div
            key={tense}
            className="border border-[var(--border)] rounded-[var(--radius)] py-3 px-2 bg-[var(--surface-2)]"
          >
            <div className="text-[var(--ink-4)] text-[10px] uppercase tracking-[0.12em] mb-2">
              {t(`onboarding_tense_${tense}`)}
            </div>
            <div className="space-y-1 text-[var(--ink-2)] text-[0.78rem]">
              <div className="text-[var(--question)]">{t("onboarding_step5_grid_question")}</div>
              <div className="text-[var(--affirm)]">{t("onboarding_step5_grid_statement")}</div>
              <div className="text-[var(--neg)]">{t("onboarding_step5_grid_negation")}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="font-mono text-[12px] uppercase tracking-[0.14em] py-4 px-9 bg-[var(--ink)] text-[var(--surface)] rounded-[var(--radius)] hover:opacity-90 transition-opacity"
      >
        {t("onboarding_step5_cta")}
      </button>
    </div>
  );
}

// ─── Step indicator ─────────────────────────────────────────────

function StepDots({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className={`h-[2px] transition-all duration-300 ${
            n === current
              ? "w-8 bg-[var(--ink)]"
              : n < current
                ? "w-3 bg-[var(--ink-3)]"
                : "w-3 bg-[var(--border)]"
          }`}
        />
      ))}
    </div>
  );
}

import { useCallback, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTTS } from "../lib/tts";
import { useTargetLanguage } from "../context/TargetLanguage";
import { trackEvent } from "../config";

/**
 * Interactive transformation widget — the hero's centerpiece.
 *
 * Shows ONE Romanian sentence at a time. User taps tense pills (Past/Present/
 * Future) or form pills (+/?/−) to transform it. Each transformation plays
 * audio so the user hears native pronunciation.
 *
 * Why this beats a matrix grid:
 *   - Beginner-friendly: one sentence + translation is readable, a 9-cell
 *     grid of foreign words is intimidating
 *   - The "aha" arrives in 3 seconds when they tap a pill and the sentence
 *     transforms — the matrix method becomes visceral
 *   - Audio is impossible to miss (auto-plays on transformation)
 *
 * Engagement → conversion: after 3+ pill clicks we surface a small "Start
 * free →" nudge. The user has demonstrated curiosity; ask for the click.
 */

type Tense = "past" | "present" | "future";
type Form = "aff" | "q" | "neg";

/**
 * The 9 Romanian sentences. Verb: "a vorbi" (to speak). Subject pronoun
 * dropped per natural Romanian conversation. English glosses reflect the
 * actual meaning, not literal word-by-word.
 *
 * If you change these, update the audio cache keys in your audio pipeline too.
 */
const SENTENCES: Record<Tense, Record<Form, { ro: string; en: string }>> = {
  past: {
    aff: { ro: "Am vorbit româneşte.",      en: "I spoke Romanian." },
    q:   { ro: "Ai vorbit româneşte?",      en: "Did you speak Romanian?" },
    neg: { ro: "N-am vorbit româneşte.",    en: "I didn't speak Romanian." },
  },
  present: {
    aff: { ro: "Vorbesc româneşte.",        en: "I speak Romanian." },
    q:   { ro: "Vorbeşti româneşte?",       en: "Do you speak Romanian?" },
    neg: { ro: "Nu vorbesc româneşte.",     en: "I don't speak Romanian." },
  },
  future: {
    aff: { ro: "Voi vorbi româneşte.",      en: "I will speak Romanian." },
    q:   { ro: "Vei vorbi româneşte?",      en: "Will you speak Romanian?" },
    neg: { ro: "Nu voi vorbi româneşte.",   en: "I won't speak Romanian." },
  },
};

const TENSE_ORDER: Tense[] = ["past", "present", "future"];
const FORM_ORDER: Form[]   = ["aff", "q", "neg"];

const TENSE_LABEL_KEY: Record<Tense, string> = {
  past:    "transform_tense_past",
  present: "transform_tense_present",
  future:  "transform_tense_future",
};
const FORM_LABEL_KEY: Record<Form, string> = {
  aff: "transform_form_aff",
  q:   "transform_form_q",
  neg: "transform_form_neg",
};
const FORM_SYMBOL: Record<Form, string> = { aff: "+", q: "?", neg: "−" };

export function TransformationWidget() {
  const { t } = useTranslation();
  const speak = useTTS();
  const { setCode } = useTargetLanguage();

  const [tense, setTense] = useState<Tense>("present");
  const [form, setForm]   = useState<Form>("aff");
  const [pulseKey, setPulseKey] = useState(0); // forces re-mount for fade-in
  const clickCount = useRef(0);
  const [showNudge, setShowNudge] = useState(false);

  const current = SENTENCES[tense][form];

  const handleTransform = useCallback((newTense: Tense, newForm: Form, dim: "tense" | "form") => {
    const isSame = newTense === tense && newForm === form;
    setTense(newTense);
    setForm(newForm);
    setPulseKey((k) => k + 1);
    // Don't play audio on no-op clicks (clicking the active pill again).
    if (!isSame) {
      // Speak the NEW sentence (not the stale `current`).
      speak(SENTENCES[newTense][newForm].ro);
    }
    clickCount.current += 1;
    trackEvent("transform-click", {
      dimension: dim,
      tense: newTense,
      form: newForm,
      click_count: clickCount.current,
    });
    if (clickCount.current >= 3 && !showNudge) {
      setShowNudge(true);
    }
  }, [tense, form, speak, showNudge]);

  const playCurrent = useCallback(() => {
    speak(current.ro);
    trackEvent("transform-play-click", { tense, form });
  }, [current.ro, speak, tense, form]);

  return (
    <div className="rounded-[var(--radius-lg)] border border-white/12 bg-[#0d0c11] overflow-hidden">

      {/* The sentence itself — the eye lands here */}
      <div className="px-6 pt-7 pb-6">
        <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/35 mb-4">
          {t(TENSE_LABEL_KEY[tense])} · {t(FORM_LABEL_KEY[form])}
        </div>

        <div key={pulseKey} className="transform-sentence-enter">
          <div className="font-display text-[clamp(1.5rem,3.2vw,2.2rem)] font-light text-white tracking-tight leading-tight mb-2">
            {current.ro}
          </div>
          <div className="text-[0.95rem] text-white/55 leading-snug">
            {current.en}
          </div>
        </div>

        <button
          type="button"
          onClick={playCurrent}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-white/85 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors cursor-pointer"
          aria-label={t("transform_play_aria")}
        >
          <span aria-hidden="true">▸</span>
          <span>{t("transform_play")}</span>
        </button>
      </div>

      {/* Dimension 1: form (affirmative / question / negative) */}
      <div className="border-t border-white/10 px-6 py-5">
        <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/40 mb-3">
          {t("transform_change_form")}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {FORM_ORDER.map((f) => {
            const active = f === form;
            return (
              <button
                key={f}
                type="button"
                onClick={() => handleTransform(tense, f, "form")}
                className={`py-2.5 px-3 rounded-md border font-mono text-[10.5px] uppercase tracking-[0.12em] transition-all cursor-pointer ${
                  active
                    ? "border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/[0.08]"
                    : "border-white/12 text-white/65 hover:border-white/30 hover:text-white"
                }`}
              >
                <span className="mr-1.5 font-bold">{FORM_SYMBOL[f]}</span>
                {t(FORM_LABEL_KEY[f])}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dimension 2: tense (past / present / future) */}
      <div className="border-t border-white/10 px-6 py-5">
        <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/40 mb-3">
          {t("transform_change_tense")}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {TENSE_ORDER.map((tn) => {
            const active = tn === tense;
            return (
              <button
                key={tn}
                type="button"
                onClick={() => handleTransform(tn, form, "tense")}
                className={`py-2.5 px-3 rounded-md border font-mono text-[10.5px] uppercase tracking-[0.12em] transition-all cursor-pointer ${
                  active
                    ? "border-[var(--gold)] text-[var(--gold)] bg-[var(--gold)]/[0.08]"
                    : "border-white/12 text-white/65 hover:border-white/30 hover:text-white"
                }`}
              >
                {t(TENSE_LABEL_KEY[tn])}
              </button>
            );
          })}
        </div>
      </div>

      {/* Soft conversion nudge — appears after 3+ engagement clicks */}
      {showNudge && (
        <div className="border-t border-white/10 px-6 py-4 bg-[var(--gold)]/[0.05] flex items-center justify-between gap-3 transform-nudge-enter">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/70">
            {t("transform_nudge_label")}
          </span>
          <button
            type="button"
            onClick={() => {
              trackEvent("transform-nudge-click", { click_count: clickCount.current });
              setCode("ro");
            }}
            className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--gold)] hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            {t("transform_nudge_cta")}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}

    </div>
  );
}

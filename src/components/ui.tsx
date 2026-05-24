import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import type {
  BoxVariant, PhraseItem, VocabItem, NumberItem, SoundItem,
  PrincipleItem, ScheduleItem, FillerItem, TestItem, ContrastColumn, VerbDefinition,
} from "../types";
import { RO } from "./RO";
import { useLessonNav } from "../context/LessonNav";
import { useTargetLanguage } from "../context/TargetLanguage";

// ─── Lesson Section ─────────────────────────────────────────────
//
// Opener (mockup-approved):
//   • eyebrow         — gold "Lesson N · Tag" line
//   • display title   — large, with <em> emphasis on the outcome word
//   • gold rule       — 36px thin gold bar, visual punctuation
//   • meta strip      — "5 min · read"  "3 min · practice"
//   • goal sentence   — italic "By the end you will…"
//
// Behaviour:
//   • registers itself with LessonNavProvider (active tracking + focus mode)
//   • auto-renders <LessonClose> when `recap` is set, with mark-complete button
//   • detects phase-end automatically by checking if nextId crosses navGroups
//
// All new props are optional — legacy call sites still render correctly.

type LessonMode = "read" | "say" | "recall" | "write";

interface LessonSectionProps {
  id: string;
  num: string;
  tag: string;
  title: string;
  /** Legacy: long-form subtitle. Prefer `goal` for the italic outcome sentence. */
  subtitle?: string;
  /** Italic "By the end you will…" sentence. Replaces subtitle visually when present. */
  goal?: string;
  /** Estimated reading time in minutes. */
  time?: number;
  /** Estimated active-practice time in minutes. */
  practice?: number;
  /** One-sentence recap rendered at the bottom in the LessonClose block. */
  recap?: string;
  /** DOM id of the next lesson (e.g. "L2"). Renders an inline "Next →" pointer. */
  nextId?: string;
  /** Display label for the next lesson (e.g. "Pronouns"). */
  nextLabel?: string;
  children: ReactNode;
}

export function LessonSection({
  id, num, tag, title, subtitle, goal, time, practice, recap, nextId, nextLabel, children,
}: LessonSectionProps) {
  const { t } = useTranslation();
  const { activeId, focusMode, registerSection } = useLessonNav();
  const { module } = useTargetLanguage();
  const sectionRef = useRef<HTMLElement | null>(null);

  // Register / unregister this section with the shared observer.
  useEffect(() => {
    registerSection(id, sectionRef.current);
    return () => registerSection(id, null);
  }, [id, registerSection]);

  // Detect phase boundary: if the next lesson is in a different navGroup
  // than this one, this lesson is the last of its phase.
  const isPhaseEnd = useMemo(() => {
    if (!nextId) return false;
    const groupOf = (lessonId: string): string | null => {
      for (const g of module.navGroups) {
        if (g.links.some(l => l.href === `#${lessonId}`)) return g.label;
      }
      return null;
    };
    const currentGroup = groupOf(id);
    const nextGroup = groupOf(nextId);
    return currentGroup !== null && nextGroup !== null && currentGroup !== nextGroup;
  }, [id, nextId, module.navGroups]);

  // Focus mode: hide every section except the active one.
  const isFocusHidden = focusMode && activeId !== null && activeId !== id;

  const eyebrowText =
    num === "★"
      ? t(tag)
      : `${t("lesson_label")} ${num} · ${t(tag)}`;

  return (
    <section
      id={id}
      ref={sectionRef}
      data-lesson-section
      data-lesson-id={id}
      className={`mb-24 scroll-mt-20 fade-in${isFocusHidden ? " lesson-focus-hidden" : ""}`}
    >
      {/* ── Opener ─────────────────────────────────────────────── */}
      <div className="lesson-eyebrow">{eyebrowText}</div>

      <h2 className="lesson-display-title">
        <Trans i18nKey={title} components={{ em: <em /> }} />
      </h2>

      <hr className="lesson-rule" />

      {(time !== undefined || practice !== undefined) && (
        <div className="lesson-meta-strip">
          {time !== undefined && (
            <span><strong>{time} {t("lesson_meta_min")}</strong> · {t("lesson_meta_read")}</span>
          )}
          {practice !== undefined && (
            <span><strong>{practice} {t("lesson_meta_min")}</strong> · {t("lesson_meta_practice")}</span>
          )}
        </div>
      )}

      {goal ? (
        <p className="lesson-goal">{t(goal)}</p>
      ) : subtitle ? (
        <p className="text-[var(--ink-3)] text-[1.05rem] mb-8 max-w-[640px] leading-relaxed">{t(subtitle)}</p>
      ) : null}

      {/* ── Body ───────────────────────────────────────────────── */}
      <div>{children}</div>

      {/* ── Auto-close (if recap given) ─────────────────────────── */}
      {recap && (
        <LessonClose
          recap={recap}
          nextId={nextId}
          nextLabel={nextLabel}
          num={num}
          lessonId={id}
          phaseEnd={isPhaseEnd}
        />
      )}
    </section>
  );
}

// ─── Lesson Close ───────────────────────────────────────────────
// The deliberate end-of-lesson moment.
//   • checkmark + recap          — closure beat
//   • "Stop here?" (phase end)   — permission to put the book down
//   • mark-complete button       — sidebar dot fills, motivation
//   • next-lesson pointer        — chains forward when ready

export function LessonClose({
  recap, nextId, nextLabel, num, lessonId, phaseEnd,
}: {
  recap: string;
  nextId?: string;
  nextLabel?: string;
  num?: string;
  lessonId?: string;
  phaseEnd?: boolean;
}) {
  const { t } = useTranslation();
  const { isComplete, toggleComplete } = useLessonNav();
  const done = lessonId ? isComplete(lessonId) : false;

  const completeLabel =
    num && num !== "★"
      ? `${t("lesson_label")} ${num} ${t("lesson_complete")}`
      : t("lesson_complete_generic");

  return (
    <div className="lesson-close">
      <div className="lesson-close-mark">
        <span className="check" aria-hidden="true">✓</span>
        <span>{completeLabel}</span>
      </div>
      <p className="lesson-close-recap">{t(recap)}</p>

      {phaseEnd && (
        <div className="lesson-stop-here">
          <span className="lesson-stop-here-glyph" aria-hidden="true">◐</span>
          <div>
            <div className="lesson-stop-here-label">{t("lesson_stop_here_label")}</div>
            <div className="lesson-stop-here-body">{t("lesson_stop_here_body")}</div>
          </div>
        </div>
      )}

      <div className="lesson-close-actions">
        {lessonId && (
          <button
            type="button"
            onClick={() => toggleComplete(lessonId)}
            className={`lesson-mark-complete${done ? " is-complete" : ""}`}
            aria-pressed={done}
          >
            <span aria-hidden="true">{done ? "✓" : "○"}</span>
            <span>{done ? t("lesson_marked_complete") : t("lesson_mark_complete")}</span>
          </button>
        )}
        {nextId && nextLabel && (
          <a href={`#${nextId}`} className="lesson-close-next">
            <span className="next-label">{t("lesson_next")}:</span>
            <span><Trans i18nKey={nextLabel} components={{ em: <em /> }} /></span>
            <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Section Heading ────────────────────────────────────────────
// Now supports an optional `mode` pill that tells the learner what
// cognitive mode the upcoming block requires.
//   read    — passive reading (default; pill omitted)
//   say     — speak aloud (gold)
//   recall  — cover & retrieve (rose)
//   write   — write out (blue)

export function SectionHeading({
  children,
  mode,
}: {
  children: ReactNode;
  mode?: LessonMode;
}) {
  const { t } = useTranslation();
  return (
    <h3 className="font-display text-[1.35rem] font-normal text-[var(--ink)] mt-12 mb-4 tracking-tight">
      {typeof children === "string" ? t(children) : children}
      {mode && mode !== "read" && (
        <span className={`mode-pill mode-pill-${mode}`}>{t(`mode_${mode}`)}</span>
      )}
    </h3>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h4 className="font-mono text-[11px] font-semibold text-[var(--ink-3)] uppercase tracking-[0.14em] mt-8 mb-3">
      {children}
    </h4>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <p className="text-[var(--ink-2)] text-[1rem] leading-[1.65] mb-4 max-w-[680px]">{children}</p>;
}

export function MonoBlock({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono text-[0.92rem] leading-[2.05] mt-2 text-[var(--ink-2)]">{children}</div>
  );
}

// ─── InfoBox ────────────────────────────────────────────────────

const BOX_STYLES: Record<BoxVariant, { bg: string; border: string; titleColor: string }> = {
  blue: { bg: "bg-[var(--question-bg)]", border: "border-[var(--question-border)]", titleColor: "text-[var(--question)]" },
  gold: { bg: "bg-[var(--gold-soft)]", border: "border-[var(--gold-border)]", titleColor: "text-[var(--gold)]" },
  green: { bg: "bg-[var(--affirm-bg)]", border: "border-[var(--affirm-border)]", titleColor: "text-[var(--affirm)]" },
  neutral: { bg: "bg-[var(--surface-2)]", border: "border-[var(--border)]", titleColor: "text-[var(--ink)]" },
};

export function InfoBox({ variant = "neutral", title, children }: { variant?: BoxVariant; title?: string; children: ReactNode }) {
  const { t } = useTranslation();
  const s = BOX_STYLES[variant];
  return (
    <div className={`rounded-[var(--radius-lg)] py-5 px-6 my-6 border ${s.bg} ${s.border}`}>
      {title && <h4 className={`mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] ${s.titleColor}`}>{t(title)}</h4>}
      <div className="text-[0.95rem] text-[var(--ink-2)] leading-[1.7] [&>p]:mb-2 [&>p:last-child]:mb-0">
        {children}
      </div>
    </div>
  );
}

// ─── Semantic boxes ─────────────────────────────────────────────
// Thin wrappers around InfoBox that tell the learner the cognitive bucket
// of the content. Use these in new lesson content; legacy InfoBox calls
// continue to work unchanged.
//
//   <Remember>  — gold star — "this is the takeaway, memorise it"
//   <Pitfall>   — rose triangle — "common mistake, watch out"
//   <Aside>     — gray crosshatch — "side context / etymology / fun fact"
//   <Note>      — blue circle — "background info, not on the test"
//
// Each accepts an optional `title` (i18n key). Body is free-form children.

type SemanticBoxKind = "remember" | "pitfall" | "aside" | "note";

const SEMANTIC_GLYPHS: Record<SemanticBoxKind, string> = {
  remember: "★",
  pitfall:  "⚠",
  aside:    "⌗",
  note:     "◯",
};

function SemanticBox({
  kind, title, children,
}: {
  kind: SemanticBoxKind;
  title?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className={`box-semantic ${kind}`}>
      <div className="box-semantic-meta">
        <span aria-hidden="true">{SEMANTIC_GLYPHS[kind]}</span>
        <span>{t(`box_${kind}_label`)}{title ? ` · ${t(title)}` : ""}</span>
      </div>
      <div className="box-semantic-body">{children}</div>
    </div>
  );
}

export function Remember({ title, children }: { title?: string; children: ReactNode }) {
  return <SemanticBox kind="remember" title={title}>{children}</SemanticBox>;
}
export function Pitfall({ title, children }: { title?: string; children: ReactNode }) {
  return <SemanticBox kind="pitfall" title={title}>{children}</SemanticBox>;
}
export function Aside({ title, children }: { title?: string; children: ReactNode }) {
  return <SemanticBox kind="aside" title={title}>{children}</SemanticBox>;
}
export function Note({ title, children }: { title?: string; children: ReactNode }) {
  return <SemanticBox kind="note" title={title}>{children}</SemanticBox>;
}

// ─── DataTable ──────────────────────────────────────────────────

interface DataTableProps {
  headers: string[];
  rows: (string | ReactNode)[][];
  highlightCols?: number[];
  speakableCols?: number[];
  speakableRows?: boolean;
}

export function DataTable({ headers, rows, highlightCols = [], speakableCols = [] }: DataTableProps) {
  const { t } = useTranslation();
  return (
    <div className="overflow-x-auto my-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-1)]">
      <table className="w-full border-collapse text-[0.9rem]">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {headers.map((h, i) => (
              <th
                key={i}
                className="bg-[var(--surface-2)] text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-3)] py-3 px-4 text-left"
              >
                {t(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-2)]/40 transition-colors">
              {row.map((cell, j) => {
                const isHi = highlightCols.includes(j);
                const isSpeak = speakableCols.includes(j);
                const cls = `py-3 px-4 align-top ${isHi ? "text-[var(--gold)] font-medium font-mono text-[0.9rem]" : ""}`;
                if (typeof cell !== "string") return <td key={j} className={cls}>{cell}</td>;
                if (isSpeak && cell) {
                  return <td key={j} className={cls}><SpeakableCell raw={cell} /></td>;
                }
                return (
                  <td key={j} className={cls}>
                    <span className={isHi ? "" : j === 0 ? "font-mono text-[var(--ink)]" : "text-[var(--ink-2)]"}>{t(cell)}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Renders a table cell so every Romanian form inside it is individually
 * clickable. Splits on " / " (variants like "un / o") and " → " (transforms
 * like "a vorbi → vorbit"), preserving the separators for display.
 *
 * Previously, only the first variant became audible — clicking "bună" in
 * "bun / bună / buni / bune" would play "bun". Now each form gets its own
 * <RO> wrapper.
 */
function SpeakableCell({ raw }: { raw: string }) {
  // Strip a trailing "(English gloss)" so audio plays only the Romanian
  // while the display keeps the parenthetical. Example:
  //   raw = "apă (water)" → audio "apă", display "apă (water)"
  function splitGloss(s: string): { audio: string; display: string } {
    const m = s.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (m && /[a-zA-Z]/.test(m[2])) {
      return { audio: m[1].trim(), display: s };
    }
    return { audio: s, display: s };
  }

  const parts: ReactNode[] = [];
  // Split by " → " first (transformation), then each side by " / " (variants).
  const arrowSplit = raw.split(/\s*→\s*/);
  arrowSplit.forEach((segment, sIdx) => {
    const variants = segment.split(/\s*\/\s*/);
    variants.forEach((variant, vIdx) => {
      const trimmed = variant.trim();
      if (trimmed) {
        const { audio, display } = splitGloss(trimmed);
        parts.push(
          <RO key={`${sIdx}-${vIdx}`} text={audio} className="font-mono">{display}</RO>
        );
      }
      if (vIdx < variants.length - 1) parts.push(<span key={`${sIdx}-${vIdx}-sep`} className="text-[var(--ink-4)] mx-1">/</span>);
    });
    if (sIdx < arrowSplit.length - 1) parts.push(<span key={`${sIdx}-arrow`} className="text-[var(--ink-4)] mx-2">→</span>);
  });
  return <>{parts}</>;
}

// ─── PhraseGrid ─────────────────────────────────────────────────

export function PhraseGrid({ items }: { items: PhraseItem[] }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-5">
      {items.map((p, i) => (
        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] py-3 px-4 hover:border-[var(--border-2)] transition-colors">
          <div className="font-mono text-[var(--ink)] text-[0.92rem] mb-0.5 leading-snug">
            <RO text={p.ro} en={p.en} />
          </div>
          <div className="text-[var(--ink-2)] text-[0.84rem] italic">{t(p.en)}</div>
        </div>
      ))}
    </div>
  );
}

// ─── VocabGrid ──────────────────────────────────────────────────

function vocabSpeakable(ro: string): string {
  return ro.split("/")[0]?.split("→")[0]?.trim() ?? ro;
}

export function VocabGrid({ items }: { items: VocabItem[] }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 my-4">
      {items.map((v, i) => (
        <div key={i} className="flex justify-between items-baseline py-2 border-b border-[var(--border)] text-[0.9rem]">
          <span className="font-mono text-[var(--ink)]">
            <RO text={vocabSpeakable(v.ro)} en={v.en}>{v.ro}</RO>
          </span>
          <span className="text-[var(--ink-2)] text-[0.85rem] text-right ml-2">{t(v.en)}</span>
        </div>
      ))}
    </div>
  );
}

export function VocabSectionLabel({ icon, label }: { icon: string; label: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-baseline gap-2 mt-10 mb-3 pt-1">
      <span className="text-[1.1rem]">{icon}</span>
      <span className="font-display text-[1.15rem] text-[var(--ink)] tracking-tight">{t(`vocab_section_label_${label}`)}</span>
    </div>
  );
}

// ─── NumberGrid ─────────────────────────────────────────────────

export function NumberGrid({ items }: { items: NumberItem[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-1 my-4">
      {items.map((n, i) => (
        <div key={i} className="flex items-baseline justify-between py-2 border-b border-[var(--border)] text-[0.9rem]">
          <span className="font-mono text-[var(--gold)] font-semibold w-10">{n.num}</span>
          <span className="font-mono text-[var(--ink)] flex-1 ml-3">
            <RO text={vocabSpeakable(n.word)}>{n.word}</RO>
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── SoundGrid ──────────────────────────────────────────────────
//
// Each row shows a Romanian symbol/digraph plus an example word. Both are
// clickable: tap the big symbol to hear the sound itself; tap the example
// word to hear it in context. The symbol's primary speakable form is the
// first variant before "/" (e.g. "ă / Ă" → speaks "ă").

function symbolSpeakable(symbol: string): string {
  return symbol.split("/")[0]?.trim() ?? symbol;
}

export function SoundGrid({ items }: { items: SoundItem[] }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-4">
      {items.map((s, i) => (
        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] py-3 px-4 flex items-center gap-4 hover:border-[var(--border-2)] transition-colors">
          <div className="font-mono text-[1.4rem] font-semibold text-[var(--gold)] min-w-[44px] text-center">
            <RO text={symbolSpeakable(s.symbol)} bare>{s.symbol}</RO>
          </div>
          <div className="flex-1 text-[0.85rem]">
            <div className="text-[var(--ink)]">{t(s.pronunciation)}</div>
            <div className="text-[var(--ink-2)] text-[0.82rem] italic mt-0.5">
              {s.example ? <RO text={s.exampleWord}>{t(s.example)}</RO> : t(s.description ?? "")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── DialogueBox ────────────────────────────────────────────────

import type { DialogueData } from "../types";

export function DialogueBox({ dialogue }: { dialogue: DialogueData }) {
  const { t } = useTranslation();
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] py-5 px-6 my-6 shadow-[var(--shadow-1)]">
      <div className="flex items-baseline gap-2 mb-4 pb-3 border-b border-[var(--border)]">
        <span className="text-[1rem]">{dialogue.icon}</span>
        <span className="font-display text-[1.1rem] text-[var(--ink)] tracking-tight">{t(dialogue.title)}</span>
      </div>
      <div className="space-y-3">
        {dialogue.lines.map((line, i) => (
          <div key={i} className="grid grid-cols-[24px_1fr] gap-3 text-[0.95rem]">
            <span className={`font-mono font-semibold text-[0.78rem] mt-0.5 ${line.speaker === "A" ? "text-[var(--gold)]" : "text-[var(--question)]"}`}>
              {line.speaker}
            </span>
            <div>
              <div className="text-[var(--ink)] leading-snug"><RO text={line.ro} en={line.en} /></div>
              <div className="text-[var(--ink-2)] text-[0.84rem] italic mt-0.5">{t(line.en)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PrincipleGrid ──────────────────────────────────────────────

export function PrincipleGrid({ items }: { items: PrincipleItem[] }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-5">
      {items.map((p, i) => (
        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] py-4 px-5 hover:border-[var(--border-2)] transition-colors">
          <div className="flex items-baseline gap-3 mb-1.5">
            <span className="font-mono text-[var(--gold)] text-[0.85rem] font-semibold">{p.num}</span>
            <span className="font-display text-[1.05rem] text-[var(--ink)] tracking-tight">{t(p.title)}</span>
          </div>
          <p className="text-[var(--ink-2)] text-[0.88rem] leading-[1.55]">{t(p.description)}</p>
        </div>
      ))}
    </div>
  );
}

// ─── ScheduleGrid ───────────────────────────────────────────────

export function ScheduleGrid({ items }: { items: ScheduleItem[] }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-5">
      {items.map((s, i) => (
        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] py-3 px-4">
          <div className="font-mono text-[var(--gold)] text-[0.72rem] font-semibold uppercase tracking-[0.1em] mb-1">{t(s.days)}</div>
          <div
            className="text-[0.86rem] text-[var(--ink-2)] leading-snug"
            dangerouslySetInnerHTML={{ __html: t(s.task).replace(/\*\*(.*?)\*\*/g, '<b class="text-[var(--ink)] font-medium">$1</b>') }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── FillerGrid ─────────────────────────────────────────────────

export function FillerGrid({ items }: { items: FillerItem[] }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-5">
      {items.map((f, i) => (
        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] py-3 px-4">
          <div className="font-mono text-[1rem] font-semibold text-[var(--gold)] mb-0.5">
            <RO text={f.word} />
          </div>
          <div className="text-[0.84rem] text-[var(--ink-2)] mb-1">{t(f.meaning)}</div>
          <div className="font-mono text-[0.82rem] text-[var(--ink-2)] italic">{f.example}</div>
        </div>
      ))}
    </div>
  );
}

// ─── ContrastBox ────────────────────────────────────────────────

export function ContrastBox({ columns }: { columns: ContrastColumn[] }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-5">
      {columns.map((col, i) => (
        <div
          key={i}
          className={`rounded-[var(--radius)] py-4 px-5 border ${
            col.type === "yes"
              ? "bg-[var(--affirm-bg)] border-[var(--affirm-border)]"
              : "bg-[var(--neg-bg)] border-[var(--neg-border)]"
          }`}
        >
          <h5 className={`text-[10.5px] uppercase tracking-[0.1em] font-semibold mb-2 ${col.type === "yes" ? "text-[var(--affirm)]" : "text-[var(--neg)]"}`}>
            {t(col.title)}
          </h5>
          <div className="font-mono text-[0.86rem] leading-[1.85] space-y-1">
            {col.items.map((item, j) => (
              <div key={j}>
                <RO text={item.ro} en={item.en} />
                <span className="text-[var(--ink-2)] not-italic text-[0.8rem] block">{t(item.en)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── VerbCardGrid ───────────────────────────────────────────────

export function VerbCardGrid({ verbs }: { verbs: VerbDefinition[] }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 my-6">
      {verbs.map((v, i) => (
        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] py-4 px-5 hover:border-[var(--border-2)] hover:shadow-[var(--shadow-1)] transition-all">
          <div className="font-display text-[1.1rem] text-[var(--ink)] tracking-tight">
            <RO text={v.infinitive} en={v.meaning} />
          </div>
          <div className="text-[var(--ink-2)] text-[0.82rem] mb-3 italic">{t(v.meaning)}</div>
          <div className="space-y-1.5 text-[0.85rem]">
            <div className="flex items-baseline justify-between">
              <span className="text-[var(--ink-3)] font-mono text-[0.75rem]">eu</span>
              <span className="font-mono text-[var(--ink)]"><RO text={v.euForm.split(" ").slice(-1)[0] ?? v.euForm}>{v.euForm}</RO></span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[var(--ink-3)] font-mono text-[0.75rem]">el / ea</span>
              <span className="font-mono text-[var(--ink)]"><RO text={v.elForm.split(" ")[0] ?? v.elForm}>{v.elForm}</RO></span>
            </div>
            <div className="flex items-baseline justify-between pt-1.5 border-t border-[var(--border)]">
              <span className="text-[var(--ink-3)] font-mono text-[0.75rem]">{t("verbcard_past")}</span>
              <span className="font-mono text-[var(--gold)] font-medium">
                <RO text={v.participle}>am {v.participle}</RO>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── TestBox (collapsible self-test) ────────────────────────────

function TestRow({ item }: { item: TestItem }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border)] last:border-b-0 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left text-[0.92rem] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors flex items-baseline gap-2"
      >
        <span className="text-[var(--ink-4)] font-mono text-[0.78rem] mt-0.5">{open ? "−" : "+"}</span>
        <span className="flex-1">{t(item.question)}</span>
      </button>
      {open && (
        <div className="ml-5 mt-2 font-mono text-[0.92rem] text-[var(--gold)] fade-in">
          <RO text={item.answer} />
        </div>
      )}
    </div>
  );
}

export function TestBox({ title, items }: { title: string; items: TestItem[] }) {
  const { t } = useTranslation();
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] py-5 px-6 my-6 shadow-[var(--shadow-1)]">
      <h4 className="font-mono text-[11px] font-semibold text-[var(--ink-3)] uppercase tracking-[0.12em] mb-2">{t(title)}</h4>
      <p className="text-[0.78rem] text-[var(--ink-4)] mb-2 italic">{t("test_helper")}</p>
      <div>
        {items.map((item, i) => <TestRow key={i} item={item} />)}
      </div>
    </div>
  );
}

// ─── PsychBox ───────────────────────────────────────────────────

export function PsychBox({ title, questions, footer }: { title: string; questions: string[]; footer?: string }) {
  const { t } = useTranslation();
  return (
    <div className="bg-[var(--gold-soft)] border border-[var(--gold-border)] rounded-[var(--radius-lg)] py-5 px-6 my-6">
      <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--gold)] mb-3">{t(title)}</h4>
      <ul className="space-y-2">
        {questions.map((q, i) => (
          <li key={i} className="text-[0.95rem] text-[var(--ink-2)] italic leading-[1.6] pl-4 border-l-2 border-[var(--gold)]/40">
            {t(q)}
          </li>
        ))}
      </ul>
      {footer && <p className="mt-4 text-[0.88rem] text-[var(--gold)] font-medium">{t(footer)}</p>}
    </div>
  );
}

// ─── Drill Box (study tip, not interactive) ─────────────────────

export function DrillBox({ title, children, examples }: { title: string; children?: ReactNode; examples?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="bg-[var(--affirm-bg)] border border-[var(--affirm-border)] rounded-[var(--radius-lg)] py-5 px-6 my-6">
      <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--affirm)] mb-2">{t(title)}</h4>
      {children && <div className="text-[0.92rem] text-[var(--ink-2)] mb-3 leading-[1.65]">{children}</div>}
      {examples && (
        <div
          className="font-mono text-[0.88rem] border border-[var(--affirm-border)] rounded-[var(--radius)] py-3 px-4 leading-[2]"
          style={{ background: "color-mix(in srgb, var(--surface) 70%, transparent)" }}
        >
          {examples}
        </div>
      )}
    </div>
  );
}

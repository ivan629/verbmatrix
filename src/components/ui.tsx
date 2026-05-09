import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type {
  BoxVariant, PhraseItem, VocabItem, NumberItem, SoundItem,
  PrincipleItem, ScheduleItem, FillerItem, TestItem, ContrastColumn, VerbDefinition,
} from "../types";
import { RO } from "./RO";

// ─── Lesson Section ─────────────────────────────────────────────

interface LessonSectionProps {
  id: string;
  num: string;
  tag: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function LessonSection({ id, num, tag, title, subtitle, children }: LessonSectionProps) {
  const { t } = useTranslation();
  return (
    <section id={id} className="mb-24 scroll-mt-20 fade-in">
      <div className="flex items-center gap-3 mb-3 text-[var(--ink-3)]">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] font-medium">
          {num === "★" ? "✦" : `${t("lesson_label")} ${num}`}
        </span>
        <span className="w-6 h-px bg-[var(--border-2)]" />
        <span className="font-mono text-[11px] uppercase tracking-[0.12em]">{t(tag)}</span>
      </div>
      <h2 className="font-display text-[2rem] md:text-[2.4rem] font-normal text-[var(--ink)] leading-[1.1] tracking-tight mb-3">
        {t(title)}
      </h2>
      {subtitle && <p className="text-[var(--ink-3)] text-[1.05rem] mb-8 max-w-[640px] leading-relaxed">{t(subtitle)}</p>}
      <div>{children}</div>
    </section>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <h3 className="font-display text-[1.35rem] font-normal text-[var(--ink)] mt-12 mb-4 tracking-tight">
      {typeof children === "string" ? t(children) : children}
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
                  const main = cell.split("→")[0]?.split("/")[0]?.trim() ?? cell;
                  return (
                    <td key={j} className={cls}>
                      <RO text={main} className="font-mono">{cell}</RO>
                    </td>
                  );
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

export function SoundGrid({ items }: { items: SoundItem[] }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-4">
      {items.map((s, i) => (
        <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] py-3 px-4 flex items-center gap-4 hover:border-[var(--border-2)] transition-colors">
          <div className="font-mono text-[1.4rem] font-semibold text-[var(--gold)] min-w-[44px] text-center">
            {s.symbol}
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

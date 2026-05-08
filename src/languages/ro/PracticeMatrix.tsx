import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Matrix } from "../../components/Matrix";
import { LessonSection, InfoBox } from "../../components/ui";
import {
    ALL_CONJUGATIONS,
    buildMatrix,
    type VerbConjugation,
} from "./data/conjugations";

// ─── Custom verb dropdown ───────────────────────────────────────
//
// A typography-led combobox. The trigger looks like the verb name itself
// (display serif, large); clicking it opens a custom popover panel listing
// every verb, styled to match the rest of the app — no native browser
// chrome anywhere.
//
// Keyboard support: ↑/↓ navigate, Home/End jump, Enter/Space select,
// Esc close, Tab close, type-ahead ("v" → next verb starting with v,
// stripping the leading "a "). Click outside to close. Selected verb
// auto-scrolls into view when opening.
//
// Accessibility: WAI-ARIA "combobox with listbox" pattern. Focus stays
// on the trigger button; the highlighted option is reflected via
// aria-activedescendant rather than moving DOM focus into the list.

interface VerbSelectProps {
    verbs: readonly VerbConjugation[];
    value: number;
    onChange: (idx: number) => void;
}

function VerbSelect({ verbs, value, onChange }: VerbSelectProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [highlight, setHighlight] = useState<number>(value);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const typeBuffer = useRef<{ str: string; t: number }>({ str: "", t: 0 });

    const selected = verbs[value];
    const optId = (i: number) => `verbselect-opt-${i}`;
    const listboxId = "verbselect-listbox";

    // Slide-in/fade-in transition on mount.
    useEffect(() => {
        if (open) {
            const f = requestAnimationFrame(() => setMounted(true));
            return () => cancelAnimationFrame(f);
        }
        setMounted(false);
    }, [open]);

    // When opening, sync highlight to current value & scroll it to centre.
    useEffect(() => {
        if (!open) return;
        setHighlight(value);
        requestAnimationFrame(() => {
            const el = listRef.current?.querySelector(`#${optId(value)}`);
            el?.scrollIntoView({ block: "center" });
        });
    }, [open, value]);

    // Keep the highlighted option scrolled into view as it changes.
    useEffect(() => {
        if (!open) return;
        const el = listRef.current?.querySelector(`#${optId(highlight)}`);
        el?.scrollIntoView({ block: "nearest" });
    }, [highlight, open]);

    // Outside-click closes.
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (triggerRef.current?.contains(target)) return;
            if (listRef.current?.contains(target)) return;
            setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Strip leading "a " from verb root so type-ahead matches the meaningful
    // letter ("v" → "a vorbi", "a vrea", "a veni", "a vedea").
    const root = useCallback((s: string) => s.replace(/^a\s+/i, "").toLowerCase(), []);

    const onTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (open) {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setHighlight((h) => Math.min(h + 1, verbs.length - 1));
                    return;
                case "ArrowUp":
                    e.preventDefault();
                    setHighlight((h) => Math.max(h - 1, 0));
                    return;
                case "Home":
                    e.preventDefault();
                    setHighlight(0);
                    return;
                case "End":
                    e.preventDefault();
                    setHighlight(verbs.length - 1);
                    return;
                case "Enter":
                case " ":
                    e.preventDefault();
                    onChange(highlight);
                    setOpen(false);
                    return;
                case "Escape":
                    e.preventDefault();
                    setOpen(false);
                    return;
                case "Tab":
                    setOpen(false);
                    return;
            }
            // Type-ahead: any single printable char advances to the next match.
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const now = Date.now();
                if (now - typeBuffer.current.t > 600) typeBuffer.current.str = "";
                typeBuffer.current.str += e.key.toLowerCase();
                typeBuffer.current.t = now;
                const search = typeBuffer.current.str;
                const start = search.length === 1 ? highlight + 1 : highlight;
                for (let i = 0; i < verbs.length; i++) {
                    const idx = (start + i) % verbs.length;
                    if (root(verbs[idx].infinitive).startsWith(search)) {
                        setHighlight(idx);
                        break;
                    }
                }
            }
        } else if (
            e.key === "ArrowDown" ||
            e.key === "ArrowUp" ||
            e.key === "Enter" ||
            e.key === " "
        ) {
            e.preventDefault();
            setOpen(true);
        }
    };

    return (
        <div className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((o) => !o)}
                onKeyDown={onTriggerKeyDown}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-activedescendant={open ? optId(highlight) : undefined}
                className="group inline-flex items-baseline cursor-pointer outline-none"
            >
        <span className="font-display text-[1.5rem] leading-none text-[var(--ink)] tracking-tight transition-colors group-hover:text-[var(--gold)] group-focus-visible:text-[var(--gold)]">
          {selected.infinitive}
        </span>
                <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-4)]">
          {t(selected.meaning)}
        </span>
                <svg
                    aria-hidden="true"
                    width="9"
                    height="9"
                    viewBox="0 0 10 10"
                    className={`ml-2.5 transition-all duration-200 ${
                        open
                            ? "rotate-180 text-[var(--gold)]"
                            : "text-[var(--ink-4)] group-hover:text-[var(--gold)] group-focus-visible:text-[var(--gold)]"
                    }`}
                >
                    <path
                        d="M2 3.5l3 3 3-3"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span
                    aria-hidden="true"
                    className={`absolute -bottom-1.5 left-0 right-0 h-px bg-[var(--gold)] origin-left transition-transform duration-200 ${
                        open
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                    }`}
                />
            </button>

            {open && (
                <ul
                    ref={listRef}
                    id={listboxId}
                    role="listbox"
                    aria-label={t("matrix_choose_verb")}
                    className={`
            absolute top-full left-0 mt-3 z-30
            min-w-[300px] max-h-[320px] overflow-y-auto
            bg-[var(--surface)] border border-[var(--border)]
            rounded-md py-1.5 outline-none
            shadow-[0_8px_28px_-6px_rgba(0,0,0,0.14),0_3px_8px_-3px_rgba(0,0,0,0.06)]
            transition-all duration-150 ease-out
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}
          `}
                >
                    {verbs.map((v, i) => {
                        const isSelected = i === value;
                        const isHighlighted = i === highlight;
                        return (
                            <li
                                key={v.infinitive}
                                id={optId(i)}
                                role="option"
                                aria-selected={isSelected}
                                onMouseEnter={() => setHighlight(i)}
                                onClick={() => {
                                    onChange(i);
                                    setOpen(false);
                                    triggerRef.current?.focus();
                                }}
                                className={`
                  px-3.5 py-2 cursor-pointer flex items-baseline gap-3
                  transition-colors
                  ${isHighlighted ? "bg-[var(--surface-2)]" : ""}
                `}
                            >
                <span
                    aria-hidden="true"
                    className="font-mono text-[10px] w-2.5 text-[var(--gold)] flex-shrink-0"
                >
                  {isSelected ? "★" : ""}
                </span>
                                <span
                                    className={`font-display text-[14px] tracking-tight flex-shrink-0 ${
                                        isSelected ? "text-[var(--gold)]" : "text-[var(--ink)]"
                                    }`}
                                >
                  {v.infinitive}
                </span>
                                <span className="ml-auto font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--ink-4)] truncate">
                  {t(v.meaning)}
                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

// ─── Practice Matrix section ────────────────────────────────────

/**
 * The Practice Matrix — the core engine of the resource.
 *
 * Lives at the very top of the page (right after the Hero) so that every
 * time a learner opens the app, the first thing they see is the drill grid.
 * Pick any verb from the dropdown (or hit "random" for blind drilling) and
 * all nine cells — three tenses × three forms — populate instantly.
 *
 * Hover any line for the meaning + pronunciation, click to hear it spoken.
 */
export function PracticeMatrix() {
    const { t } = useTranslation();

    // Default to "a vorbi" — it's the canonical example used in Lesson 3.
    const initialIdx = Math.max(
        0,
        ALL_CONJUGATIONS.findIndex((v) => v.infinitive === "a vorbi"),
    );
    const [verbIdx, setVerbIdx] = useState<number>(initialIdx);

    const verb = ALL_CONJUGATIONS[verbIdx];

    const matrixData = useMemo(
        () => buildMatrix(verb, `${verb.infinitive} — ${t(verb.meaning)}`),
        [verb, t],
    );

    const pickRandom = useCallback(() => {
        if (ALL_CONJUGATIONS.length <= 1) return;
        let next = verbIdx;
        while (next === verbIdx) {
            next = Math.floor(Math.random() * ALL_CONJUGATIONS.length);
        }
        setVerbIdx(next);
    }, [verbIdx]);

    return (
        <LessonSection
            id="matrix"
            num="★"
            tag="matrix_section_tag"
            title="matrix_section_title"
            subtitle="matrix_section_subtitle"
        >
            {/* Controls: typography-led custom verb dropdown + random button.
          The dropdown is fully custom (no native browser chrome). The
          random button is unchanged. */}
            <div className="my-7 flex flex-wrap items-baseline gap-x-6 gap-y-3">
                <VerbSelect
                    verbs={ALL_CONJUGATIONS}
                    value={verbIdx}
                    onChange={setVerbIdx}
                />

                <button
                    type="button"
                    onClick={pickRandom}
                    aria-label={t("matrix_random_aria")}
                    title={t("matrix_random_aria")}
                    className="
            px-4 py-2.5
            bg-[var(--gold-soft)] hover:bg-[var(--gold-border)]
            text-[var(--gold)] border border-[var(--gold-border)]
            rounded-md font-mono text-[11px] uppercase tracking-[0.12em] font-semibold
            transition-colors flex items-center gap-2
          "
                >
                    <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
                        <circle cx="2" cy="2" r="1" fill="currentColor" />
                        <circle cx="9" cy="2" r="1" fill="currentColor" />
                        <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
                        <circle cx="2" cy="9" r="1" fill="currentColor" />
                        <circle cx="9" cy="9" r="1" fill="currentColor" />
                    </svg>
                    {t("matrix_random")}
                </button>
            </div>

            <Matrix data={matrixData} />

            <InfoBox variant="gold" title="matrix_drill_title">
                <p>{t("matrix_drill_body")}</p>
            </InfoBox>
        </LessonSection>
    );
}

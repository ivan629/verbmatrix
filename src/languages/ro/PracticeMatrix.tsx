import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Matrix } from "../../components/Matrix";
import { LessonSection, InfoBox } from "../../components/ui";
import {
    ALL_CONJUGATIONS,
    buildMatrix,
    type VerbConjugation,
} from "./data/conjugations";

// ─── Verb Picker (Option C) ─────────────────────────────────────
//
// Single-line picker that fits comfortably above the matrix without
// adding vertical bulk:
//
//   [a fi · a avea · a face · a merge · a vrea · a putea · a ști · a vedea]  [+24 more ▾]   [⤬]
//
// The 8 highest-frequency verbs are always one click away. The
// remaining 24 live in a popover, opened by the "+24 more ▾" trigger.
// When a popover verb is selected, the trigger itself glows gold to
// indicate "your current verb is inside here."

const CORE_INFINITIVES: readonly string[] = [
    "a fi",
    "a avea",
    "a face",
    "a merge",
    "a vrea",
    "a putea",
    "a ști",
    "a vedea",
];

// ── Single chip used for both CORE verbs and the popover trigger ──
function Chip({
    children,
    isSelected,
    onClick,
    onKeyDown,
    role,
    ariaProps = {},
    refProp,
}: {
    children: React.ReactNode;
    isSelected: boolean;
    onClick: () => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
    role?: string;
    ariaProps?: Record<string, string | boolean | undefined>;
    refProp?: React.Ref<HTMLButtonElement>;
}) {
    return (
        <button
            ref={refProp}
            type="button"
            role={role}
            onClick={onClick}
            onKeyDown={onKeyDown}
            onMouseDown={(e) => {
                // Prevent the browser from auto-focusing this button on click.
                // Implicit focus can cause the page to scroll when the button
                // is near a viewport edge; we don't need focus here because
                // selection state is communicated via aria-checked.
                e.preventDefault();
            }}
            {...ariaProps}
            className={`
                font-display tracking-tight text-[1rem] leading-snug
                px-1.5 py-0.5 -mx-0.5
                rounded-sm whitespace-nowrap
                transition-colors duration-150 outline-none
                ${isSelected
                    ? "text-[var(--gold)] underline underline-offset-[5px] decoration-[1.5px]"
                    : "text-[var(--ink)] hover:text-[var(--gold)] focus-visible:text-[var(--gold)]"}
                focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]
            `}
        >
            {children}
        </button>
    );
}

// ── Popover containing the 24 MORE verbs ──

/**
 * Scroll the list container so a given option is visible. Manipulates only
 * the list's own scrollTop — never calls Element.scrollIntoView, which
 * would bubble up and scroll the page.
 *
 *   center=true  → centre the option vertically (used on open)
 *   center=false → scroll just enough to bring it to the nearest edge
 */
function scrollListToOption(
    list: HTMLUListElement | null,
    optIdx: number,
    center: boolean,
) {
    if (!list) return;
    const item = list.querySelector<HTMLElement>(`[data-opt-idx="${optIdx}"]`);
    if (!item) return;
    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.offsetHeight;
    const visibleTop = list.scrollTop;
    const visibleBottom = visibleTop + list.clientHeight;
    if (center) {
        list.scrollTop = Math.max(
            0,
            itemTop - (list.clientHeight - item.offsetHeight) / 2,
        );
    } else if (itemTop < visibleTop) {
        list.scrollTop = itemTop;
    } else if (itemBottom > visibleBottom) {
        list.scrollTop = itemBottom - list.clientHeight;
    }
}

function MoreVerbsPopover({
    verbs,
    selectedInfinitive,
    onPick,
}: {
    verbs: { verb: VerbConjugation; idx: number }[];
    selectedInfinitive: string;
    onPick: (idx: number) => void;
}) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [highlight, setHighlight] = useState(0);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const isSelectedInMore = verbs.some(({ verb }) => verb.infinitive === selectedInfinitive);
    const selectedIdxInList = verbs.findIndex(({ verb }) => verb.infinitive === selectedInfinitive);

    // Slide/fade transition on mount.
    useEffect(() => {
        if (open) {
            const f = requestAnimationFrame(() => setMounted(true));
            return () => cancelAnimationFrame(f);
        }
        setMounted(false);
    }, [open]);

    // Sync highlight to currently-selected verb (or 0) on open + scroll into view.
    useEffect(() => {
        if (!open) return;
        const initial = selectedIdxInList >= 0 ? selectedIdxInList : 0;
        setHighlight(initial);
        // Use rAF so the list is rendered before we measure offsets.
        requestAnimationFrame(() => {
            scrollListToOption(listRef.current, initial, /* center */ true);
        });
    }, [open, selectedIdxInList]);

    // Keep highlighted option scrolled into view as it changes (nearest edge only).
    useEffect(() => {
        if (!open) return;
        scrollListToOption(listRef.current, highlight, /* center */ false);
    }, [highlight, open]);

    // Outside click closes.
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
                    onPick(verbs[highlight].idx);
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
        <div className="relative inline-block">
            <Chip
                refProp={triggerRef}
                isSelected={isSelectedInMore}
                onClick={() => setOpen((o) => !o)}
                onKeyDown={onTriggerKeyDown}
                role="button"
                ariaProps={{
                    "aria-haspopup": "listbox",
                    "aria-expanded": open,
                }}
            >
                <span>
                    {isSelectedInMore ? selectedInfinitive : t("matrix_more_verbs", { count: verbs.length })}
                </span>
                <svg
                    aria-hidden="true"
                    width="9"
                    height="9"
                    viewBox="0 0 10 10"
                    className={`inline-block ml-1.5 -translate-y-px transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
            </Chip>

            {open && (
                <ul
                    ref={listRef}
                    role="listbox"
                    aria-label={t("matrix_choose_verb")}
                    className={`
                        absolute top-full left-0 mt-2 z-30
                        min-w-[260px] max-h-[320px] overflow-y-auto
                        bg-[var(--surface)] border border-[var(--border)]
                        rounded-md py-1.5 outline-none
                        shadow-[0_8px_28px_-6px_rgba(0,0,0,0.14),0_3px_8px_-3px_rgba(0,0,0,0.06)]
                        transition-all duration-150 ease-out
                        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}
                    `}
                >
                    {verbs.map(({ verb, idx }, i) => {
                        const isSelected = verb.infinitive === selectedInfinitive;
                        const isHighlighted = i === highlight;
                        return (
                            <li
                                key={verb.infinitive}
                                data-opt-idx={i}
                                role="option"
                                aria-selected={isSelected}
                                onMouseEnter={() => setHighlight(i)}
                                onClick={() => {
                                    onPick(idx);
                                    setOpen(false);
                                    triggerRef.current?.focus({ preventScroll: true });
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
                                    {verb.infinitive}
                                </span>
                                <span className="ml-auto font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--ink-4)] truncate">
                                    {t(verb.meaning)}
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
 * Single-line verb picker: 8 CORE verbs inline (always visible, one click)
 * + a "+24 more ▾" popover for the long tail. Total height of the picker
 * is ~40px so the whole matrix fits in one viewport without scrolling.
 */
export function PracticeMatrix() {
    const { t } = useTranslation();

    // Default to "a vorbi" — canonical example used in Lesson 3.
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

    // Partition CORE / MORE while preserving original indices.
    const { coreVerbs, moreVerbs } = useMemo(() => {
        const indexed = ALL_CONJUGATIONS.map((verb, idx) => ({ verb, idx }));
        const coreSet = new Set(CORE_INFINITIVES);
        const coreVerbs = CORE_INFINITIVES
            .map((inf) => indexed.find(({ verb }) => verb.infinitive === inf))
            .filter((x): x is { verb: VerbConjugation; idx: number } => Boolean(x));
        const moreVerbs = indexed.filter(({ verb }) => !coreSet.has(verb.infinitive));
        return { coreVerbs, moreVerbs };
    }, []);

    const selectedInfinitive = verb?.infinitive ?? "";

    return (
        <LessonSection
            id="matrix"
            num="★"
            tag="matrix_section_tag"
            title="matrix_section_title"
            subtitle="matrix_section_subtitle"
        >
            <div
                role="radiogroup"
                aria-label={t("matrix_choose_verb")}
                className="my-7 flex flex-wrap items-baseline gap-x-1 gap-y-2"
            >
                {coreVerbs.map(({ verb, idx }, i) => (
                    <span key={verb.infinitive} className="inline-flex items-baseline">
                        <Chip
                            isSelected={verb.infinitive === selectedInfinitive}
                            onClick={() => setVerbIdx(idx)}
                            role="radio"
                            ariaProps={{
                                "aria-checked": verb.infinitive === selectedInfinitive,
                                "aria-label": `${verb.infinitive} — ${t(verb.meaning)}`,
                            }}
                        >
                            {verb.infinitive}
                        </Chip>
                        {i < coreVerbs.length - 1 && (
                            <span aria-hidden="true" className="text-[var(--ink-4)] mx-0.5 text-[0.85rem]">·</span>
                        )}
                    </span>
                ))}

                {/* Separator between CORE and MORE */}
                <span aria-hidden="true" className="text-[var(--ink-4)] mx-2 text-[0.85rem]">·</span>

                <MoreVerbsPopover
                    verbs={moreVerbs}
                    selectedInfinitive={selectedInfinitive}
                    onPick={setVerbIdx}
                />

                {/* Random — pushed to the right with auto margin */}
                <button
                    type="button"
                    onClick={pickRandom}
                    aria-label={t("matrix_random_aria")}
                    title={t("matrix_random_aria")}
                    className="
                        ml-auto px-2.5 py-1.5
                        bg-transparent hover:bg-[var(--gold-soft)]
                        text-[var(--ink-3)] hover:text-[var(--gold)]
                        border border-[var(--border)] hover:border-[var(--gold-border)]
                        rounded-md font-mono text-[10px] uppercase tracking-[0.14em]
                        transition-all flex items-center gap-1.5 flex-shrink-0
                    "
                >
                    <svg width="10" height="10" viewBox="0 0 11 11" aria-hidden="true">
                        <circle cx="2" cy="2" r="1" fill="currentColor" />
                        <circle cx="9" cy="2" r="1" fill="currentColor" />
                        <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
                        <circle cx="2" cy="9" r="1" fill="currentColor" />
                        <circle cx="9" cy="9" r="1" fill="currentColor" />
                    </svg>
                    <span className="hidden md:inline">{t("matrix_random")}</span>
                </button>
            </div>

            <Matrix data={matrixData} />

            <InfoBox variant="gold" title="matrix_drill_title">
                <p>{t("matrix_drill_body")}</p>
            </InfoBox>
        </LessonSection>
    );
}

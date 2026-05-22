import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTTS } from "../lib/tts";

/**
 * Scroll-driven cinematic section — v5, 10/10 pass.
 *
 * Five stages, each with its own composition:
 *   I.   single   — one word, intimate, centered. Huge "vorbesc" lands as a portrait.
 *   II.  matrix   — architectural blueprint of the 9 sentence types, fully labeled.
 *   III. verbs    — the verb wall, varying sizes (weight-based prominence).
 *   IV.  vocab    — the vocabulary cloud, common words larger, edge words quieter.
 *   V.   climax   — the matrix re-stated as the system, center cell glowing, synthesis text below.
 *
 * Visual identity:
 *   - Cool indigo base palette with progressive warm gold overlay (set in the
 *     atmospheric layers below).
 *   - Each stage owns its own layout — no shared right-column container.
 *   - Headlines use italic emphasis on the key verb of each stage's claim.
 *
 * Stage transitions:
 *   - React `key` on stage components forces remount → entry animations fire.
 *   - Hysteresis on stage boundaries prevents flicker on slow scrolling.
 *
 * Bottom UI:
 *   - Hairline progress bar (continuous).
 *   - Five stage dots, active dot extends into a 20px bar.
 */

type StageVariant = "single" | "matrix" | "verbs" | "vocab" | "climax";

interface Stage {
    readonly at: number;
    readonly variant: StageVariant;
}

const STAGES = [
    { at: 0.00, variant: "single" },
    { at: 0.20, variant: "matrix" },
    { at: 0.44, variant: "verbs"  },
    { at: 0.66, variant: "vocab"  },
    { at: 0.85, variant: "climax" },
] as const satisfies readonly Stage[];

const HYSTERESIS = 0.025;

// Weighted verb data — weight drives visual prominence in stage III.
const VERB_DATA: ReadonlyArray<readonly [string, 1 | 2 | 3]> = [
    ["a fi", 3], ["a avea", 3], ["a face", 3], ["a vorbi", 3],
    ["a merge", 2], ["a veni", 2], ["a vrea", 2], ["a putea", 2],
    ["a ști", 2], ["a vedea", 2], ["a da", 2], ["a lua", 2],
    ["a mânca", 1], ["a bea", 1], ["a dormi", 1], ["a citi", 1],
    ["a scrie", 1], ["a înțelege", 1], ["a plăcea", 1], ["a cumpăra", 1],
    ["a pleca", 1], ["a sta", 1], ["a învăța", 1], ["a plăti", 1],
    ["a lucra", 1], ["a locui", 1], ["a deschide", 1], ["a închide", 1],
    ["a spune", 1], ["a ajunge", 1], ["a chema", 1], ["a suna", 1],
];

// Weighted vocab data — common words larger in stage IV.
const VOCAB_DATA: ReadonlyArray<readonly [string, 1 | 2 | 3]> = [
    ["apă", 3], ["pâine", 3], ["cafea", 3], ["timp", 3], ["om", 3],
    ["casă", 2], ["lume", 2], ["zi", 2], ["noapte", 2], ["prieten", 2],
    ["copil", 2], ["mare", 2], ["munte", 2], ["soare", 2], ["lună", 2],
    ["fereastră", 1], ["pădure", 1], ["cer", 1], ["mâncare", 1], ["carte", 1],
    ["scaun", 1], ["masă", 1], ["bere", 1], ["vin", 1], ["lapte", 1],
    ["sat", 1], ["oraș", 1], ["drum", 1], ["tren", 1], ["mic", 1],
    ["frumos", 1], ["rece", 1], ["cald", 1], ["bun", 1], ["nou", 1],
    ["vechi", 1], ["greu", 1], ["ușor", 1], ["azi", 1], ["mâine", 1],
];

export function CinematicMatrix() {
    const sectionRef = useRef<HTMLElement>(null);
    const [progress, setProgress] = useState(0);
    const [stageIdx, setStageIdx] = useState(0);
    const stageIdxRef = useRef(0);

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
            const raw = scrolled / Math.max(totalScrollable, 1);
            const clamped = Math.max(0, Math.min(1, raw));
            setProgress(clamped);

            const current = stageIdxRef.current;
            let next = current;
            for (let i = STAGES.length - 1; i >= 0; i--) {
                const stage = STAGES[i];
                if (!stage) continue;
                const threshold = i > current ? stage.at + HYSTERESIS : stage.at - HYSTERESIS;
                if (clamped >= threshold) {
                    next = i;
                    break;
                }
            }
            if (next !== current) {
                stageIdxRef.current = next;
                setStageIdx(next);
            }
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

    const activeStage = STAGES[stageIdx] ?? STAGES[0];

    return (
        <section
            ref={sectionRef}
            className="scope-dark relative cv-auto-tall"
            style={{ height: "400vh" }}
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden">

                {/* Cool atmospheric base — distinct from the hero's warm gold palette */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "linear-gradient(180deg, rgba(244,190,122,0.05) 0%, transparent 18%)," +
                            "linear-gradient(180deg, rgba(110,130,170,0.05) 8%, transparent 38%)," +
                            "radial-gradient(ellipse 62% 50% at 18% 28%, rgba(80,100,160,0.18), transparent 65%)," +
                            "radial-gradient(ellipse 50% 40% at 86% 56%, rgba(100,120,170,0.11), transparent 60%)," +
                            "radial-gradient(ellipse 45% 36% at 50% 92%, rgba(60,80,130,0.10), transparent 60%)," +
                            "#06070c",
                    }}
                />

                {/* Progress-driven warm overlay — atmosphere brightens as user descends */}
                <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-700 ease-out"
                    style={{
                        opacity: 0.25 + progress * 0.6,
                        background:
                            "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(244,190,122,0.18), transparent 70%)",
                    }}
                />

                {/* The stage content — full screen, owns its layout */}
                <Stage key={`stage-${stageIdx}`} variant={activeStage.variant} />

                {/* Stage indicator + progress hairline */}
                <StageProgress stageIdx={stageIdx} progress={progress} />
            </div>
        </section>
    );
}

// ─── Stage router ───────────────────────────────────────────────

function Stage({ variant }: { variant: StageVariant }) {
    switch (variant) {
        case "single": return <StageSingle />;
        case "matrix": return <StageMatrix />;
        case "verbs":  return <StageVerbs />;
        case "vocab":  return <StageVocab />;
        case "climax": return <StageClimax />;
    }
}

// ─── Stage I — Single word, centered, intimate ──────────────────

function StageSingle() {
    const { t } = useTranslation();
    const speak = useTTS();
    const presentForm = t("landing_tl_demo_verb_1_p_a");
    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-5">
            <div className="max-w-[900px] w-full text-center">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-white/35 mb-10 stage-enter"
                     style={{ animationDelay: "0s" }}>
                    I.
                </div>
                <button
                    type="button"
                    onClick={() => speak(presentForm)}
                    className="font-display text-[clamp(4.2rem,13vw,10.5rem)] text-white font-light tracking-[-0.04em] leading-[0.9] stage-enter cursor-pointer hover:opacity-70 transition-opacity bg-transparent border-0 p-0"
                    style={{ animationDelay: "0.15s" }}>
                    {presentForm.split(" ")[1] ?? "vorbesc"}
                </button>
                <div className="font-mono text-[clamp(0.85rem,1.3vw,1rem)] uppercase tracking-[0.16em] text-white/50 mt-4 stage-enter"
                     style={{ animationDelay: "0.35s" }}>
                    — {t("cinematic_1_speak_gloss")}
                </div>
                <hr className="hero-rule mx-auto my-10 stage-enter" style={{ animationDelay: "0.55s" }} />
                <h2 className="font-display text-[clamp(1.5rem,3vw,2.2rem)] text-white/85 font-light tracking-[-0.02em] leading-snug stage-enter"
                    style={{ animationDelay: "0.7s" }}>
                    {t("cinematic_1_word")}
                </h2>
                <p className="font-display italic text-[clamp(0.95rem,1.4vw,1.1rem)] text-white/45 mt-3 stage-enter"
                   style={{ animationDelay: "0.85s" }}>
                    {t("cinematic_1_entry")}
                </p>
            </div>
        </div>
    );
}

// ─── Stage II — Matrix construction, architectural ──────────────

function StageMatrix() {
    const { t } = useTranslation();
    const speak = useTTS();
    const cells: ReadonlyArray<ReadonlyArray<string>> = [
        ["O să vorbesc?", "Eu o să vorbesc.", "N-o să vorbesc."],
        ["Vorbesc eu?",   "Eu vorbesc.",      "Eu nu vorbesc."],
        ["Am vorbit eu?", "Eu am vorbit.",    "Nu am vorbit."],
    ];
    const tenseLabels = ["FUT", "PRZ", "PST"] as const;
    const colSemantics = ["question", "affirm", "neg"] as const;
    const colSymbols = ["?", "+", "−"] as const;

    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-5 md:px-12">
            <div className="w-full max-w-[1100px]">
                <div className="text-center mb-10">
                    <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-white/35 mb-4 stage-enter"
                         style={{ animationDelay: "0s" }}>
                        II.
                    </div>
                    <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.4rem)] text-white font-light tracking-[-0.03em] leading-[1.05] mb-3 stage-enter"
                        style={{ animationDelay: "0.15s" }}>
                        {t("cinematic_2_title")}
                    </h2>
                    <p className="font-display italic text-[clamp(1rem,1.6vw,1.25rem)] text-white/55 stage-enter"
                       style={{ animationDelay: "0.3s" }}>
                        {t("cinematic_2_sub")}
                    </p>
                </div>

                <div className="max-w-[680px] mx-auto stage-enter" style={{ animationDelay: "0.45s" }}>
                    <div className="grid grid-cols-[52px_1fr_1fr_1fr] gap-2 mb-2">
                        <div />
                        {colSymbols.map((s, i) => (
                            <div key={s}
                                 className={`text-center font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--${colSemantics[i]})]`}>
                                {s}
                            </div>
                        ))}
                    </div>

                    {[0, 1, 2].map((row) => (
                        <div key={row} className="grid grid-cols-[52px_1fr_1fr_1fr] gap-2 mb-2">
                            <div className="flex items-center justify-end pr-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                                {tenseLabels[row]}
                            </div>
                            {cells[row]?.map((text, col) => (
                                <button
                                    key={col}
                                    type="button"
                                    onClick={() => speak(text)}
                                    className={`bg-white/[0.04] border border-white/10 rounded-lg p-3.5 text-center font-mono text-[11.5px] md:text-[12.5px] leading-tight text-[var(--${colSemantics[col]})] cursor-pointer hover:opacity-70 transition-opacity w-full`}>
                                    {text}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Stage III — Verb wall, weighted prominence ─────────────────

function StageVerbs() {
    const { t } = useTranslation();
    const speak = useTTS();
    const sizeFor = (w: 1 | 2 | 3) =>
        w === 3 ? "text-[clamp(1.4rem,2.4vw,2rem)]" :
            w === 2 ? "text-[clamp(1.1rem,1.7vw,1.45rem)]" :
                "text-[clamp(0.85rem,1.3vw,1.1rem)]";

    const colorFor = (w: 1 | 2 | 3) =>
        w === 3 ? "text-white/90" :
            w === 2 ? "text-white/65" :
                "text-white/40";

    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 md:px-12">
            <div className="text-center mb-10 max-w-[820px]">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-white/35 mb-4 stage-enter"
                     style={{ animationDelay: "0s" }}>
                    III.
                </div>
                <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.4rem)] text-white font-light tracking-[-0.03em] leading-[1.05] mb-3 stage-enter"
                    style={{ animationDelay: "0.15s" }}>
                    {t("cinematic_3_title")}
                </h2>
                <p className="font-display italic text-[clamp(1rem,1.6vw,1.25rem)] text-white/55 stage-enter"
                   style={{ animationDelay: "0.3s" }}>
                    {t("cinematic_3_sub")}
                </p>
            </div>

            <div className="w-full max-w-[1200px] flex flex-wrap justify-center items-baseline gap-x-5 gap-y-3 px-4 stage-enter"
                 style={{ animationDelay: "0.45s" }}>
                {VERB_DATA.map(([verb, weight], i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => speak(verb)}
                        className={`font-display italic tracking-tight ${sizeFor(weight)} ${colorFor(weight)} cursor-pointer hover:opacity-60 transition-opacity bg-transparent border-0 p-0`}>
                        {verb}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Stage IV — Vocabulary cloud, weighted prominence ──────────

function StageVocab() {
    const { t } = useTranslation();
    const speak = useTTS();
    const sizeFor = (w: 1 | 2 | 3) =>
        w === 3 ? "text-[clamp(1.4rem,2.4vw,2rem)]" :
            w === 2 ? "text-[clamp(1.1rem,1.6vw,1.4rem)]" :
                "text-[clamp(0.85rem,1.2vw,1.05rem)]";

    const colorFor = (w: 1 | 2 | 3) =>
        w === 3 ? "text-white/85" :
            w === 2 ? "text-white/60" :
                "text-white/40";

    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 md:px-12">
            <div className="text-center mb-10 max-w-[820px]">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-white/35 mb-4 stage-enter"
                     style={{ animationDelay: "0s" }}>
                    IV.
                </div>
                <h2 className="font-display text-[clamp(2.4rem,5.5vw,4.4rem)] text-white font-light tracking-[-0.03em] leading-[1.05] mb-3 stage-enter"
                    style={{ animationDelay: "0.15s" }}>
                    {t("cinematic_4_title")}
                </h2>
                <p className="font-display italic text-[clamp(1rem,1.6vw,1.25rem)] text-white/55 stage-enter"
                   style={{ animationDelay: "0.3s" }}>
                    {t("cinematic_4_sub")}
                </p>
            </div>

            <div className="w-full max-w-[1200px] flex flex-wrap justify-center items-baseline gap-x-4 gap-y-2 px-4 stage-enter"
                 style={{ animationDelay: "0.45s" }}>
                {VOCAB_DATA.map(([word, weight], i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => speak(word)}
                        className={`font-display ${sizeFor(weight)} ${colorFor(weight)} cursor-pointer hover:opacity-60 transition-opacity bg-transparent border-0 p-0`}>
                        {word}
                    </button>
                ))}
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--gold-bright)] self-center ml-3">
          {t("cinematic_4_more")}
        </span>
            </div>
        </div>
    );
}

// ─── Stage V — Climax: synthesis with glowing center ────────────

function StageClimax() {
    const { t } = useTranslation();
    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-5 md:px-12">
            <div className="w-full max-w-[1100px]">
                <div className="text-center mb-8">
                    <div className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-[var(--gold-bright)] mb-4 stage-enter"
                         style={{ animationDelay: "0s" }}>
                        {t("cinematic_5_roman")}
                    </div>
                </div>

                {/* Climax matrix — center cell glows, surrounding cells quiet */}
                <div className="grid grid-cols-3 gap-3 max-w-[440px] aspect-square mx-auto stage-enter"
                     style={{ animationDelay: "0.2s" }}>
                    {Array.from({ length: 9 }).map((_, i) => {
                        const isCenter = i === 4;
                        return (
                            <div key={i}
                                 className={`rounded-md border ${isCenter ? "climax-cell-glow" : ""}`}
                                 style={{
                                     background: isCenter
                                         ? "linear-gradient(135deg, rgba(244,190,122,0.32), rgba(232,122,112,0.20))"
                                         : "rgba(255,255,255,0.04)",
                                     borderColor: isCenter
                                         ? "rgba(244,190,122,0.60)"
                                         : "rgba(255,255,255,0.10)",
                                 }} />
                        );
                    })}
                </div>

                {/* Synthesis text — the felt meaning */}
                <div className="text-center mt-12 max-w-[720px] mx-auto">
                    <h2 className="font-display text-[clamp(2rem,4.6vw,3.4rem)] text-white font-light tracking-[-0.025em] leading-[1.1] mb-4 stage-enter"
                        style={{ animationDelay: "0.55s" }}>
                        {t("cinematic_5_title")}
                    </h2>
                    <p className="font-mono text-[clamp(0.85rem,1.3vw,1rem)] uppercase tracking-[0.16em] text-white/55 mb-3 stage-enter"
                       style={{ animationDelay: "0.75s" }}>
                        {t("cinematic_5_stats")}
                    </p>
                    <p className="font-display italic text-[clamp(1rem,1.6vw,1.2rem)] text-white/55 stage-enter"
                       style={{ animationDelay: "0.9s" }}>
                        {t("cinematic_5_close")}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── Stage progress — bottom hairline + 5 dots ─────────────────

function StageProgress({ stageIdx, progress }: { stageIdx: number; progress: number }) {
    return (
        <>
            {/* Stage dots — active dot extends into a bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
                {STAGES.map((_, i) => (
                    <div key={i}
                         className="rounded-full transition-all duration-500 ease-out"
                         style={{
                             width: i === stageIdx ? "24px" : "4px",
                             height: "4px",
                             background: i === stageIdx ? "var(--gold-bright)" : "rgba(255,255,255,0.20)",
                             boxShadow: i === stageIdx ? "0 0 8px rgba(244,190,122,0.50)" : "none",
                         }} />
                ))}
            </div>

            {/* Bottom continuous progress hairline */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.08] z-20">
                <div className="h-full origin-left bg-white/40"
                     style={{
                         transform: `scaleX(${progress})`,
                         transition: "transform 0.1s linear",
                     }} />
            </div>
        </>
    );
}
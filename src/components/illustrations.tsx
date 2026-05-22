/**
 * Custom hand-crafted SVG illustrations + floating product UI mocks.
 *
 * Treats the product's own visual language as the illustration system
 * (per Linear, Dia, Browser Company references) — verb cards, matrix
 * cells, audio waves, dialogue snippets are arranged as art objects.
 */

import { useState, type SVGProps } from "react";

// ─── Brand mark: the 3×3 matrix ─────────────────────────────────

export function MatrixMark({ size = 32, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
            <rect x="2" y="2" width="8" height="8" stroke="currentColor" strokeWidth="1.5" rx="1.5" />
            <rect x="12" y="2" width="8" height="8" stroke="currentColor" strokeWidth="1.5" rx="1.5" />
            <rect x="22" y="2" width="8" height="8" stroke="currentColor" strokeWidth="1.5" rx="1.5" />
            <rect x="2" y="12" width="8" height="8" stroke="currentColor" strokeWidth="1.5" rx="1.5" />
            <rect x="12" y="12" width="8" height="8" fill="var(--gold)" rx="1.5" />
            <rect x="22" y="12" width="8" height="8" stroke="currentColor" strokeWidth="1.5" rx="1.5" />
            <rect x="2" y="22" width="8" height="8" stroke="currentColor" strokeWidth="1.5" rx="1.5" />
            <rect x="12" y="22" width="8" height="8" stroke="currentColor" strokeWidth="1.5" rx="1.5" />
            <rect x="22" y="22" width="8" height="8" stroke="currentColor" strokeWidth="1.5" rx="1.5" />
        </svg>
    );
}

// ─── Typographic seal — Browser-Company-inspired ────────────────

export function TypographicSeal({ size = 120, className = "" }: { size?: number; className?: string }) {
    const text = "· VERBMATRIX · STUDY · MMXXVI ";
    return (
        <svg width={size} height={size} viewBox="0 0 120 120" className={className}>
            <defs>
                <path id="seal-circle" d="M 60,60 m -44,0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0" />
            </defs>
            <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.4" />
            <circle cx="60" cy="60" r="44" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.6" />
            <text fontSize="7" fontFamily="JetBrains Mono, monospace" fontWeight="500"
                  fill="currentColor" letterSpacing="0.2em">
                <textPath href="#seal-circle">{text}{text}</textPath>
            </text>
            {/* Inner mark */}
            <g transform="translate(60 60)">
                <rect x="-10" y="-10" width="6" height="6" stroke="currentColor" strokeWidth="0.8" rx="1" />
                <rect x="-3" y="-10" width="6" height="6" stroke="currentColor" strokeWidth="0.8" rx="1" />
                <rect x="4" y="-10" width="6" height="6" stroke="currentColor" strokeWidth="0.8" rx="1" />
                <rect x="-10" y="-3" width="6" height="6" stroke="currentColor" strokeWidth="0.8" rx="1" />
                <rect x="-3" y="-3" width="6" height="6" fill="var(--gold)" rx="1" />
                <rect x="4" y="-3" width="6" height="6" stroke="currentColor" strokeWidth="0.8" rx="1" />
                <rect x="-10" y="4" width="6" height="6" stroke="currentColor" strokeWidth="0.8" rx="1" />
                <rect x="-3" y="4" width="6" height="6" stroke="currentColor" strokeWidth="0.8" rx="1" />
                <rect x="4" y="4" width="6" height="6" stroke="currentColor" strokeWidth="0.8" rx="1" />
            </g>
        </svg>
    );
}

// ─── Asterism ──────────────────────────────────────────────────

export function Asterism({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center justify-center gap-3 my-12 text-[var(--ink-4)] ${className}`}>
            <span className="text-[1rem] tracking-[0.5em] select-none" aria-hidden="true">∗ ∗ ∗</span>
        </div>
    );
}

// ─── Sound wave ─────────────────────────────────────────────────

export function SoundWave({ className = "" }: { className?: string }) {
    return (
        <svg width="48" height="20" viewBox="0 0 48 20" fill="none" className={className}>
            {[
                { x: 2, h: 6, delay: 0 },
                { x: 8, h: 12, delay: 0.15 },
                { x: 14, h: 18, delay: 0.3 },
                { x: 20, h: 14, delay: 0.45 },
                { x: 26, h: 18, delay: 0.6 },
                { x: 32, h: 10, delay: 0.75 },
                { x: 38, h: 16, delay: 0.9 },
                { x: 44, h: 6, delay: 1.05 },
            ].map((bar) => (
                <rect
                    key={bar.x}
                    x={bar.x} y={(20 - bar.h) / 2} width="3" height={bar.h}
                    rx="1.5" fill="currentColor"
                    style={{ animation: `soundwave-pulse 1.4s ease-in-out ${bar.delay}s infinite`, transformOrigin: "center" }}
                />
            ))}
        </svg>
    );
}

// ─── Day progression ────────────────────────────────────────────

export function DayProgression({ className = "" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 600 80" fill="none" preserveAspectRatio="xMidYMid meet">
            <line x1="30" y1="40" x2="570" y2="40" stroke="var(--border-2)" strokeWidth="1" strokeDasharray="2 4" />
            {[
                { x: 30, day: "01", label: "Start", filled: true },
                { x: 165, day: "08", label: "First sentences" },
                { x: 300, day: "16", label: "Conversations" },
                { x: 435, day: "24", label: "Real fluency" },
                { x: 570, day: "32", label: "Confidence", gold: true },
            ].map((m) => (
                <g key={m.day}>
                    <circle cx={m.x} cy="40" r={m.gold ? 8 : 5}
                            fill={m.gold ? "var(--gold)" : m.filled ? "var(--ink)" : "var(--surface)"}
                            stroke={m.gold ? "var(--gold)" : "var(--ink)"}
                            strokeWidth="1.5" />
                    <text x={m.x} y="20" textAnchor="middle" fontFamily="JetBrains Mono"
                          fill="var(--ink-3)" fontSize="10" fontWeight="600" letterSpacing="0.1em">DAY {m.day}</text>
                    <text x={m.x} y="62" textAnchor="middle"
                          fill={m.gold ? "var(--gold)" : "var(--ink-2)"}
                          fontSize="11" fontWeight={m.gold ? "600" : "400"} fontFamily="Fraunces, serif">{m.label}</text>
                </g>
            ))}
        </svg>
    );
}

// ─── Language Orb ──────────────────────────────────────────────

export function LanguageOrb({ code, size = 80, className = "" }: { code: string; size?: number; className?: string }) {
    const orbs: Record<string, React.ReactNode> = {
        ro: (
            <>
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="1" opacity="0.2" />
                <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                <circle cx="40" cy="40" r="20" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
                <circle cx="40" cy="40" r="12" fill="var(--gold)" />
                <text x="40" y="46" textAnchor="middle" fill="var(--bg)" fontSize="10"
                      fontWeight="700" fontFamily="Fraunces, serif" letterSpacing="0.05em">RO</text>
            </>
        ),
        es: (
            <>
                {Array.from({ length: 12 }).map((_, i) => (
                    <line key={i} x1="40" y1="6" x2="40" y2="14" stroke="currentColor"
                          strokeWidth="1.5" strokeLinecap="round"
                          transform={`rotate(${i * 30} 40 40)`} opacity="0.4" />
                ))}
                <circle cx="40" cy="40" r="18" fill="var(--gold)" opacity="0.9" />
                <text x="40" y="46" textAnchor="middle" fill="var(--bg)" fontSize="10"
                      fontWeight="700" fontFamily="Fraunces, serif" letterSpacing="0.05em">ES</text>
            </>
        ),
        ja: (
            <>
                <path d="M40,8 A32,32 0 1,1 12,52" stroke="currentColor" strokeWidth="2.5"
                      fill="none" strokeLinecap="round" opacity="0.6" />
                <circle cx="40" cy="40" r="14" fill="var(--gold)" />
                <text x="40" y="46" textAnchor="middle" fill="var(--bg)" fontSize="10"
                      fontWeight="700" fontFamily="Fraunces, serif" letterSpacing="0.05em">JA</text>
            </>
        ),
    };
    return (
        <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
            {orbs[code] ?? orbs.ro}
        </svg>
    );
}

// ─── Floating UI: Verb Card (INTERACTIVE) ──────────────────────
// Real verb card — click any conjugation to hear it pronounced.

interface InteractiveProps {
    className?: string;
    /** Called with the Romanian text to play */
    onPlay?: (text: string) => void;
}

const VERB_CARDS = [
    { inf: "a vorbi", en: "to speak",
        rows: [{ p: "eu", v: "vorbesc" }, { p: "el/ea", v: "vorbește" }, { p: "past", v: "am vorbit", gold: true }] },
    { inf: "a face", en: "to do",
        rows: [{ p: "eu", v: "fac" }, { p: "el/ea", v: "face" }, { p: "past", v: "am făcut", gold: true }] },
    { inf: "a merge", en: "to go",
        rows: [{ p: "eu", v: "merg" }, { p: "el/ea", v: "merge" }, { p: "past", v: "am mers", gold: true }] },
];

export function FloatingVerbCard({ className = "", onPlay }: InteractiveProps) {
    const [idx, setIdx] = useState(0);
    const [playingRow, setPlayingRow] = useState<number | null>(null);
    const card = VERB_CARDS[idx];

    function cycle(e: React.MouseEvent) {
        e.stopPropagation();
        setIdx((i) => (i + 1) % VERB_CARDS.length);
    }

    function playRow(text: string, rowIdx: number, e: React.MouseEvent) {
        e.stopPropagation();
        onPlay?.(text);
        setPlayingRow(rowIdx);
        setTimeout(() => setPlayingRow(null), 1200);
    }

    return (
        <div className={`glass-strong rounded-[14px] p-4 w-[200px] shadow-heavy transition-all hover:scale-[1.03] ${className}`}>
            <div className="flex items-center justify-between mb-1.5">
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--gold)]">verb · ro</div>
                <button onClick={cycle}
                        className="font-mono text-[9px] text-[var(--ink-4)] hover:text-[var(--gold)] transition-colors"
                        title="next verb">⇄</button>
            </div>
            <div className="font-display text-[1.1rem] text-[var(--ink)] tracking-tight leading-tight mb-1">{card.inf}</div>
            <div className="font-mono text-[10px] text-[var(--ink-3)] mb-3">{card.en}</div>
            <div className="space-y-1.5">
                {card.rows.map((row, i) => (
                    <button
                        key={i}
                        onClick={(e) => playRow(row.v, i, e)}
                        className={`w-full flex items-baseline gap-2 text-[11px] font-mono py-1 px-1 -mx-1 rounded transition-all ${
                            playingRow === i ? "bg-[var(--gold-soft)]" : "hover:bg-[var(--gold-soft)]"
                        }`}
                    >
                        <span className="text-[var(--ink-4)] w-9 text-left">{row.p}</span>
                        <span className={row.gold ? "text-[var(--gold)]" : "text-[var(--ink)]"}>{row.v}</span>
                        {playingRow === i && (
                            <span className="ml-auto text-[var(--gold)] text-[8px]">▸</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Floating UI: Mini Matrix Cell (INTERACTIVE) ───────────────
// Click any cell to highlight + announce its tense/form combination.

const MATRIX_LABELS = [
    ["Fut?", "Fut+", "Fut−"],
    ["Pres?", "Pres+", "Pres−"],
    ["Past?", "Past+", "Past−"],
];

const MATRIX_PHRASES = [
    ["O să vorbesc?", "Eu o să vorbesc.", "N-o să vorbesc."],
    ["Vorbesc eu?", "Eu vorbesc.", "Nu vorbesc."],
    ["Am vorbit?", "Am vorbit.", "Nu am vorbit."],
];

export function FloatingMatrixCell({ className = "", onPlay }: InteractiveProps) {
    const [active, setActive] = useState<{ r: number; c: number }>({ r: 1, c: 1 });

    function pick(r: number, c: number, e: React.MouseEvent) {
        e.stopPropagation();
        setActive({ r, c });
        onPlay?.(MATRIX_PHRASES[r][c]);
    }

    const bgs = [
        ["var(--question-bg)", "var(--affirm-bg)", "var(--neg-bg)"],
        ["var(--question-bg)", "var(--affirm-bg)", "var(--neg-bg)"],
        ["var(--question-bg)", "var(--affirm-bg)", "var(--neg-bg)"],
    ];
    const borders = [
        ["var(--question-border)", "var(--affirm-border)", "var(--neg-border)"],
        ["var(--question-border)", "var(--affirm-border)", "var(--neg-border)"],
        ["var(--question-border)", "var(--affirm-border)", "var(--neg-border)"],
    ];
    const texts = [
        ["var(--question)", "var(--affirm)", "var(--neg)"],
        ["var(--question)", "var(--affirm)", "var(--neg)"],
        ["var(--question)", "var(--affirm)", "var(--neg)"],
    ];

    return (
        <div className={`glass-strong rounded-[14px] p-4 w-[200px] shadow-heavy ${className}`}>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--gold)] mb-2.5">tap any cell</div>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
                {[0, 1, 2].map((r) => [0, 1, 2].map((c) => {
                    const isActive = active.r === r && active.c === c;
                    return (
                        <button
                            key={`${r}-${c}`}
                            onClick={(e) => pick(r, c, e)}
                            className="aspect-square rounded-md font-mono text-[7px] uppercase tracking-[0.06em] flex items-center justify-center transition-all"
                            style={{
                                background: isActive ? "var(--signature-gradient)" : bgs[r][c],
                                borderWidth: "1px",
                                borderStyle: "solid",
                                borderColor: isActive ? "transparent" : borders[r][c],
                                color: isActive ? "#fff" : texts[r][c],
                                transform: isActive ? "scale(1.08)" : "scale(1)",
                                boxShadow: isActive ? "var(--shadow-gold)" : "none",
                            }}
                        >
                            {MATRIX_LABELS[r][c]}
                        </button>
                    );
                }))}
            </div>
            <div className="font-display italic text-[12px] text-[var(--ink-2)] text-center min-h-[20px] leading-tight">
                "{MATRIX_PHRASES[active.r][active.c]}"
            </div>
        </div>
    );
}

// ─── Floating UI: Dialogue (INTERACTIVE) ───────────────────────

const DIALOGUES = [
    { label: "at a café", lines: [
            { p: "A", ro: "Bună ziua!", en: "Hello!" },
            { p: "B", ro: "O cafea, vă rog.", en: "A coffee, please." },
        ]},
    { label: "asking directions", lines: [
            { p: "A", ro: "Unde e gara?", en: "Where is the station?" },
            { p: "B", ro: "Mergi drept înainte.", en: "Go straight ahead." },
        ]},
];

export function FloatingDialogue({ className = "", onPlay }: InteractiveProps) {
    const [idx, setIdx] = useState(0);
    const [playing, setPlaying] = useState<number | null>(null);
    const d = DIALOGUES[idx];

    function play(text: string, i: number, e: React.MouseEvent) {
        e.stopPropagation();
        onPlay?.(text);
        setPlaying(i);
        setTimeout(() => setPlaying(null), 1500);
    }

    return (
        <div className={`glass-strong rounded-[14px] p-4 w-[230px] shadow-heavy ${className}`}>
            <div className="flex items-center justify-between mb-2.5">
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--gold)]">{d.label}</div>
                <button onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % DIALOGUES.length); }}
                        className="font-mono text-[9px] text-[var(--ink-4)] hover:text-[var(--gold)] transition-colors">⇄</button>
            </div>
            <div className="space-y-2 text-[12px]">
                {d.lines.map((line, i) => (
                    <button key={i} onClick={(e) => play(line.ro, i, e)}
                            className={`w-full flex gap-2 text-left py-1.5 px-1.5 -mx-1.5 rounded transition-all ${
                                playing === i ? "bg-[var(--gold-soft)]" : "hover:bg-[var(--gold-soft)]"
                            }`}>
                        <span className="font-mono text-[10px] text-[var(--ink-4)] w-3">{line.p}</span>
                        <div className="flex-1">
                            <div className="text-[var(--ink)] font-display leading-tight">{line.ro}</div>
                            <div className="text-[var(--ink-4)] text-[10px] italic mt-0.5 leading-tight">{line.en}</div>
                        </div>
                        {playing === i && <span className="text-[var(--gold)] text-[10px] self-center">▸</span>}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Floating UI: Audio player (already feels live) ────────────

export function FloatingAudioPlayer({ className = "", onPlay }: InteractiveProps) {
    const [playing, setPlaying] = useState(false);
    function play(e: React.MouseEvent) {
        e.stopPropagation();
        onPlay?.("Mulțumesc");
        setPlaying(true);
        setTimeout(() => setPlaying(false), 1500);
    }
    return (
        <button onClick={play}
                className={`glass-strong rounded-full pl-2 pr-4 py-2 flex items-center gap-2.5 shadow-heavy hover:scale-[1.04] transition-transform ${className}`}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
                 style={{ background: "var(--signature-gradient)" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                    {playing
                        ? <><rect x="2" y="2" width="2" height="6" /><rect x="6" y="2" width="2" height="6" /></>
                        : <polygon points="2,1 9,5 2,9" />
                    }
                </svg>
            </div>
            <div className="flex flex-col gap-0.5">
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-3)]">{playing ? "playing" : "tap to hear"}</div>
                <div className="font-display italic text-[12px] text-[var(--ink)] leading-none">Mulțumesc</div>
            </div>
            <SoundWave className="text-[var(--gold)]" />
        </button>
    );
}

// ─── Floating UI: Vocab card (INTERACTIVE) ─────────────────────

const VOCAB_TILES = [
    { ro: "apă", en: "water" },
    { ro: "pâine", en: "bread" },
    { ro: "cafea", en: "coffee" },
    { ro: "cer", en: "sky" },
];

export function FloatingVocabCard({ className = "", onPlay }: InteractiveProps) {
    const [played, setPlayed] = useState<string | null>(null);
    function play(ro: string, e: React.MouseEvent) {
        e.stopPropagation();
        onPlay?.(ro);
        setPlayed(ro);
        setTimeout(() => setPlayed(null), 1200);
    }
    return (
        <div className={`glass-strong rounded-[14px] p-4 w-[150px] shadow-heavy ${className}`}>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--gold)] mb-2">vocabulary</div>
            <div className="space-y-1">
                {VOCAB_TILES.map((v) => (
                    <button key={v.ro} onClick={(e) => play(v.ro, e)}
                            className={`w-full text-left text-[12px] font-display py-1 px-1.5 -mx-1.5 rounded transition-colors ${
                                played === v.ro ? "bg-[var(--gold-soft)] text-[var(--gold)]" : "text-[var(--ink)] hover:bg-[var(--gold-soft)]"
                            }`}>
                        {v.ro} <span className="text-[var(--ink-4)] italic text-[10px]">{v.en}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Misc icons ─────────────────────────────────────────────────

export function OpenBook({ className = "" }: { className?: string }) {
    return (
        <svg width="80" height="56" viewBox="0 0 80 56" fill="none" className={className}>
            <path d="M40 14 Q30 8 8 10 L8 48 Q30 46 40 52 Q50 46 72 48 L72 10 Q50 8 40 14 Z"
                  stroke="currentColor" strokeWidth="1.5" fill="none" />
            <line x1="40" y1="14" x2="40" y2="52" stroke="currentColor" strokeWidth="1.5" />
            <line x1="14" y1="20" x2="34" y2="19" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            <line x1="14" y1="26" x2="34" y2="25" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            <line x1="14" y1="32" x2="34" y2="31" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            <line x1="46" y1="19" x2="66" y2="20" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            <line x1="46" y1="25" x2="66" y2="26" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
            <line x1="46" y1="31" x2="66" y2="32" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        </svg>
    );
}

export function QuoteMark({ className = "" }: { className?: string }) {
    return (
        <svg width="48" height="36" viewBox="0 0 48 36" fill="none" className={className}>
            <text x="0" y="36" fill="var(--gold)" fontSize="56" fontFamily="Fraunces, serif" fontWeight="400" opacity="0.5">"</text>
        </svg>
    );
}

export function GridPattern({ className = "" }: { className?: string }) {
    return (
        <svg className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.04" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
    );
}

export function DecorativeNumber({ num, className = "" }: { num: string; className?: string }) {
    return (
        <div className={`relative ${className}`}>
      <span className="font-display text-[clamp(4rem,9vw,8rem)] font-light text-[var(--gold)] leading-[0.8] tracking-[-0.05em] block">
        {num}
      </span>
            <span className="absolute top-0 right-[-12px] font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-4)]">··</span>
        </div>
    );
}

export function Chevron({ open, className = "" }: { open: boolean; className?: string }) {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
             className={`transition-transform duration-300 ${className}`}
             style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
            <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

// ─── Aurora orbs — background drift ────────────────────────────

export function AuroraOrbs({ tone = "gold" }: { tone?: "gold" | "warm" }) {
    if (tone === "gold") {
        return (
            <>
                <div className="aurora-orb"
                     style={{ top: "-10%", left: "10%", width: "500px", height: "500px",
                         background: "radial-gradient(circle, rgba(212,161,96,0.20), transparent 70%)" }} />
                <div className="aurora-orb"
                     style={{ top: "40%", right: "5%", width: "400px", height: "400px",
                         animationDelay: "-7s",
                         background: "radial-gradient(circle, rgba(154,103,38,0.16), transparent 70%)" }} />
                <div className="aurora-orb"
                     style={{ bottom: "-10%", left: "30%", width: "600px", height: "600px",
                         animationDelay: "-14s",
                         background: "radial-gradient(circle, rgba(218,196,165,0.12), transparent 70%)" }} />
            </>
        );
    }
    return (
        <>
            <div className="aurora-orb"
                 style={{ top: "5%", left: "5%", width: "500px", height: "500px",
                     background: "radial-gradient(circle, rgba(196,165,110,0.18), transparent 70%)" }} />
            <div className="aurora-orb"
                 style={{ top: "30%", right: "10%", width: "450px", height: "450px",
                     animationDelay: "-5s",
                     background: "radial-gradient(circle, rgba(155,180,145,0.14), transparent 70%)" }} />
        </>
    );
}

// ─── Crosshair — proper architectural corner mark ──────────────
// Replaces the stray "+" Unicode symbols which were barely visible
// at text-white/30. Two crossed lines, sized in absolute px, with
// adjustable color via `currentColor`.

export function CrossHair({
                              size = 12,
                              className = "",
                              strokeWidth = 1,
                          }: {
    size?: number;
    className?: string;
    strokeWidth?: number;
}) {
    const half = size / 2;
    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <line x1="0" y1={half} x2={size} y2={half} stroke="currentColor" strokeWidth={strokeWidth} />
            <line x1={half} y1="0" x2={half} y2={size} stroke="currentColor" strokeWidth={strokeWidth} />
        </svg>
    );
}

// ─── Microphone icon — for the "say this aloud" CTA ───────────

export function Microphone({ size = 18, className = "" }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
    );
}

// ─── Speaker / play icon ──────────────────────────────────────

export function Speaker({ size = 16, className = "" }: { size?: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <polygon points="3,10 7,10 12,5 12,19 7,14 3,14" fill="currentColor" stroke="none" />
            <path d="M16 8c1.5 1.2 2.5 2.5 2.5 4s-1 2.8-2.5 4" />
        </svg>
    );
}
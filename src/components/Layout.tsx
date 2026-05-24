import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RO } from "./RO";
import { ThemeToggle } from "./ThemeToggle";
import { ContactLink } from "./ContactLink";
import { MatrixMark } from "./illustrations";
import { useTargetLanguage } from "../context/TargetLanguage";
import { useLessonNav } from "../context/LessonNav";
import { BRAND, STORAGE_KEYS } from "../config";

// ─── Sidebar ────────────────────────────────────────────────────

/**
 * Pull the lesson number out of an anchor like "#L3" → "03".
 * Returns null for non-lesson anchors (#vocab, #rules, etc.).
 */
function lessonNumber(href: string): string | null {
    const m = /^#L(\d+)$/.exec(href);
    if (!m) return null;
    return m[1].padStart(2, "0");
}

export function Sidebar() {
    const { t } = useTranslation();
    const { module, goHome } = useTargetLanguage();
    const { activeId, isComplete, focusMode, toggleFocusMode, completedCount } = useLessonNav();
    const navGroups = module.navGroups;
    const [open, setOpen] = useState(false);

    // Count total completable lessons (those with an L-prefixed id) for the
    // progress copy at the bottom of the sidebar.
    const totalLessons = navGroups
        .flatMap(g => g.links)
        .filter(l => lessonNumber(l.href) !== null)
        .length;

    return (
        <>
            {/* Mobile toggle — 44px touch target */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="md:hidden fixed top-3 left-3 z-50 w-11 h-11 rounded-md bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--ink-2)] shadow-[var(--shadow-1)] no-print"
                aria-label={open ? t("nav_close") : t("nav_open")}
            >
                <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden="true">
                    {open ? (
                        <path d="M2 2l12 10M14 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    ) : (
                        <path d="M0 1.5h16M0 7h16M0 12.5h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    )}
                </svg>
            </button>

            {/* Mobile backdrop */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="md:hidden fixed inset-0 z-40 no-print backdrop-blur-sm"
                    style={{ background: "var(--backdrop)" }}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 bottom-0 w-[260px] z-40 no-print
          bg-[var(--bg)] border-r border-[var(--border)]
          transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          flex flex-col
        `}
            >
                {/* Brand + theme toggle. The brand text is the universal
                    "home" affordance — clicking it returns to "/" where the
                    language picker lives. */}
                <div className="flex items-center justify-between gap-2 pl-7 pr-3 pt-5 pb-4 border-b border-[var(--border)]">
                    <button
                        type="button"
                        onClick={() => { goHome(); setOpen(false); }}
                        aria-label={t("nav_go_home")}
                        className="flex flex-1 items-center gap-2.5 text-left hover:opacity-80 transition-opacity cursor-pointer min-w-0"
                    >
                        <MatrixMark size={22} className="text-[var(--ink)] shrink-0" />
                        <div className="font-display text-[1.05rem] text-[var(--ink)] tracking-tight leading-none truncate">
                            {t(`landing_lang_${module.code}`, { defaultValue: module.label })}
                        </div>
                    </button>
                    <ThemeToggle />
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto px-4 py-5 scrollbar-hide">
                    {navGroups.map((group) => (
                        <div key={group.label} className="mb-5 last:mb-0">
                            <div className="px-3 mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--ink-4)]">
                                {t(`nav_groups_${group.label}`)}
                            </div>
                            <ul className="space-y-px">
                                {group.links.map((link) => {
                                    const id = link.href.slice(1);
                                    const isActive = activeId === id;
                                    const num = lessonNumber(link.href);
                                    const isFeatured = link.featured === true;
                                    const done = num !== null && isComplete(id);

                                    // Featured ("core engine") links: pure typographic accent —
                                    // gold text + gold ★ glyph, no border, no fill in default
                                    // state. The colour alone does the differentiating work.
                                    const linkClass = isFeatured
                                        ? `
                        grid grid-cols-[12px_20px_1fr] items-baseline gap-2
                        px-3 py-2.5 text-[13px] rounded-md transition-colors
                        text-[var(--gold)]
                        hover:bg-[var(--gold-soft)]
                        ${isActive ? "bg-[var(--gold-soft)]" : ""}
                      `
                                        : `
                        grid grid-cols-[12px_20px_1fr] items-baseline gap-2
                        px-3 py-2.5 text-[13px] rounded-md transition-colors
                        ${isActive
                                            ? "bg-[var(--surface-2)] text-[var(--ink)] font-medium"
                                            : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]/60"}
                      `;

                                    const glyph = isFeatured ? "★" : (num ?? "·");
                                    const glyphClass = isFeatured
                                        ? "font-mono text-[10.5px] text-[var(--gold)]"
                                        : `font-mono text-[10.5px] tabular-nums ${
                                            isActive ? "text-[var(--gold)]" : "text-[var(--ink-4)]"
                                        }`;

                                    // Completion dot — only shown for actual lessons (L#-anchored).
                                    // Featured matrix link and reference items get no dot.
                                    const showDot = num !== null;

                                    return (
                                        <li key={link.href}>
                                            <a
                                                href={link.href}
                                                onClick={() => setOpen(false)}
                                                className={linkClass}
                                                aria-current={isActive ? "true" : undefined}
                                            >
                                                <span aria-hidden="true" className="flex items-center justify-center">
                                                    {showDot && (
                                                        <span
                                                            className={`completion-dot${done ? " is-complete" : ""}`}
                                                            title={done ? t("lesson_marked_complete") : ""}
                                                        />
                                                    )}
                                                </span>
                                                <span className={glyphClass} aria-hidden="true">{glyph}</span>
                                                <span>{t(`nav_links_${link.label}`)}</span>
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Sidebar footer — focus mode toggle + progress */}
                <div className="border-t border-[var(--border)] px-4 py-3 space-y-2">
                    {totalLessons > 0 && (
                        <div className="px-3 font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink-4)]">
                            {t("sidebar_progress", { done: completedCount, total: totalLessons })}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={toggleFocusMode}
                        className={`focus-mode-toggle${focusMode ? " is-on" : ""}`}
                        aria-pressed={focusMode}
                        title={t("focus_mode_hint_shortcut")}
                    >
                        <span aria-hidden="true">{focusMode ? "◉" : "○"}</span>
                        <span className="flex-1 text-left">{t("focus_mode_label")}</span>
                        <span className="focus-mode-shortcut" aria-hidden="true">F</span>
                    </button>
                </div>

                {/* UI language + audio speed live in the bottom-right
                    <SessionControls /> cluster. The sidebar holds only
                    navigation; switching learning languages happens at the
                    home page ("/"), reachable via the brand link above. */}
            </aside>
        </>
    );
}

// ─── Hero ───────────────────────────────────────────────────────

export function Hero() {
    const { t } = useTranslation();
    const { module } = useTargetLanguage();
    return (
        <header id="top" className="pt-20 pb-20 md:pt-24 md:pb-24">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[var(--ink-3)] mb-7">
                {t("hero_kicker")}
            </div>
            <h1 className="font-display text-[clamp(2.2rem,4.4vw,3.4rem)] font-light text-[var(--ink)] leading-[1.08] tracking-[-0.02em] mb-6 max-w-[640px]">
                {t("hero_title")}
            </h1>
            <p className="text-[1.02rem] text-[var(--ink-2)] max-w-[600px] mb-10 leading-[1.65]">
                {t("hero_subtitle")}
            </p>
            <p className="mt-2 text-[0.9rem] text-[var(--ink-3)] max-w-[560px] leading-[1.65]">
                {t("hero_tooltip_help_prefix")}
                <RO text={module.heroExample.text} en={module.heroExample.en} />
                {t("hero_tooltip_help_suffix")}
            </p>
        </header>
    );
}

// ─── Footer ─────────────────────────────────────────────────────

export function Footer() {
    const { t } = useTranslation();
    const { module } = useTargetLanguage();

    function handleReplayIntro() {
        try {
            localStorage.removeItem(`${STORAGE_KEYS.onboardedPrefix}${module.code}`);
        } catch {
            /* private browsing / quota — degrade silently */
        }
        // Reload so the gate in <AppContent> re-evaluates from a fresh
        // mount. The onboarding flow then renders for the current language.
        window.location.reload();
    }

    return (
        <footer className="mt-16 py-12 border-t border-[var(--border)] no-print">
            <p className="font-display italic text-[1.05rem] text-[var(--ink-2)] mb-3 tracking-tight">
                <RO text={module.footerBlessing.text} en={module.footerBlessing.en} />
            </p>
            <p className="text-[0.82rem] text-[var(--ink-3)] mb-6">
                {t("footer_summary")}
            </p>
            {/* Replay intro — a quiet affordance for re-running the 5-step
                first-contact flow for whichever language is currently active.
                Each language has its own seen-flag; this clears the one for
                the active code and reloads. */}
            <button
                type="button"
                onClick={handleReplayIntro}
                className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[var(--ink-4)] hover:text-[var(--ink-2)] transition-colors"
            >
                {t("footer_replay_intro")}
            </button>

            {/* Legal links + contact. Required for paid product distribution. */}
            <div className="footer-legal-links">
                <a href="/terms">{t("footer_legal_terms")}</a>
                <span className="sep" aria-hidden="true">·</span>
                <a href="/privacy">{t("footer_legal_privacy")}</a>
                <span className="sep" aria-hidden="true">·</span>
                <a href="/refund">{t("footer_legal_refund")}</a>
                <span className="sep" aria-hidden="true">·</span>
                <ContactLink source="footer-textbook" />
            </div>
        </footer>
    );
}

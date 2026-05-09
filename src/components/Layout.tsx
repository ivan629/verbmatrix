import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RO } from "./RO";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { useTargetLanguage } from "../context/TargetLanguage";

// ─── Sidebar ────────────────────────────────────────────────────

function useActiveSection(ids: string[]): string {
    const idsKey = useMemo(() => ids.join("|"), [ids]);
    const [active, setActive] = useState<string>("");

    useEffect(() => {
        const idArray = idsKey.split("|").filter(Boolean);
        if (idArray.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible.length > 0) setActive(visible[0].target.id);
            },
            { rootMargin: "-15% 0px -65% 0px", threshold: 0 }
        );

        idArray.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [idsKey]);

    return active;
}

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
    const navGroups = module.navGroups;

    const [open, setOpen] = useState(false);
    const allIds = useMemo(
        () => navGroups.flatMap((g) => g.links.map((l) => l.href.slice(1))),
        [navGroups]
    );
    const active = useActiveSection(allIds);

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
                        className="block flex-1 text-left hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <div className="font-display text-[1.05rem] text-[var(--ink)] tracking-tight leading-none">
                            {t("app_brand")}
                            <span className="text-[var(--ink-4)] ml-1.5 font-normal">{t("app_brand_suffix")}</span>
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
                                    const isActive = active === id;
                                    const num = lessonNumber(link.href);
                                    const isFeatured = link.featured === true;

                                    // Featured ("core engine") links: pure typographic accent —
                                    // gold text + gold ★ glyph, no border, no fill in default
                                    // state. The colour alone does the differentiating work.
                                    // Active state adds a quiet gold-soft fill so you can tell
                                    // you're on the matrix at a glance.
                                    const linkClass = isFeatured
                                        ? `
                        grid grid-cols-[20px_1fr] items-baseline gap-2
                        px-3 py-2.5 text-[13px] rounded-md transition-colors
                        text-[var(--gold)]
                        hover:bg-[var(--gold-soft)]
                        ${isActive ? "bg-[var(--gold-soft)]" : ""}
                      `
                                        : `
                        grid grid-cols-[20px_1fr] items-baseline gap-2
                        px-3 py-2.5 text-[13px] rounded-md transition-colors
                        ${isActive
                                            ? "bg-[var(--surface-2)] text-[var(--ink)] font-medium"
                                            : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]/60"}
                      `;

                                    // Glyph: ★ for featured, lesson number for lessons, · for the rest.
                                    const glyph = isFeatured ? "★" : (num ?? "·");
                                    const glyphClass = isFeatured
                                        ? "font-mono text-[10.5px] text-[var(--gold)]"
                                        : `font-mono text-[10.5px] tabular-nums ${
                                            isActive ? "text-[var(--gold)]" : "text-[var(--ink-4)]"
                                        }`;

                                    return (
                                        <li key={link.href}>
                                            <a
                                                href={link.href}
                                                onClick={() => setOpen(false)}
                                                className={linkClass}
                                            >
                        <span className={glyphClass} aria-hidden="true">
                          {glyph}
                        </span>
                                                <span>{t(`nav_links_${link.label}`)}</span>
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Bottom panel: interface-language picker (auto-hides when
                    only one interface language is registered). Switching
                    learning languages happens at the home page (URL "/") —
                    reachable via the brand link at the top of this sidebar. */}
                <div className="border-t border-[var(--border)] px-5 pt-4 pb-4 safe-bottom">
                    <LanguageSelector />
                </div>
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
            localStorage.removeItem(`study-onboarded:${module.code}`);
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
        </footer>
    );
}

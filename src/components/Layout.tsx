import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { RO } from "./RO";
import { NAV_GROUPS } from "../data/schedule";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";

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
  const [open, setOpen] = useState(false);
  const allIds = useMemo(
    () => NAV_GROUPS.flatMap((g) => g.links.map((l) => l.href.slice(1))),
    []
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
        {/* Brand + theme toggle */}
        <div className="flex items-center justify-between gap-2 pl-7 pr-3 pt-5 pb-4 border-b border-[var(--border)]">
          <a
            href="#top"
            onClick={() => setOpen(false)}
            className="block flex-1 hover:opacity-80 transition-opacity"
          >
            <div className="font-display text-[1.05rem] text-[var(--ink)] tracking-tight leading-none">
              {t("app_brand")}
              <span className="text-[var(--ink-4)] ml-1.5 font-normal">{t("app_brand_suffix")}</span>
            </div>
          </a>
          <ThemeToggle />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 scrollbar-hide">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-5 last:mb-0">
              <div className="px-3 mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--ink-4)]">
                {t(`nav_groups_${group.label}`)}
              </div>
              <ul className="space-y-px">
                {group.links.map((link) => {
                  const id = link.href.slice(1);
                  const isActive = active === id;
                  const num = lessonNumber(link.href);
                  return (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`
                          grid grid-cols-[20px_1fr] items-baseline gap-2
                          px-3 py-2.5 text-[13px] rounded-md transition-colors
                          ${isActive
                            ? "bg-[var(--surface-2)] text-[var(--ink)] font-medium"
                            : "text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]/60"}
                        `}
                      >
                        <span
                          className={`font-mono text-[10.5px] tabular-nums ${
                            isActive ? "text-[var(--gold)]" : "text-[var(--ink-4)]"
                          }`}
                          aria-hidden="true"
                        >
                          {num ?? "·"}
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

        {/* Bottom panel: language selector (hidden when only one language exists) */}
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
        <RO text="Bună ziua!" en="Hello / Good day" />
        {t("hero_tooltip_help_suffix")}
      </p>
    </header>
  );
}

// ─── Footer ─────────────────────────────────────────────────────

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="mt-16 py-12 border-t border-[var(--border)] no-print">
      <p className="font-display italic text-[1.05rem] text-[var(--ink-2)] mb-3 tracking-tight">
        <RO text="Mult succes!" en={t("footer_blessing_meaning")} />
      </p>
      <p className="text-[0.82rem] text-[var(--ink-3)]">
        {t("footer_summary")}
      </p>
    </footer>
  );
}

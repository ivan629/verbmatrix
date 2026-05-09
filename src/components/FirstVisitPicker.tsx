import { useTranslation } from "react-i18next";
import { useTargetLanguage } from "../context/TargetLanguage";

/**
 * Home page (URL "/"). Renders for both first-time and returning visitors.
 *
 * Structure:
 *   - top bar: brand mark on the left. (Interface-language toggle floats
 *     in the top-right corner of the viewport — see <FloatingUILanguage />.)
 *     **No back button** — this is the destination, not a transient overlay.
 *   - hero: large display question with a warm subtitle.
 *   - card grid: each registered language presenting itself.
 *   - footer note.
 *
 * Returning visitors see their previous language marked "Current" on its
 * card; clicking any card (including the Current one) navigates to that
 * language's URL. There is no "back" affordance because there is no need
 * for one — the user is at home.
 */
export function FirstVisitPicker() {
  const { t } = useTranslation();
  const { available, setCode, lastPickedCode } = useTargetLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Top bar ─────────────────────────────────────────────
          Brand on the left. The right side is intentionally empty —
          the floating UI-language chip occupies that area visually
          via fixed positioning, rendered at the App level. */}
      <header className="flex items-center px-6 md:px-12 py-5">
        <div className="font-display text-[1.05rem] text-[var(--ink)] tracking-tight leading-none">
          {t("app_brand")}
          <span className="text-[var(--ink-4)] ml-1.5 font-normal">{t("app_brand_suffix")}</span>
        </div>
      </header>

      {/* ─── Body ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col px-6 md:px-12 pb-16">
        <div className="max-w-[920px] w-full mx-auto flex-1 flex flex-col">
          {/* Hero — generous vertical breathing room above the cards */}
          <div className="text-center pt-12 md:pt-20 pb-12 md:pb-16">
            <h1 className="
              font-display
              text-[clamp(2.2rem,5.2vw,3.6rem)]
              font-light text-[var(--ink)]
              tracking-[-0.02em] leading-[1.05]
              mb-6
              max-w-[720px] mx-auto
            ">
              {t("picker_title")}
            </h1>
            <p className="
              text-[clamp(1rem,1.6vw,1.1rem)]
              text-[var(--ink-2)]
              max-w-[560px] mx-auto leading-[1.65]
            ">
              {t("picker_subtitle")}
            </p>
          </div>

          {/* Card grid */}
          <ul
            className="
              grid gap-4
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              max-w-[860px] w-full mx-auto
            "
          >
            {available.map((lang) => {
              const isCurrent = lang.code === lastPickedCode;
              return (
                <li key={lang.code}>
                  <button
                    type="button"
                    onClick={() => setCode(lang.code)}
                    className={`
                      group w-full text-left
                      flex flex-col
                      bg-[var(--surface)]
                      border ${isCurrent ? "border-[var(--gold)]" : "border-[var(--border)]"}
                      rounded-[var(--radius-lg)]
                      p-7 min-h-[200px]
                      transition-all duration-200
                      hover:border-[var(--ink-3)]
                      hover:shadow-[var(--shadow-2)]
                      hover:-translate-y-0.5
                      focus:outline-none focus:border-[var(--gold)]
                      ${isCurrent ? "shadow-[var(--shadow-1)]" : ""}
                    `}
                  >
                    {/* Top row: code + Current marker */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--ink-4)]">
                        {lang.code}
                      </span>
                      {isCurrent && (
                        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--gold)] flex items-center gap-1.5">
                          <span aria-hidden="true">●</span>
                          <span>{t("picker_current")}</span>
                        </span>
                      )}
                    </div>

                    {/* The language presenting itself */}
                    <div className="flex-1 mb-5">
                      <div className="font-display text-[1.6rem] md:text-[1.75rem] text-[var(--ink)] leading-[1.15] tracking-tight mb-2">
                        {lang.heroExample.text}
                      </div>
                      <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]">
                        {t(lang.heroExample.en, { defaultValue: lang.heroExample.en })}
                      </div>
                    </div>

                    {/* Footer: language name + arrow */}
                    <div className="flex items-baseline justify-between pt-4 border-t border-[var(--border)]">
                      <span className="font-display text-[1.05rem] text-[var(--ink)] font-medium tracking-tight">
                        {lang.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className="font-mono text-[14px] text-[var(--ink-4)] group-hover:text-[var(--ink)] group-hover:translate-x-0.5 transition-all"
                      >
                        →
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Footnote — always visible on home */}
          <p className="
            mt-16 md:mt-20
            text-[0.85rem] text-[var(--ink-4)] italic
            leading-[1.6] text-center
            max-w-[520px] mx-auto
          ">
            {t("picker_footer")}
          </p>
        </div>
      </main>
    </div>
  );
}

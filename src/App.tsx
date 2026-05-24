import { useEffect, useRef, useState, type ReactNode } from "react";
import { ThemeProvider } from "./context/Theme";
import { TargetLanguageProvider, useTargetLanguage } from "./context/TargetLanguage";
import { AccessProvider, useAccess } from "./context/Access";
import { LessonNavProvider } from "./context/LessonNav";
import { PlaybackProvider } from "./context/Playback";
import { Sidebar, Hero, Footer } from "./components/Layout";
import { LandingPage } from "./components/LandingPage";
import { Onboarding, useShouldShowOnboarding } from "./components/Onboarding";
import { PaywallCard } from "./components/PaywallCard";
import { LessonProgressBar } from "./components/LessonProgressBar";
import { PhaseHeader } from "./components/PhaseHeader";
import { LegalPage } from "./components/LegalPage";
import { isFreeLessonId, FLAGS, trackEvent } from "./config";

/** Path-based check for the three legal pages. They render outside the
 *  language/onboarding/textbook flow — pure static documents. */
function getLegalPageFromPath(): "terms" | "privacy" | "refund" | null {
  if (typeof window === "undefined") return null;
  const p = window.location.pathname;
  if (p === "/terms" || p === "/terms/") return "terms";
  if (p === "/privacy" || p === "/privacy/") return "privacy";
  if (p === "/refund" || p === "/refund/") return "refund";
  return null;
}

/**
 * Strip the LemonSqueezy redirect params from the URL — `?activate`,
 * `?email`, `?order` — and return them if present. Called once on mount
 * BEFORE we kick off the async activation, so a refresh mid-activation
 * doesn't replay the request and a user copy-pasting their address bar
 * doesn't leak the key.
 *
 * The LS thank-you URL is configured (in the LS product dashboard) as:
 *   https://verbmatrix.com/ro?activate=[license_key]&email=[email]&order=[order_id]
 */
function consumeActivateParams(): { key: string; email?: string; order?: string } | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const key = params.get("activate");
  if (!key) return null;
  const email = params.get("email") ?? undefined;
  const order = params.get("order") ?? undefined;
  // Scrub the consumed keys, keep any others (e.g. ?lang=ro for the demo).
  params.delete("activate");
  params.delete("email");
  params.delete("order");
  const newQuery = params.toString();
  const newUrl = window.location.pathname + (newQuery ? `?${newQuery}` : "") + window.location.hash;
  history.replaceState(null, "", newUrl);
  return { key, email, order };
}

type ToastState =
    | { kind: "idle" }
    | { kind: "activating" }
    | { kind: "success"; message: string }
    | { kind: "error"; message: string };

function ActivationToast({ state, onDismiss }: { state: ToastState; onDismiss: () => void }) {
  // Auto-dismiss success after 4s, errors after 6s (give user time to read).
  useEffect(() => {
    if (state.kind !== "success" && state.kind !== "error") return;
    const ms = state.kind === "success" ? 4000 : 6000;
    const timer = setTimeout(onDismiss, ms);
    return () => clearTimeout(timer);
  }, [state, onDismiss]);

  if (state.kind === "idle") return null;

  const isErr = state.kind === "error";
  const isLoading = state.kind === "activating";
  const text =
      state.kind === "activating" ? "Activating your access…" :
          state.kind === "success" ? state.message :
              state.message;

  return (
      <div
          role="status"
          aria-live="polite"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] fade-in"
          style={{ pointerEvents: "auto" }}
      >
        <div
            className="flex items-center gap-3 px-5 py-3 rounded-[var(--radius-lg)] shadow-[var(--shadow-3)] border"
            style={{
              background: isErr ? "var(--neg-bg)" : "var(--affirm-bg)",
              borderColor: isErr ? "var(--neg)" : "var(--affirm)",
              color: "var(--ink)",
            }}
        >
        <span
            aria-hidden="true"
            className="font-mono text-[16px] leading-none"
            style={{ color: isErr ? "var(--neg)" : "var(--affirm)" }}
        >
          {isLoading ? "…" : isErr ? "!" : "✓"}
        </span>
          <span className="text-[0.92rem] font-medium">{text}</span>
          {!isLoading && (
              <button
                  type="button"
                  onClick={onDismiss}
                  aria-label="Dismiss"
                  className="ml-2 text-[var(--ink-4)] hover:text-[var(--ink)] transition-colors text-[14px] leading-none"
              >
                ✕
              </button>
          )}
        </div>
      </div>
  );
}

/**
 * App content — rendered inside all providers.
 *
 * Four render modes, gated in order:
 *
 *   1. **Landing page** (URL is "/" — `isUnchosen === true`)
 *      The public sales page. Shows pricing, method overview, language
 *      cards with purchase buttons, and license key entry.
 *
 *   2. **Onboarding** (per-language flag not set yet)
 *      Free for everyone. The 5-step first-contact flow is the best
 *      sales tool — it shows the matrix method in action.
 *
 *   3. **The textbook** — with access gating.
 *      Free lessons render normally. The first gated lesson is replaced
 *      by a PaywallCard. Remaining paid lessons render only if the user
 *      has a valid license for this language.
 */
function AppContent() {
  const { module, isUnchosen, setCode } = useTargetLanguage();
  const [showOnboarding, dismissOnboarding] = useShouldShowOnboarding();
  const { hasAccess, activateKeyAuto } = useAccess();
  const [toast, setToast] = useState<ToastState>({ kind: "idle" });

  // ── Post-purchase auto-activate ─────────────────────────────────
  // The LemonSqueezy thank-you URL drops the customer here with the
  // license key as a URL param. We consume it on first mount, scrub
  // the URL so a reload doesn't replay (and so the key isn't lurking
  // in the browser history), then activate against LS and route the
  // customer into the unlocked course. This is the difference between
  // "I paid and now I'm reading my course" and "I paid, where's my
  // confirmation email?"
  const consumedRef = useRef(false);
  useEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;
    const params = consumeActivateParams();
    if (!params) return;

    trackEvent("auto-activate-attempt", params.order ? { order: params.order } : {});
    setToast({ kind: "activating" });

    (async () => {
      const result = await activateKeyAuto(params.key, params.email);
      if (result.ok) {
        setToast({ kind: "success", message: "Course unlocked. Welcome." });
        // Route into the unlocked language so they land in the textbook,
        // not on the landing page. Onboarding is per-language, so they'll
        // see it first if they haven't completed it for this language yet.
        setCode(result.languageUnlocked);
      } else {
        const message =
            result.reason === "remote_invalid" ? "That license key isn't valid. Please contact support." :
                result.reason === "wrong_product"  ? "That key is for a different product." :
                    result.reason === "network_error"  ? "Couldn't reach our servers. Your key is saved — refresh in a moment." :
                        result.reason === "invalid_format" ? "The activation link looks malformed." :
                            "Activation failed. Please contact support.";
        setToast({ kind: "error", message });
      }
    })();
    // Only fire once on mount. activateKeyAuto and setCode are stable refs
    // from their respective providers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 0 — Legal pages. Path-based, takes precedence over any language state.
  // (Hooks above must run unconditionally; this branch is the first render
  // decision, after all hooks have been called.)
  const legalPage = getLegalPageFromPath();
  let body: ReactNode;

  if (legalPage) {
    body = <LegalPage which={legalPage} />;
  } else if (isUnchosen) {
    // 1 — Landing page. UI language switcher lives in the landing footer
    //     (inline) to avoid overlapping the top nav.
    body = <LandingPage />;
  } else if (showOnboarding) {
    // 2 — Onboarding (always free).
    body = <Onboarding onComplete={dismissOnboarding} />;
  } else {
    // 3 — The textbook with access gating.
    body = <TextbookView module={module} hasAccess={hasAccess} />;
  }

  return (
      <>
        {body}
        <ActivationToast state={toast} onDismiss={() => setToast({ kind: "idle" })} />
      </>
  );
}

/**
 * The gated textbook stream. Extracted from AppContent so the auto-activate
 * toast can render alongside any of the four top-level views.
 */
function TextbookView({
                        module,
                        hasAccess,
                      }: {
  module: ReturnType<typeof useTargetLanguage>["module"];
  hasAccess: (code: string) => boolean;
}) {
  const paid = hasAccess(module.code);
  let paywallInserted = false;

  // Build the lesson stream with phase headers injected between navGroups.
  // The first navGroup (typically "Practice", containing only the matrix
  // demo) is treated as the page entry and gets no header above it. Every
  // subsequent group earns a PhaseHeader before its first lesson.
  //
  // Phase numbering skips the first group, so the user sees "Phase I", "II"
  // ... "V" for the five learning phases.
  const groupOfLesson = (lessonId: string): string | null => {
    for (const g of module.navGroups) {
      if (g.links.some(l => l.href === `#${lessonId}`)) return g.label;
    }
    return null;
  };
  const firstGroupLabel = module.navGroups[0]?.label ?? null;
  const totalPhases = Math.max(0, module.navGroups.length - 1);

  const stream: ReactNode[] = [];
  let currentGroup: string | null = null;
  let phaseNumber = 0;

  for (const { id, Component } of module.lessons) {
    const group = groupOfLesson(id);

    // Crossed into a new navGroup? Insert a PhaseHeader — but skip the
    // very first group (page entry) and skip ungrouped lessons.
    if (group && group !== currentGroup) {
      currentGroup = group;
      if (group !== firstGroupLabel) {
        phaseNumber++;
        stream.push(
            <PhaseHeader
                key={`phase-${group}`}
                number={phaseNumber}
                total={totalPhases}
                groupLabel={group}
            />
        );
      }
    }

    const isFree = isFreeLessonId(id);

    if (isFree || !FLAGS.paywallEnabled || paid) {
      stream.push(<Component key={`${module.code}:${id}`} />);
      continue;
    }

    // First gated lesson → insert the paywall card once, then stop.
    if (!paywallInserted) {
      paywallInserted = true;
      stream.push(<PaywallCard key="paywall" />);
    }
    // Remaining gated lessons — hidden.
  }

  return (
      <>
        <LessonProgressBar />
        <Sidebar />
        <div className="md:ml-[260px]">
          <div className="max-w-[880px] mx-auto px-6 md:px-12 lg:px-16">
            <Hero />
            <main className="pb-16">
              {stream}
            </main>
            <Footer />
          </div>
        </div>
      </>
  );
}

export default function App() {
  return (
      <ThemeProvider>
        <AccessProvider>
          <TargetLanguageProvider>
            <PlaybackProvider>
              <LessonNavProvider>
                <AppContent />
              </LessonNavProvider>
            </PlaybackProvider>
          </TargetLanguageProvider>
        </AccessProvider>
      </ThemeProvider>
  );
}
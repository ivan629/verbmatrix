import { ThemeProvider } from "./context/Theme";
import { TargetLanguageProvider, useTargetLanguage } from "./context/TargetLanguage";
import { AccessProvider, useAccess } from "./context/Access";
import { LessonNavProvider } from "./context/LessonNav";
import { Sidebar, Hero, Footer } from "./components/Layout";
import { LandingPage } from "./components/LandingPage";
import { Onboarding, useShouldShowOnboarding } from "./components/Onboarding";
import { FloatingUILanguage } from "./components/FloatingUILanguage";
import { PaywallCard } from "./components/PaywallCard";
import { LessonProgressBar } from "./components/LessonProgressBar";
import { PhaseHeader } from "./components/PhaseHeader";
import { LegalPage } from "./components/LegalPage";
import { isFreeLessonId, FLAGS } from "./config";
import type { ReactNode } from "react";

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
  const { module, isUnchosen } = useTargetLanguage();
  const [showOnboarding, dismissOnboarding] = useShouldShowOnboarding();
  const { hasAccess } = useAccess();

  // 0 — Legal pages. Path-based, takes precedence over any language state.
  // (Hooks above must run unconditionally; this branch is the first render
  // decision, after all hooks have been called.)
  const legalPage = getLegalPageFromPath();
  if (legalPage) {
    return <LegalPage which={legalPage} />;
  }

  // 1 — Landing page.
  if (isUnchosen) {
    return (
      <>
        <FloatingUILanguage />
        <LandingPage />
      </>
    );
  }

  // 2 — Onboarding (always free).
  if (showOnboarding) {
    return <Onboarding onComplete={dismissOnboarding} />;
  }

  // 3 — The textbook with access gating.
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
      <FloatingUILanguage />
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
          <LessonNavProvider>
            <AppContent />
          </LessonNavProvider>
        </TargetLanguageProvider>
      </AccessProvider>
    </ThemeProvider>
  );
}

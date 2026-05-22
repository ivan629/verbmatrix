import { ThemeProvider } from "./context/Theme";
import { TargetLanguageProvider, useTargetLanguage } from "./context/TargetLanguage";
import { AccessProvider, useAccess } from "./context/Access";
import { Sidebar, Hero, Footer } from "./components/Layout";
import { LandingPage } from "./components/LandingPage";
import { Onboarding, useShouldShowOnboarding } from "./components/Onboarding";
import { FloatingUILanguage } from "./components/FloatingUILanguage";
import { PaywallCard } from "./components/PaywallCard";
import { LessonProgressBar } from "./components/LessonProgressBar";
import { isFreeLessonId, FLAGS } from "./config";

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

  return (
    <>
      <LessonProgressBar />
      <FloatingUILanguage />
      <Sidebar />
      <div className="md:ml-[260px]">
        <div className="max-w-[880px] mx-auto px-6 md:px-12 lg:px-16">
          <Hero />
          <main className="pb-16">
            {module.lessons.map(({ id, Component }) => {
              const isFree = isFreeLessonId(id);

              // Free lesson — always render.
              if (isFree || !FLAGS.paywallEnabled) {
                return <Component key={`${module.code}:${id}`} />;
              }

              // Paid user — render everything.
              if (paid) {
                return <Component key={`${module.code}:${id}`} />;
              }

              // First gated lesson → insert the paywall card once.
              if (!paywallInserted) {
                paywallInserted = true;
                return <PaywallCard key="paywall" />;
              }

              // Remaining gated lessons — hidden.
              return null;
            })}
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
          <AppContent />
        </TargetLanguageProvider>
      </AccessProvider>
    </ThemeProvider>
  );
}

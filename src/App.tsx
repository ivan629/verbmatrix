import { ThemeProvider } from "./context/Theme";
import { TargetLanguageProvider, useTargetLanguage } from "./context/TargetLanguage";
import { Sidebar, Hero, Footer } from "./components/Layout";
import { FirstVisitPicker } from "./components/FirstVisitPicker";
import { Onboarding, useShouldShowOnboarding } from "./components/Onboarding";

/**
 * App content — read once we're inside <TargetLanguageProvider> so the
 * active language module is available.
 *
 * Three render modes, gated in order:
 *
 *   1. **Home / picker** (URL is "/" — `isUnchosen === true`)
 *      The user is at the language-picker home page. Either it's their
 *      first visit, or they navigated back via the header chip.
 *
 *   2. **Onboarding** (per-language flag not set yet)
 *      The user has picked a language, but the 5-step intro for that
 *      specific language hasn't been seen on this device yet.
 *
 *   3. **The textbook itself.**
 *
 * Onboarding's seen-flag is per target-language code, so a user who later
 * switches from Romanian to Spanish goes through Spanish onboarding too.
 */
function AppContent() {
  const { module, isUnchosen } = useTargetLanguage();
  const [showOnboarding, dismissOnboarding] = useShouldShowOnboarding();

  // Step 1 — at home ("/").
  if (isUnchosen) {
    return <FirstVisitPicker />;
  }

  // Step 2 — language picked, but onboarding not yet seen for this code.
  if (showOnboarding) {
    return <Onboarding onComplete={dismissOnboarding} />;
  }

  // Step 3 — the app proper.
  return (
    <>
      <Sidebar />
      <div className="md:ml-[260px]">
        <div className="max-w-[880px] mx-auto px-6 md:px-12 lg:px-16">
          <Hero />
          <main className="pb-16">
            {module.lessons.map(({ id, Component }) => (
              <Component key={`${module.code}:${id}`} />
            ))}
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
      <TargetLanguageProvider>
        <AppContent />
      </TargetLanguageProvider>
    </ThemeProvider>
  );
}

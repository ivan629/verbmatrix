import { ThemeProvider } from "./context/Theme";
import { TargetLanguageProvider, useTargetLanguage } from "./context/TargetLanguage";
import { Sidebar, Hero, Footer } from "./components/Layout";

/**
 * App content — read once we're inside <TargetLanguageProvider> so the
 * active language module is available. We render the lessons declared by
 * that module in order; the engine doesn't know or care what they are.
 *
 * Adding a new learning language is now data-only: drop a folder under
 * `src/languages/<code>/`, register it in `src/languages/index.ts`, and
 * the entire app reflows.
 */
function AppContent() {
  const { module } = useTargetLanguage();

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

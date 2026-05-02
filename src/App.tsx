import { LanguageProvider } from "./context/Language";
import { PlaybackProvider } from "./context/Playback";
import { Sidebar, Hero, Footer } from "./components/Layout";
import {
  LessonRules,
  Lesson0, Lesson1, Lesson2, Lesson3,
  Lesson4, Lesson5, Lesson6,
  Lesson7, Lesson8, Lesson9, Lesson10, Lesson11,
  Lesson12, Lesson13, Lesson14, Lesson15, Lesson16, Lesson17,
  VocabularySection, DialoguesSection, ScheduleSection, AboutMeSection,
} from "./components/lessons";

export default function App() {
  return (
    <LanguageProvider>
      <PlaybackProvider>
        <Sidebar />
        <div className="md:ml-[260px]">
          <div className="max-w-[880px] mx-auto px-6 md:px-12 lg:px-16">
            <Hero />
            <main className="pb-16">
              <LessonRules />
              <Lesson0 />
              <Lesson1 />
              <Lesson2 />
              <Lesson3 />
              <Lesson4 />
              <Lesson5 />
              <Lesson6 />
              <Lesson7 />
              <Lesson8 />
              <Lesson9 />
              <Lesson10 />
              <Lesson11 />
              <Lesson12 />
              <Lesson13 />
              <Lesson14 />
              <Lesson15 />
              <Lesson16 />
              <Lesson17 />
              <VocabularySection />
              <DialoguesSection />
              <ScheduleSection />
              <AboutMeSection />
            </main>
            <Footer />
          </div>
        </div>
      </PlaybackProvider>
    </LanguageProvider>
  );
}

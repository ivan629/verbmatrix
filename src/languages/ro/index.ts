import type { LanguageModule } from "../types";
import { pronounce } from "./pronounce";
import { AUDIO_MANIFEST } from "./audio-manifest";
import { NAV_GROUPS } from "./data/schedule";
import enLocale from "./locales/en.json";
import ukLocale from "./locales/uk.json";

import { PracticeMatrix } from "./PracticeMatrix";
import {
  LessonRules,
  Lesson0, Lesson1, Lesson2, Lesson3,
  Lesson4, Lesson5, Lesson6,
  Lesson7, Lesson8, Lesson9, Lesson10, Lesson11,
  Lesson12, Lesson13, Lesson14, Lesson15, Lesson16, Lesson17,
  VocabularySection, DialoguesSection, ScheduleSection, AboutMeSection,
} from "./lessons";

/**
 * The Romanian module — everything the engine needs to present Romanian.
 *
 * To add another language, copy this folder, change `code`, swap data,
 * locales, and `pronounce`, then add the new module to
 * `src/languages/index.ts`.
 */
export const ro: LanguageModule = {
  code: "ro",
  label: "Romanian",
  speechLang: "ro-RO",

  pronounce,
  audioManifest: AUDIO_MANIFEST,
  navGroups: NAV_GROUPS,

  // Locales are keyed by INTERFACE language code. Whatever the user picks in
  // the bottom-of-sidebar selector is what gets rendered. <TargetLanguageProvider>
  // merges these into the live i18n bundle when this module becomes active.
  locales: {
    en: enLocale,
    uk: ukLocale,
  },

  heroExample:    { text: "Bună ziua!",   en: "Hello / Good day" },
  footerBlessing: { text: "Mult succes!", en: "footer_blessing_meaning" },

  lessons: [
    { id: "matrix",    Component: PracticeMatrix },
    { id: "rules",     Component: LessonRules },
    { id: "L0",        Component: Lesson0 },
    { id: "L1",        Component: Lesson1 },
    { id: "L2",        Component: Lesson2 },
    { id: "L3",        Component: Lesson3 },
    { id: "L4",        Component: Lesson4 },
    { id: "L5",        Component: Lesson5 },
    { id: "L6",        Component: Lesson6 },
    { id: "L7",        Component: Lesson7 },
    { id: "L8",        Component: Lesson8 },
    { id: "L9",        Component: Lesson9 },
    { id: "L10",       Component: Lesson10 },
    { id: "L11",       Component: Lesson11 },
    { id: "L12",       Component: Lesson12 },
    { id: "L13",       Component: Lesson13 },
    { id: "L14",       Component: Lesson14 },
    { id: "L15",       Component: Lesson15 },
    { id: "L16",       Component: Lesson16 },
    { id: "L17",       Component: Lesson17 },
    { id: "vocab",     Component: VocabularySection },
    { id: "dialogues", Component: DialoguesSection },
    { id: "schedule",  Component: ScheduleSection },
    { id: "aboutme",   Component: AboutMeSection },
  ],
};

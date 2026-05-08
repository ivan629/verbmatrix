import { ro } from "./ro";
import type { LanguageModule } from "./types";

/**
 * Every learning-language module the app knows about.
 *
 * To add a new language:
 *   1. Create `src/languages/<code>/` with its own data, lessons, audio,
 *      pronouncer, and locales.
 *   2. Export a `LanguageModule` from `src/languages/<code>/index.ts`.
 *   3. Add it to this array.
 *
 * The first entry is the default — what users see before they pick anything.
 */
export const LANGUAGES: readonly LanguageModule[] = [ro];

/** Look up a language module by code, falling back to the default. */
export function getLanguageByCode(code: string): LanguageModule {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

export type { LanguageModule } from "./types";

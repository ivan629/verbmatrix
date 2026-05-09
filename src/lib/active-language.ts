import type { LanguageModule } from "../languages/types";

/**
 * Module-level pointer to the currently active learning-language module.
 *
 * Why a module-level variable instead of a React context? Helpers like
 * `lookupAudio()` and `<RO />`'s pronouncer get called in places where
 * pulling a context via `useContext` is awkward (inside non-hook utility
 * functions, deep in callbacks). A simple shared variable, written by
 * `<TargetLanguageProvider>` during render and read by everyone else,
 * keeps the engine helpers ergonomic without coupling them to React.
 *
 * The provider re-asserts this on every module change, so it stays in
 * sync with whatever the user picked.
 */

let active: LanguageModule | null = null;

export function setActiveLanguage(module: LanguageModule): void {
  active = module;
}

export function getActiveLanguage(): LanguageModule {
  if (!active) {
    throw new Error(
      "Active learning language not set. Did you forget to wrap your tree in <TargetLanguageProvider>?"
    );
  }
  return active;
}

/** Same as getActiveLanguage but returns null instead of throwing — used by
 *  helpers that may run before the provider has mounted (e.g. early TTS init). */
export function tryGetActiveLanguage(): LanguageModule | null {
  return active;
}

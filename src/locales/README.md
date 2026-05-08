# Translations

Two layers of locale files now exist:

## 1. Engine chrome — `src/locales/`

Tiny set of strings that exist regardless of which target language is being learned:

- `language_selector_label`, `theme_*`, `nav_open`/`nav_close`, `lesson_label`, `test_helper`

That's it. Adding a new interface language (e.g. Italian) for the chrome means creating `src/locales/it.json` and registering it in `src/lib/i18n.ts` (see `AVAILABLE_LANGUAGES`).

## 2. Per learning-language locales — `src/languages/<code>/locales/`

Everything else — the brand, hero, footer, all `lesson_*` titles/subtitles/headings, navigation labels, vocab section labels, and every inline phrase gloss — lives inside the language module that owns those lessons.

For Romanian this is `src/languages/ro/locales/{en,uk}.json`.

When you switch the active learning language, `<TargetLanguageProvider>` deep-merges the active module's locale resources into the live i18n bundle (overlaying the engine chrome). When you switch to a different module, its keys take over.

## How keys work

The i18n config has `keySeparator: false` and `nsSeparator: false`, so dots and colons in keys are literal. Two key conventions coexist:

1. **Hierarchical keys** like `lesson_3_title`, `nav_groups_Foundations`, `hero_title`. UI chrome of a lesson.
2. **English-as-key** for inline phrase glosses. When a phrase has `<RO text="Bună ziua!" en="Good day!" />`, the string `"Good day!"` is the i18n key. Other-language locale files map it to the local equivalent.

## Adding a new interface language to existing learning languages

For example, adding Italian:

1. Create `src/locales/it.json` (engine chrome).
2. Register it in `src/lib/i18n.ts` under `resources` and `AVAILABLE_LANGUAGES`.
3. For each existing learning language module, create `src/languages/<code>/locales/it.json` and translate the per-language strings.

If a translation is missing for a key, i18next falls back to English (the key itself), so an incomplete language file still works gracefully.

## Adding a new learning language

1. Create `src/languages/<new-code>/` with `data/`, `lessons/`, `locales/`, `pronounce.ts`, `audio-manifest.ts`, and an `index.ts` that exports a `LanguageModule`.
2. Register it in `src/languages/index.ts` by adding it to the `LANGUAGES` array.
3. The `<TargetLanguageSelector>` in the sidebar bottom panel auto-appears the moment two or more languages are registered.

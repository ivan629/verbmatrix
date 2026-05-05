# Translations

This folder holds one JSON file per language. Right now only **English** (`en.json`) is here, but the i18n system is fully wired and ready for more.

## How keys work

There are two kinds of keys in `en.json`:

1. **Hierarchical keys** like `lesson_3_title`, `nav_groups_Foundations`, `hero_title`. These are the chrome of the app — section titles, subtitles, navigation labels, infobox titles, etc.

2. **English-as-key** for inline phrase translations. When a Romanian phrase has an `en` prop like `<RO text="Bună ziua!" en="Good day!" />`, the string `"Good day!"` is itself the key. Other-language JSON files map `"Good day!"` → the local equivalent.

The i18next config has `keySeparator: false`, so dots and colons inside keys are treated as literal characters, not hierarchy.

## How to add a new language (e.g. Italian)

It's three steps:

### 1. Create the file

Copy `en.json` to `it.json` and translate every value. Keep all the keys exactly as they are — only translate the values on the right side of each `:`.

```json
{
  "app_brand": "Rumeno",
  "app_brand_suffix": "Studio",
  "hero_title": "Parla rumeno in sedici lezioni.",
  ...
}
```

### 2. Register it in `src/lib/i18n.ts`

Open `src/lib/i18n.ts` and:

- Import the new file at the top:
  ```ts
  import it from "../locales/it.json";
  ```

- Add it to the `resources` block:
  ```ts
  resources: {
    en: { translation: en },
    it: { translation: it },
  },
  ```

- Add it to `AVAILABLE_LANGUAGES`:
  ```ts
  export const AVAILABLE_LANGUAGES = [
    { code: "en", label: "English" },
    { code: "it", label: "Italiano" },
  ];
  ```

### 3. Done.

The language picker in the sidebar will appear automatically (it's hidden when only one language exists). Pick Italian, the whole app translates.

## Translating inline phrase glosses

The English `en` props on `<RO />`, `PhraseGrid` items, `VocabGrid` items, and `DialogueBox` lines are the i18n keys for those tooltips and gloss lines. Add entries to `it.json` (and other language files) like:

```json
{
  "Good day!": "Buongiorno!",
  "I have a new car.": "Ho una macchina nuova.",
  "Hello! My name is": "Ciao! Mi chiamo",
  ...
}
```

If a translation is missing for a key, i18next falls back to English (the key itself), so an incomplete language file still works gracefully.

## Translating long lesson body prose (optional)

The instructional paragraphs inside `<InfoBox>` bodies — the long explanatory prose — are still inline JSX (because they contain embedded `<RO />` components and formatting). They display in English regardless of the active language.

To translate those too, wrap each one with i18next's `<Trans>` component and add a matching key. The `en.json` file already contains placeholder keys like `lesson_1_avi_body`, `lesson_3_dont_panic_body`, etc. that you can wire up when you're ready.

This is optional. The chrome (titles, subtitles, navigation, tooltips, table headers, vocabulary, dialogues) all translate the moment you add a language file — that's already 80% of the visible UI.

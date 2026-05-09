# Adding a new language

This app is a learning-language **engine** with **language modules** plugged in
on top. The engine handles UI, speech, audio caching, theme, the practice
matrix, and i18n. Everything specific to the language being taught
(vocabulary, lessons, examples, pronunciation, audio) lives in a single
self-contained folder under `src/languages/<code>/`.

To add a new language end-to-end, you create one folder, write a few data
files, register the module in one line, and run one script. You should never
need to edit a file outside `src/languages/<code>/` for routine language work.

---

## TL;DR — the 4-minute version

1. Copy the Romanian module: `cp -R src/languages/ro src/languages/<code>`
2. Replace its data files with content for your new language.
3. Translate the chrome glosses in `src/languages/<code>/locales/{en,uk}.json`.
4. Add the module to the registry: `src/languages/index.ts`.
5. Run `node scripts/generate-audio.mjs <code>` to generate MP3s.
6. `npm run dev` and pick the new language from the sidebar selector.

---

## Folder layout

After adding a language with code `xx`:

```
src/
├── languages/
│   ├── index.ts             ← registry — append your module here (one line)
│   ├── types.ts             ← LanguageModule interface (do not edit)
│   ├── ro/                  ← Romanian (the reference module)
│   └── xx/                  ← YOUR NEW LANGUAGE — everything below lives here
│       ├── index.ts         ← exports the LanguageModule
│       ├── pronounce.ts     ← word → phonetic guide function
│       ├── audio-manifest.ts← AUTO-GENERATED — do not edit
│       ├── PracticeMatrix.tsx← the language-specific verb-drill widget
│       ├── locales/
│       │   ├── en.json      ← English glosses for keys like lesson_3_title
│       │   └── uk.json      ← Ukrainian glosses for the same keys
│       ├── data/
│       │   ├── vocabulary.ts← words grouped by theme (people, food, …)
│       │   ├── verbs.ts     ← core verbs with eu/el/participle forms
│       │   ├── conjugations.ts  ← full conjugations of high-frequency verbs
│       │   ├── matrices.ts  ← matrix definitions, fillers, expressions, tests
│       │   ├── numbers.ts   ← cardinals, ordinals, seasons, weather phrases
│       │   ├── dialogues.ts ← 14 mini-dialogues
│       │   └── schedule.ts  ← study plan + principles + nav-group definitions
│       └── lessons/
│           ├── index.ts         ← re-exports every lesson component
│           ├── Foundation.tsx   ← Lessons 0–2 (rules, sounds, pronouns)
│           ├── Matrix.tsx       ← Lesson 3 (the practice matrix)
│           ├── CoreVerbs.tsx    ← Lessons 4–6 (a fi, a avea, 32 verbs)
│           ├── Grammar.tsx      ← Lessons 7–11
│           ├── Tenses.tsx       ← Lessons 12–17
│           └── Reference.tsx    ← Vocab, Dialogues, Schedule, About-Me
public/
└── audio/
    ├── ro/                  ← all Romanian MP3s, hashed by content
    └── xx/                  ← all your new language's MP3s
scripts/
└── generate-audio.mjs       ← run with one arg: the language code
```

---

## Step 1 — Copy the Romanian module as a starting point

```bash
cp -R src/languages/ro src/languages/xx
```

Romanian is the most-developed module and the structure is sound. Copying it
gives you a working scaffold with all the right files.

---

## Step 2 — Edit the module's `index.ts`

Open `src/languages/xx/index.ts`. Change these fields:

```ts
export const xx: LanguageModule = {
  code:        "xx",                // ISO-ish code; matches folder name
  label:       "Español",           // shown in the language picker
  speechLang:  "es-ES",             // BCP-47 tag for SpeechSynthesis
  azureVoice:  "es-ES-ElviraNeural",// optional — Azure neural voice ID

  pronounce,                        // import from ./pronounce
  audioManifest: AUDIO_MANIFEST,    // import from ./audio-manifest

  navGroups: NAV_GROUPS,            // import from ./data/schedule

  locales: { en: enLocale, uk: ukLocale },

  heroExample:    { text: "¡Buenos días!", en: "Hello / Good day" },
  footerBlessing: { text: "¡Mucha suerte!", en: "footer_blessing_meaning" },

  lessons: [
    { id: "matrix",    Component: PracticeMatrix },
    { id: "rules",     Component: LessonRules },
    // … the rest unchanged from the Romanian template
  ],
};
```

The `lessons` array drives both the routing and the rendering — section ids
must match the hrefs in `navGroups`.

---

## Step 3 — Write the data files in `src/languages/xx/data/`

Each file has a clear shape. The simplest way to learn it is to read
`src/languages/ro/data/<file>.ts` and replace the content. The fields the
engine reads are:

### `vocabulary.ts`

```ts
export const VOCAB_SECTIONS = [
  {
    icon:  "✦",
    label: "People & Family",     // matches a key in locales (vocab_section_label_*)
    items: [
      { ro: "persona", en: "person" },
      { ro: "mujer",   en: "woman" },
      // …
    ],
  },
  // …
];
```

(`ro` is just the field name — it actually holds the *target* language.
The field name stayed for backwards compatibility with the Romanian module.
You can rename it to `text` everywhere if you like; the engine only cares
that the field is consistent.)

`en` is the i18n key and the English fallback gloss. The engine renders the
gloss column by calling `t(en)`. As long as that key exists in the locales,
the gloss appears in the chosen interface language.

### `verbs.ts`

```ts
export const CORE_VERBS = [
  { infinitive: "ser", meaning: "to be",
    euForm: "soy", elForm: "es", participle: "sido" },
  // … 32 of these
];
```

### `conjugations.ts`

Optional — pre-conjugated forms used by the practice matrix's
auto-fill logic. Looks like:

```ts
export const ALL_CONJUGATIONS = [
  {
    infinitive: "ser",
    present:     ["soy", "eres", "es", "somos", "sois", "son"],
    past:        ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"],
    future:      ["seré", "serás", "será", "seremos", "seréis", "serán"],
  },
  // …
];
```

### `matrices.ts`

The lesson-3 practice matrices. The shape is one entry per lesson section
that needs a matrix:

```ts
export const MATRIX_FI = {
  title: "A vorbi — to speak (the \"eu\" row)",  // i18n key for the title
  rows: [
    {
      tenseName: "Future",       // i18n key
      tenseSub:  "colloquial",   // i18n key
      question:    { ro: ["O să vorbesc?"], en: ["Will I speak?"] },
      affirmative: { ro: ["Eu o să vorbesc."], en: ["I will speak."] },
      negative:    { ro: ["N-o să vorbesc."],  en: ["I won't speak."] },
    },
    // …
  ],
};
```

Plus `EXPRESSIONS`, `COMPLEX_SENTENCES`, `FILLER_WORDS`, `GRAND_REVIEW_TESTS`
in the same file. Same shape as Romanian.

### `numbers.ts`

```ts
export const NUMBERS_0_10 = [
  { num: 0,  ro: "zero" },
  // …
];
export const NUMBERS_11_19 = [...];
export const NUMBERS_TENS  = [...];
export const SEASONS = [
  { icon: "❀", ro: "primavera", en: "spring" },
  // …
];
export const WEATHER_PHRASES = [
  { ro: "Hace calor.", en: "It's hot." },
  // …
];
```

### `dialogues.ts`

```ts
export const DIALOGUES = [
  {
    icon: "☕",
    title: "At a Café",                     // i18n key
    lines: [
      { speaker: "A", ro: "¡Buenos días! ...", en: "Good morning! ..." },
      // …
    ],
  },
  // 13 more
];
```

### `schedule.ts`

This one defines five things that are reused across the app:

```ts
export const NAV_GROUPS: NavGroup[] = [
  { label: "Practice",     links: [{ label: "Practice Matrix", href: "#matrix", featured: true }] },
  { label: "Foundations",  links: [
      { label: "Principles", href: "#rules" },
      { label: "Mindset",    href: "#L0" },
      // …
  ]},
  // …
];

export const CORE_PRINCIPLES = [
  { num: "1", title: "Remove the fear",
    description: "Spanish is phonetic, full of cognates. ..." },
  // 6 more
];

export const LIBERATING_TRUTHS = [...]; // same shape, 3 items
export const KEY_PATTERNS      = [...]; // ?, +, − cards (3 items)
export const DAILY_PRACTICE    = [...]; // morning/midday/afternoon/evening (4 items)

export const SCHEDULE_ITEMS = [
  { days: "Days 1–2", task: "L0 + L1: Warm-up. ..." },
  // …
];
```

The `label` and `href` strings here become i18n keys
(`nav_groups_<label>`, `nav_links_<label>`). So if you change them, you
also need the matching keys in your `locales/{en,uk}.json`.

---

## Step 4 — Write `pronounce.ts`

A pure function `pronounce(text: string): string` that produces a short
phonetic guide, shown in tooltips next to the gloss. For Romanian it's about
60 lines of vowel/consonant mappings. For Spanish it's much simpler. For
languages with regular orthography you can return `text.toLowerCase()` and
move on.

---

## Step 5 — Write the lesson components in `src/languages/xx/lessons/`

The Romanian lessons are your blueprint. Each is a thin layout file that
imports widgets from `src/components/ui` and feeds them data from
`../data/*`. The widgets you'll use most:

| Widget          | Use for                                       |
|-----------------|-----------------------------------------------|
| `LessonSection` | The wrapper around every lesson               |
| `SectionHeading`| Sub-section heading inside a lesson           |
| `InfoBox`       | Tip / aside / contract box                    |
| `DataTable`     | Tabular content (declension, conjugation, …)  |
| `VocabGrid`     | Two-column word + gloss grid                  |
| `PhraseGrid`    | Bilingual sentence list                       |
| `SoundGrid`     | Letter / sound / example cards                |
| `MonoBlock`     | Mono-font code-style block                    |
| `Matrix`        | Verb practice matrix (data from matrices.ts)  |
| `TestBox`       | Collapsible self-test                         |
| `DrillBox`      | Speaking-aloud practice block                 |
| `DialogueBox`   | Two-speaker mini-dialogue                     |
| `VerbCardGrid`  | The 32-verb card grid                         |
| `NumberGrid`    | Number lists                                  |
| `ScheduleGrid`  | The "32-day plan" rows                        |
| `PrincipleGrid` | The 7-principles cards                        |
| `FillerGrid`    | Filler-words grid                             |
| `ContrastBox`   | Two-column "yes / no" comparison              |

Inside lesson body prose, wrap any text node in `<Trans>`:

```tsx
import { Trans } from "react-i18next";

<InfoBox variant="blue" title="lesson_1_avi_title">
  <p>
    <Trans
      i18nKey="lesson_1_avi_body"
      components={[<b />, <i />, <RO text="..." en="..." />]}
    />
  </p>
</InfoBox>
```

The numbered placeholders in the i18n value (`<0>`, `<1>`, …) substitute the
elements you pass in `components`. This is how a single lesson layout
renders correctly in any interface language.

For text that needs no formatting, just call `t("…")`:

```tsx
<p>{t("lesson_3_drill_body")}</p>
```

---

## Step 6 — Translate the locales

Two files: `src/languages/xx/locales/en.json` and `…/uk.json`.

You need **two kinds of entries**:

### Kind A — UI chrome keys

Underscored identifiers your lesson layouts reference:

```json
{
  "lesson_3_tag":      "Lesson 3",
  "lesson_3_title":    "The verb matrix",
  "lesson_3_subtitle": "Three tenses × three forms",
  "lesson_3_h_patterns": "The three key patterns",
  "lesson_3_dont_panic_body": "Start with just the <0>«eu» (I)</0> row. ..."
}
```

These are required. If a key is missing in `en.json`, the chrome falls back
to the key itself (so the user sees `lesson_3_title` literally — broken).

### Kind B — content glosses

Every English gloss your data files use as `en:` value also needs to exist
in `uk.json` (and any other interface locale you support). Examples:

```json
{
  "person":     "людина",
  "to be":      "бути",
  "Hello!":     "Привіт!",
  "At a Café":  "У кав'ярні"
}
```

You don't need to add these to `en.json` — i18next falls back to the key
itself, which is already English.

### Tools to find missing keys

```bash
# Show every untranslated string in the active module
node -e '
const m = require("./src/languages/xx/data/vocabulary.ts");  // adapt as needed
// or just grep for `en:` values across data/*.ts and lessons/*.tsx
'
```

The repo also has audit scripts (in this conversation's working notes) that
list every `en:` value used in a module, so you can diff against your
locale files.

---

## Step 7 — Register the module

Open `src/languages/index.ts` and add your new module:

```ts
import { ro } from "./ro";
import { xx } from "./xx";    // ← new
import type { LanguageModule } from "./types";

export const LANGUAGES: readonly LanguageModule[] = [ro, xx];   // ← new
```

That's the only common file you have to touch.

The first entry in `LANGUAGES` is the default the user sees on first load.

---

## Step 8 — Generate audio

```bash
node scripts/generate-audio.mjs xx
```

The script:

1. Walks `src/languages/xx/` for every target-language string.
2. Writes MP3s to `public/audio/xx/`.
3. Writes the manifest to `src/languages/xx/audio-manifest.ts`.

Run it again any time you add words / phrases / sentences. Strings with
existing MP3s are skipped — only new strings cost API characters.

To preview without spending API credits, run with no `ELEVEN_API_KEY` set —
the script will rebuild the manifest from MP3s already on disk.

To swap providers (OpenAI TTS, Azure TTS, etc.), edit just the
`synthesize()` function near the bottom of the script.

---

## Step 9 — Try it

```bash
npm run dev
```

Open the app, click the language selector at the bottom of the sidebar,
pick your new language. The whole guide should re-render with your new
content.

---

## What the engine handles for you

You should never need to touch these:

- `src/components/*` — UI primitives, layout, hero, footer, sidebar
- `src/context/*` — theme, language, target-language providers
- `src/lib/*` — i18n setup, audio cache, TTS, active-language helpers
- `src/styles/*` — design tokens, typography, light/dark theme
- `src/locales/*` — engine chrome strings (theme toggle, nav open/close, etc.)
- `src/main.tsx`, `src/App.tsx`, `vite.config.ts`, `tsconfig.json` — bootstrapping

---

## What if I need engine changes?

If you find yourself wanting to:

- Add a new widget type → add it to `src/components/ui.tsx`, then it's
  available to every language.
- Change how the matrix renders → edit `src/components/Matrix.tsx`.
- Add a new chrome string (e.g. a button label) → add it to
  `src/locales/{en,uk}.json` and reference it as `t("your_key")`.

These are real engine changes and they affect every language. Before making
them, check that the existing widget set can't already do what you want.

---

## Common pitfalls

- **Curly vs straight apostrophes.** If your source text uses `'` (U+2019)
  in `<RO en="...">` and your locale uses `'` (U+0027) as the key, they
  won't match. Always copy the exact character from the source.
- **Romanian content accidentally translated.** If you put a target-language
  word like `"face"` (Romanian for "do/make") in a locale file as if it
  were an English gloss, every place that displays that Romanian form will
  render the translation instead. Disambiguate by changing the gloss
  (e.g. `"face (body)"`) or by not putting target-language strings in the
  locales at all — leave them to identity-fallback.
- **Audio path mismatch.** MP3s now live under `public/audio/<code>/`.
  If you copied an old manifest into a new module, regenerate it with the
  script — the old flat path no longer works.
- **Interface vs target language.** "Locales" are *interface* languages
  (English, Ukrainian, …). The "language module" is the *target* language
  being learned. Don't confuse them — they're separate selectors at the
  bottom of the sidebar, and the i18n system distinguishes them too.

---

## A worked example: adding Spanish in 30 minutes

```bash
# 1. scaffold
cp -R src/languages/ro src/languages/es

# 2. edit src/languages/es/index.ts
#    code: "es", label: "Español", speechLang: "es-ES",
#    azureVoice: "es-ES-ElviraNeural"
#    heroExample: { text: "¡Buenos días!", en: "Hello / Good day" }
#    footerBlessing: { text: "¡Mucha suerte!", en: "footer_blessing_meaning" }

# 3. replace every Romanian word in src/languages/es/data/*.ts with
#    Spanish equivalents — same field shapes, different content

# 4. wipe Romanian-specific keys from src/languages/es/locales/uk.json
#    that no longer apply, add Spanish glosses

# 5. register
echo "register es in src/languages/index.ts"

# 6. audio (optional but recommended)
node scripts/generate-audio.mjs es

# 7. ship
npm run dev
```

You're done. The matrix, vocab grids, dialogues, study plan, and self-tests
all re-render in Spanish with no engine changes.

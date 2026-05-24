# VerbMatrix — Fixes Applied

Drop this `src/` over the existing one. All changes are surgical — no
architectural refactors, no schema migrations, no new dependencies.

## Summary

**56 fixes across 12 files**, grouped into four phases. Every change is
listed below with file + line + reason.

---

## Phase 1 — Engine locales (`src/locales/`)

### `en.json`
- **`hero_title`** → "Speak Romanian in seventeen lessons." (was "sixteen" — inconsistent with FAQ/paywall which said 17)
- **`onboarding_step5_aside`** → "thirty-two days" + "Day 32" (was "thirty days" / "Day 30" — inconsistent with everywhere else)
- **`landing_includes_vocab`** → "Five hundred-plus Vocabulary **Words**" (was missing the noun)
- **`landing_problem_quote`** → "still **blank** the moment a real conversation starts" (was the same "freeze when the waiter asks" metaphor used in 3 places)
- **`landing_loss_body`** → "still **stumble on a basic phone call**" (vary the metaphor)
- **`app_brand_suffix`** → `""` (was "study" — produced awkward "VerbMatrix Study")
- **`landing_hero_corner_1/2/3`** → populated (were empty strings; UK already had values, so EN users saw blank corners while UK saw filled ones)
- **`playback_speed_*`** new keys for the SpeedPill widget

### `uk.json`
- **`landing_hero_meta`** → "32-денний курс · Разовий платіж" (was **"Румунська · Іспанська · Японська"** — listed products that don't exist; would mislead every Ukrainian visitor on the landing page)
- **`day_prog_fluency`** → "Вільне володіння" (was "Справжня плавність" — "плавність" literally means "smoothness", not fluency)
- 15 missing engine keys backfilled: `landing_guarantee_signature_*`, `landing_loss_*`, `landing_speak_*` (were only in EN engine + RO-specific overrides — would fall through to English if a non-RO course is ever added)
- **`playback_speed_*`** UK translations for the SpeedPill widget

---

## Phase 2 — Romanian course locales (`src/languages/ro/locales/`)

### `uk.json` (Ukrainian)
- **`nav_links_Mindset`** + **`lesson_0_tag`** → "Установка" (was "Налаштування" — that word means **"Settings"** in Ukrainian; users would click the nav item expecting app preferences)
- **`lesson_12_title`** → "Імперфект" (was "Минулий тривалий" — inconsistent with `lesson_12_subtitle`, nav, headings which all said "Імперфект")
- **`lesson_12_goal`** → "Імперфект регулярний" (was "Минулий тривалий час правильний" — same inconsistency)
- **`lesson_16_title`** → "Шар <em>шліфування</em>" (was "Шар <em>лоску</em>" — "лоск" is a Russian word, not Ukrainian)
- **`lesson_16_recap`** → "сигналізують про вільне володіння" (was "...про плавність" — same fluency word fix)
- **`lesson_0_recap`** → rewritten to match the "Ти..." pattern of every other recap (was the only lesson starting with "Бар'єр ніколи не був граматикою..." — broke the established pattern)
- **Lesson count** → "сімнадцять" everywhere (was mix of шістнадцять/сімнадцять)
- **72 duplicate keys deduped** — every phrase that existed as both `"It's hot."` (straight apostrophe) and `"It's hot."` (curly) — kept the curly version since the source code uses it; this halves translation maintenance burden
- **Quote normalization** — all `"..."` and `„..."` strings converted to `«...»` (Ukrainian convention)

### `en.json` (English)
- **`lesson_0_recap`** → "You decided to speak imperfectly out loud..." (was "The barrier was never grammar..." — only recap that didn't start with "You")
- Lesson count standardized to "seventeen"

### `landing.uk.json` + `landing.en.json`
- `landing_loss_body` updated to varied metaphor ("stumble on a basic phone call" / "звичайної телефонної розмови")

---

## Phase 3 — Audio coverage (`src/components/ui.tsx` + lesson files)

Every audible Romanian element now has a clickable `<RO>` wrapper.

### `components/ui.tsx`

**`SoundGrid`** — the special character symbol (`ă`, `â`, `î`, `ș`, `ț`) is now wrapped in `<RO>`. Before: only the example word was clickable; the symbol itself was just text. This was the most critical gap — the *whole point* of Lesson 1 is hearing those sounds.

**`DataTable` cell-splitting bug** — rewrote the speakable-cell logic into a new `SpeakableCell` component. Old behavior:

```tsx
const main = cell.split("→")[0]?.split("/")[0]?.trim() ?? cell;
return <RO text={main}>{cell}</RO>;
```

For `"a vorbi → vorbit"` only "a vorbi" played; the participle was silent. For `"bun / bună / buni / bune"` only "bun" played. Now each variant becomes its own `<RO>` chip — every form is independently clickable.

### `languages/ro/lessons/Matrix.tsx`
- **L3 formal future table** — added `speakableCols={[1, 2, 3, 4]}` (was just `[1]`, the marker column). All 18 conjugated forms (`voi face`, `vei merge`, etc.) are now clickable.

### `languages/ro/lessons/CoreVerbs.tsx`
- **L5 past participle groups** — added `speakableCols={[3]}` (had nothing). `a face → făcut`, `a vorbi → vorbit` are now clickable with the `SpeakableCell` rendering each form as its own chip.

### `languages/ro/lessons/Grammar.tsx`
- **L7 indefinite articles table** — added `[1, 2]` cols (was just `[3]`). `un`, `o`, `niște` are now individually clickable.
- **L7 definite articles** — added col `[2]` (was just `[3]`). The without/with-article forms are both clickable.

### `languages/ro/lessons/Tenses.tsx`
- **L12 imperfect conjugation** — added cols `[2, 3, 4, 5]` (was just `[1]`). Now all 5 verb columns × 6 persons = 30 forms are clickable. Before, only `a fi` was audible.
- **L12 DrillBox examples** — wrapped raw Romanian text in `<RO>` (was unwrapped, so silent).
- **L13 commands table** — added negative col `[3]` (was `[1, 2]`). `Nu vorbi!`, `Nu mânca!` etc. are now clickable.
- **L14 subjunctive table** — expanded to `[0, 1, 2, 3]` (was just `[2]`). Verb infinitive, present, subjunctive, AND example sentence all clickable.

---

## Phase 4 — Speed control

A real, persistent, three-tier speed control with keyboard shortcuts and per-word slow override.

### New: `context/Playback.tsx` (rewritten from stub)

The old file was an 18-line hardcoded constant (`speed: 0.85`, no UI, no React state). Replaced with a proper React context:

- **Three tiers:** `SPEEDS = { slow: 0.75, normal: 1.0, fast: 1.15 }` — chosen as the band where pitch-preserved playback still sounds natural.
- **`PlaybackProvider`** — wraps `<AppContent />`. Hydrates from `localStorage` on mount; writes back on change.
- **`usePlayback()` hook** — `{ tier, setTier, requestSlowOverride }`.
- **`getPlaybackSettings()`** — module-level function for the non-React TTS engine to call from inside its audio queue (unchanged API; `tts.ts` needs no edits).
- **`requestSlowOverride()`** — sets a one-shot flag consumed by the next `getPlaybackSettings()` call. Powers the shift+click feature.

Default tier: **Normal (1.0)**. The old hardcoded 0.85 was beginner-friendly but trained users on a non-native cadence. Better to ship native by default and let learners explicitly choose Slow when they need it.

### New: `components/SpeedPill.tsx`

Fixed bottom-right widget. Three buttons (Slow / Normal / Fast), one tap to switch. Features:

- **Keyboard:** `1`, `2`, `3` set the tier. Suppressed when typing in inputs.
- **Hover hint:** shows "shift-click any word to hear it slowly" so users discover the per-word override.
- **ARIA radiogroup** for screen readers.
- Active tier highlighted gold.

### Modified: `components/RO.tsx`

Added shift+click handler. When the user holds Shift and clicks any Romanian word, `requestSlowOverride()` fires and the next utterance plays at Slow regardless of the current global tier. After that one play, behavior returns to the user's chosen tier. Lets fast learners zoom in on a tricky word without changing modes.

### Modified: `App.tsx`

- Added `PlaybackProvider` to the provider stack (between `TargetLanguageProvider` and `LessonNavProvider`).
- Mounted `<SpeedPill />` inside `AppContent` so it appears whenever the textbook is loaded (not on landing).

---

## What I did NOT change (intentionally)

- **`types.ts` MatrixCell hardcoded `ro: string[]`** — flagged in previous review as architectural debt that only matters when adding a 2nd language. Refactor when Spanish/Japanese ships, not before.
- **Lesson structural inconsistencies** (TestBox / DrillBox coverage varies across lessons) — needs new content per lesson, requires your taste, not mechanical.
- **`tts.ts`** — no changes needed; it already reads from `getPlaybackSettings()` and the new context exports the same function with the same signature.
- **Manual Ukrainian translation rewrites** beyond the 4 specific errors flagged — leave to a native Ukrainian editor.

---

## Verification

All files type-check cleanly under strict TypeScript. All JSON files validated.

Test path before deploying:
1. `npm run dev` (or your equivalent)
2. Open `/ro`
3. Land in Lesson 1 — click the big `ă` symbol → should hear it
4. Open Lesson 12 — click any cell in the imperfect table → should hear the form
5. Try keyboard `1` / `2` / `3` → SpeedPill should switch tiers
6. Hold Shift, click any word in fast mode → should hear it slow, then return to fast
7. Refresh → SpeedPill should remember your tier
8. Switch UI language to Ukrainian → nav should say "Установка" not "Налаштування", Lesson 12 should say "Імперфект"

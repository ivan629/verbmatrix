#!/usr/bin/env node
/**
 * Voice discovery for ElevenLabs.
 *
 * Lists voices available in YOUR account, optionally filtered by language.
 * Use this to find the right voice ID for a language module instead of
 * guessing or copy-pasting from a blog.
 *
 * ─── Usage ───────────────────────────────────────────────────────────
 *   ELEVEN_API_KEY=xxx node scripts/list-voices.mjs           # all voices
 *   ELEVEN_API_KEY=xxx node scripts/list-voices.mjs ro        # filter Romanian
 *   ELEVEN_API_KEY=xxx node scripts/list-voices.mjs ro --json # raw JSON
 *
 * ─── What it shows ───────────────────────────────────────────────────
 *   • Voice ID (copy this into audio-config.json)
 *   • Name + description
 *   • Labels (language, accent, age, use-case) when present
 *   • A preview URL you can open in a browser to LISTEN before choosing
 *
 * ─── Why language filtering is fuzzy ─────────────────────────────────
 * ElevenLabs voices don't always tag their language cleanly. This script
 * matches against name, description, and labels. A voice that says
 * "Romanian" anywhere shows up. If filtering hides a voice you know is
 * good, run without the filter to see everything.
 *
 * ─── Finding MORE Romanian voices ────────────────────────────────────
 * Your account only sees voices you've ADDED to your VoiceLab. To browse
 * the full public library and add native Romanian voices:
 *   1. Go to elevenlabs.io/app/voice-library
 *   2. Filter: Language → Romanian
 *   3. Click "Add" on voices you like (Robert Mihai, Liviu Mihai, Andrei…)
 *   4. Re-run this script — they'll now appear with their IDs
 */

const API_KEY = process.env.ELEVEN_API_KEY;
const args = process.argv.slice(2);
const LANG_FILTER = args.find((a) => !a.startsWith("--"))?.toLowerCase();
const JSON_OUT = args.includes("--json");

// Language-name aliases so "ro" matches "Romanian", etc.
const LANG_NAMES = {
  ro: ["romanian", "română", "romana", "ro"],
  uk: ["ukrainian", "українськ", "uk"],
  en: ["english", "en"],
  de: ["german", "deutsch", "de"],
  fr: ["french", "français", "fr"],
  es: ["spanish", "español", "es"],
  it: ["italian", "italiano", "it"],
  pl: ["polish", "polski", "pl"],
};

if (!API_KEY) {
  console.error("✗ ELEVEN_API_KEY not set.");
  console.error("  Run:  ELEVEN_API_KEY=your_key node scripts/list-voices.mjs ro");
  process.exit(1);
}

const needles = LANG_FILTER ? (LANG_NAMES[LANG_FILTER] || [LANG_FILTER]) : null;

function matchesLanguage(voice) {
  if (!needles) return true;
  const haystack = [
    voice.name,
    voice.description,
    ...Object.values(voice.labels || {}),
    ...(voice.verified_languages || []).map((v) => v.language || v),
    voice.fine_tuning?.language,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return needles.some((n) => haystack.includes(n));
}

async function main() {
  // v2 endpoint returns richer metadata (verified_languages, etc.)
  let res = await fetch("https://api.elevenlabs.io/v2/voices?page_size=100", {
    headers: { "xi-api-key": API_KEY },
  });
  if (!res.ok) {
    // Fall back to v1 if v2 unavailable on this plan
    res = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": API_KEY },
    });
  }
  if (!res.ok) {
    console.error(`✗ API error ${res.status}: ${await res.text().catch(() => "")}`);
    process.exit(1);
  }
  const data = await res.json();
  const voices = data.voices || [];

  const filtered = voices.filter(matchesLanguage);

  if (JSON_OUT) {
    console.log(JSON.stringify(filtered, null, 2));
    return;
  }

  const label = LANG_FILTER ? `"${LANG_FILTER}"` : "all languages";
  console.log(`\n→ Voices in your account matching ${label}: ${filtered.length} of ${voices.length} total\n`);

  if (filtered.length === 0) {
    console.log("No matching voices in your VoiceLab.");
    console.log("\nTo add native Romanian voices:");
    console.log("  1. Open https://elevenlabs.io/app/voice-library");
    console.log("  2. Filter Language → Romanian");
    console.log("  3. Add voices like Robert Mihai, Liviu Mihai, Andrei");
    console.log("  4. Re-run this script\n");
    return;
  }

  for (const v of filtered) {
    const labels = v.labels || {};
    const langs = (v.verified_languages || [])
      .map((x) => x.language || x)
      .filter(Boolean)
      .join(", ");
    console.log(`● ${v.name}`);
    console.log(`  Voice ID:  ${v.voice_id}`);
    if (v.description) console.log(`  About:     ${v.description.slice(0, 100)}`);
    const meta = [
      labels.language && `lang=${labels.language}`,
      labels.accent && `accent=${labels.accent}`,
      labels.age && `age=${labels.age}`,
      labels.gender && `gender=${labels.gender}`,
      labels.use_case && `use=${labels.use_case}`,
      langs && `verified=[${langs}]`,
    ].filter(Boolean);
    if (meta.length) console.log(`  Labels:    ${meta.join("  ")}`);
    if (v.preview_url) console.log(`  Preview:   ${v.preview_url}`);
    console.log("");
  }

  console.log("To use one: copy its Voice ID into src/languages/ro/audio-config.json");
  console.log("Then run:   npm run audio:fresh\n");
}

main().catch((err) => {
  console.error("✗ Failed:", err.message);
  process.exit(1);
});

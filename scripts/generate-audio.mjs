#!/usr/bin/env node
/**
 * generate-audio.mjs — pre-generate native-quality MP3s for ONE language
 * module at a time.
 *
 * Usage:
 *   node scripts/generate-audio.mjs <code>     # e.g. ro, es, fr
 *   node scripts/generate-audio.mjs            # defaults to "ro"
 *
 * What it does:
 *   1. Walks src/languages/<code>/ for every target-language string
 *      (data files, lesson .tsx, the module's index.ts).
 *   2. Calls ElevenLabs Multilingual v2 for each missing string.
 *   3. Saves MP3s to public/audio/<code>/.
 *   4. Rewrites src/languages/<code>/audio-manifest.ts.
 *
 * Resumable on two levels:
 *   - If an MP3 for a given string already exists on disk, the API call
 *     is skipped and the string is just recorded in the manifest.
 *   - With no API key, runs in REBUILD-ONLY mode — manifest is rebuilt
 *     from MP3s already on disk. Useful after pulling a fresh project copy
 *     that wiped the manifest.
 *
 * Setup: put ELEVEN_API_KEY in .env (and optionally ELEVEN_VOICE_ID).
 *
 * To swap providers (OpenAI, Azure, etc.), replace the `synthesize()`
 * function near the bottom — everything else stays the same.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

// ─── 0. Parse args + load .env ──────────────────────────────────
const LANG_CODE = (process.argv[2] || "ro").trim();
if (!/^[a-z][a-z0-9-]*$/.test(LANG_CODE)) {
  console.error(`✗ Bad language code: "${LANG_CODE}". Use lowercase letters/digits/hyphens, e.g. "ro" or "pt-br".`);
  process.exit(1);
}

if (existsSync(".env")) {
  const env = readFileSync(".env", "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

const API_KEY = process.env.ELEVEN_API_KEY;
const VOICE_ID = process.env.ELEVEN_VOICE_ID || "pNInz6obpgDQGcFmaJgB"; // Adam — neutral male
const MODEL_ID = process.env.ELEVEN_MODEL_ID || "eleven_multilingual_v2";

const MODULE_DIR   = path.join("src", "languages", LANG_CODE);
const AUDIO_DIR    = path.join("public", "audio", LANG_CODE);
const MANIFEST_PATH = path.join(MODULE_DIR, "audio-manifest.ts");

if (!existsSync(MODULE_DIR)) {
  console.error(`✗ No language module at ${MODULE_DIR}.`);
  console.error(`  Create the folder and its contents first — see ADD_LANGUAGE.md.`);
  process.exit(1);
}
mkdirSync(AUDIO_DIR, { recursive: true });

if (!API_KEY) {
  console.warn("\n⚠  No ELEVEN_API_KEY in .env\n");
  console.warn("   Running in REBUILD-ONLY mode — the manifest will be rebuilt");
  console.warn("   from MP3s that already exist on disk. No new audio will be");
  console.warn("   generated.\n");
  console.warn("   To generate new audio:");
  console.warn("     1. Sign up at https://elevenlabs.io (free: 10K chars/month)");
  console.warn("     2. Profile menu → API Keys → create one");
  console.warn("     3. Add to .env:    ELEVEN_API_KEY=your_key_here\n");
}

console.log(`→ Language module: ${LANG_CODE}`);
console.log(`  Source:   ${MODULE_DIR}/`);
console.log(`  Audio:    ${AUDIO_DIR}/`);
console.log(`  Manifest: ${MANIFEST_PATH}\n`);

// ─── 1. Walk source files and extract target-language strings ───
function walk(dir, exts, found = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    if (name === "locales") continue; // skip i18n JSON — that's interface text
    if (name === "audio-manifest.ts") continue; // skip the manifest itself
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, exts, found);
    else if (exts.some((e) => name.endsWith(e))) found.push(full);
  }
  return found;
}

function extractStrings(file, results) {
  const src = readFileSync(file, "utf8");

  // <RO text="..." />
  for (const m of src.matchAll(/<RO\b[^>]*\btext=(?:"([^"]+)"|'([^']+)')/g)) {
    results.add(m[1] ?? m[2]);
  }
  // ro: "..."
  for (const m of src.matchAll(/\bro:\s*(?:"([^"]+)"|'([^']+)')/g)) {
    results.add(m[1] ?? m[2]);
  }
  // ro: ["...", "...", ...]
  for (const m of src.matchAll(/\bro:\s*\[([^\]]+)\]/g)) {
    for (const sm of m[1].matchAll(/"([^"]+)"/g)) results.add(sm[1]);
  }
  // Common per-item field names that hold target-language text
  const FIELDS = ["word", "exampleWord", "infinitive", "euForm", "elForm", "participle", "text"];
  for (const field of FIELDS) {
    const re = new RegExp(`\\b${field}:\\s*(?:"([^"]+)"|'([^']+)')`, "g");
    for (const m of src.matchAll(re)) results.add(m[1] ?? m[2]);
  }
  // TestBox answers (target language)
  for (const m of src.matchAll(/\banswer:\s*(?:"([^"]+)"|'([^']+)')/g)) {
    results.add(m[1] ?? m[2]);
  }
}

console.log("→ Scanning module for target-language text…");
const allFiles = walk(MODULE_DIR, [".ts", ".tsx"]);

const strings = new Set();
for (const f of allFiles) extractStrings(f, strings);

const cleaned = [...strings]
  .map((s) => s.trim())
  .filter((s) => {
    if (s.length < 1 || s.length > 400) return false;
    // Must contain at least one letter (Latin or extended Latin / Cyrillic)
    if (!/[\p{L}]/u.test(s)) return false;
    return true;
  });
cleaned.sort();
console.log(`  found ${cleaned.length} unique strings\n`);

// ─── 2. Hash each string ────────────────────────────────────────
function hashOf(text) {
  return createHash("sha1").update(text, "utf8").digest("hex").slice(0, 12);
}

// ─── 3. Generate MP3s for missing ones (or rebuild manifest only) ──
const manifest = {};
let generated = 0;
let skipped = 0;
let failed = 0;
let charsThisRun = 0;

async function synthesize(text) {
  // ElevenLabs Multilingual v2. Swap this function to use OpenAI / Azure / etc.
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.78,
          style: 0,
          use_speaker_boost: true,
        },
      }),
    }
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${detail.slice(0, 200)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

console.log(API_KEY ? "→ Generating audio…\n" : "→ Rebuilding manifest from existing MP3s…\n");
const t0 = Date.now();

for (let i = 0; i < cleaned.length; i++) {
  const text = cleaned[i];
  const hash = hashOf(text);
  const filepath = path.join(AUDIO_DIR, `${hash}.mp3`);

  if (existsSync(filepath)) {
    manifest[text] = hash;
    skipped++;
    continue;
  }

  if (!API_KEY) {
    failed++;
    continue;
  }

  const display = text.length > 60 ? text.slice(0, 57) + "…" : text;
  process.stdout.write(`  [${i + 1}/${cleaned.length}] ${display.padEnd(60)} `);

  try {
    const mp3 = await synthesize(text);
    writeFileSync(filepath, mp3);
    manifest[text] = hash;
    generated++;
    charsThisRun += text.length;
    process.stdout.write(`✓ ${(mp3.length / 1024).toFixed(1)}KB\n`);
  } catch (err) {
    failed++;
    process.stdout.write(`✗ ${err.message}\n`);
    if (/401|403/.test(String(err))) {
      console.error("\n⚠  Stopping — auth error suggests the key is wrong or quota is exhausted.");
      break;
    }
    if (/429/.test(String(err))) {
      console.log("    (rate limited — sleeping 10s)");
      await new Promise((r) => setTimeout(r, 10_000));
    }
  }

  await new Promise((r) => setTimeout(r, 60));
}

// ─── 4. Write manifest ──────────────────────────────────────────
const sortedEntries = Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b));
const body = sortedEntries
  .map(([text, hash]) => `  ${JSON.stringify(text)}: "${hash}",`)
  .join("\n");

const manifestSource = `/**
 * AUTO-GENERATED FILE — do not edit by hand.
 *
 * Maps target-language text → content-hash filename in
 * /public/audio/${LANG_CODE}/.
 *
 * Populated by \`node scripts/generate-audio.mjs ${LANG_CODE}\`.
 *
 * When this map has an entry for the text being spoken, the app plays the
 * pre-generated MP3 instantly and offline. Otherwise it falls through to
 * Azure (if configured) → browser SpeechSynthesis.
 */
export const AUDIO_MANIFEST: Record<string, string> = {
${body}
};
`;
writeFileSync(MANIFEST_PATH, manifestSource);

const seconds = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\n✓ Done in ${seconds}s`);
console.log(`  language: ${LANG_CODE}`);
console.log(`  in manifest: ${Object.keys(manifest).length} / ${cleaned.length}`);
console.log(`  generated this run: ${generated}`);
console.log(`  skipped (already on disk): ${skipped}`);
if (failed) console.log(`  missing: ${failed} ${API_KEY ? "(failed)" : "(no API key — runtime fallback will handle)"}`);
if (charsThisRun) console.log(`  characters generated: ${charsThisRun.toLocaleString()}`);
console.log(`  manifest: ${MANIFEST_PATH}`);
console.log(`  audio:    ${AUDIO_DIR}/`);
console.log("\n  Restart `npm run dev` to pick up the new manifest.\n");

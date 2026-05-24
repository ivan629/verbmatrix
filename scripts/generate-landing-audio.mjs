#!/usr/bin/env node
/**
 * generate-landing-audio.mjs — pre-generate MP3s for the landing-page
 * target-language strings of ONE language module.
 *
 * Usage:
 *   node scripts/generate-landing-audio.mjs <code>     # e.g. ro, es
 *   node scripts/generate-landing-audio.mjs            # defaults to "ro"
 *
 * What it does:
 *   1. Reads every src/languages/<code>/locales/landing.*.json file.
 *   2. Extracts all keys that start with "landing_tl_" — target-language
 *      strings spoken on the landing page (demo matrix cells, the
 *      speak-aloud phrase, etc.). Other keys are interface copy and skipped.
 *   3. De-duplicates across all locale files.
 *   4. Expands "/" and "→" variants (matches SpeakableCell behavior).
 *   5. Calls ElevenLabs Multilingual v2 for each missing string.
 *   6. Saves MP3s to public/audio/<code>/.
 *   7. Writes/merges into src/languages/<code>/audio-manifest.ts.
 *
 * The manifest is MERGED, not replaced — entries from generate-audio.mjs
 * are preserved. Landing audio is additive.
 *
 * Resumable: skips MP3s already on disk.
 * Rebuild-only mode: if no ELEVEN_API_KEY, rebuilds manifest from disk.
 *
 * Setup: put ELEVEN_API_KEY in .env (and optionally ELEVEN_VOICE_ID).
 */

import {
  readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync,
} from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

// ─── 0. Parse args + load .env ──────────────────────────────────
const LANG_CODE = (process.argv[2] || "ro").trim();
if (!/^[a-z][a-z0-9-]*$/.test(LANG_CODE)) {
  console.error(`✗ Bad language code: "${LANG_CODE}".`);
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

const API_KEY    = process.env.ELEVEN_API_KEY;
const VOICE_ID   = process.env.ELEVEN_VOICE_ID || "pNInz6obpgDQGcFmaJgB";
const MODEL_ID   = process.env.ELEVEN_MODEL_ID || "eleven_multilingual_v2";

const MODULE_DIR    = path.join("src", "languages", LANG_CODE);
const LOCALES_DIR   = path.join(MODULE_DIR, "locales");
const AUDIO_DIR     = path.join("public", "audio", LANG_CODE);
const MANIFEST_PATH = path.join(MODULE_DIR, "audio-manifest.ts");

if (!existsSync(MODULE_DIR)) {
  console.error(`✗ No language module at ${MODULE_DIR}.`);
  process.exit(1);
}
mkdirSync(AUDIO_DIR, { recursive: true });

if (!API_KEY) {
  console.warn("\n⚠  No ELEVEN_API_KEY — running in REBUILD-ONLY mode.\n");
}

console.log(`→ Language: ${LANG_CODE}`);
console.log(`  Locales:  ${LOCALES_DIR}/landing.*.json`);
console.log(`  Audio:    ${AUDIO_DIR}/`);
console.log(`  Manifest: ${MANIFEST_PATH} (merged)\n`);

// ─── 1. Variant expansion (matches generate-audio.mjs) ──────────
// Splits on " · ", " → " and " / " so each runtime SpeakableCell chip has
// its own MP3. Skips pure morphology markers like "-at".
function expandVariants(text) {
  const out = new Set();
  out.add(text.trim());
  for (const seg of text.split(/\s*·\s*/)) {
    out.add(seg.trim());
    for (const part of seg.split(/\s*→\s*/)) {
      out.add(part.trim());
      for (const variant of part.split(/\s*\/\s*/)) {
        const v = variant.trim();
        if (v && !/^-/.test(v)) out.add(v);
      }
    }
  }
  return [...out].filter((s) => s.length > 0);
}

// ─── 2. Extract landing_tl_* values from all landing.*.json ────
function extractTLStrings(localesDir) {
  const strings = new Set();
  let localeFiles;
  try {
    localeFiles = readdirSync(localesDir).filter(
      (f) => f.startsWith("landing.") && f.endsWith(".json")
    );
  } catch {
    console.error(`✗ Could not read ${localesDir}`);
    process.exit(1);
  }
  if (localeFiles.length === 0) {
    console.error(`✗ No landing.*.json files found.`);
    process.exit(1);
  }
  console.log(`→ Reading landing locale files:`);
  for (const file of localeFiles) {
    const fullPath = path.join(localesDir, file);
    let data;
    try { data = JSON.parse(readFileSync(fullPath, "utf8")); }
    catch (e) { console.warn(`  ⚠  ${file}: ${e.message}`); continue; }

    let count = 0;
    for (const [key, value] of Object.entries(data)) {
      if (
        key.startsWith("landing_tl_") &&
        typeof value === "string" &&
        value.trim().length > 0 &&
        /[\p{L}]/u.test(value)
      ) {
        for (const variant of expandVariants(value.trim())) {
          strings.add(variant);
        }
        count++;
      }
    }
    console.log(`  ${file}: ${count} tl_ strings`);
  }
  return strings;
}

const tlStrings = extractTLStrings(LOCALES_DIR);
const cleaned = [...tlStrings].sort();
console.log(`\n  Total unique target-language strings (with variants): ${cleaned.length}\n`);

if (cleaned.length === 0) {
  console.log("  Nothing to generate.\n");
  process.exit(0);
}

// ─── 3. Hash + read existing manifest (merge, not replace) ──────
function hashOf(text) {
  return createHash("sha1").update(text, "utf8").digest("hex").slice(0, 12);
}

function readExistingManifest(manifestPath) {
  if (!existsSync(manifestPath)) return {};
  const src = readFileSync(manifestPath, "utf8");
  const manifest = {};
  for (const m of src.matchAll(/^\s+"([^"]+)":\s+"([a-f0-9]{12})"/gm)) {
    manifest[m[1]] = m[2];
  }
  return manifest;
}

const existingManifest = readExistingManifest(MANIFEST_PATH);
console.log(`→ Existing manifest: ${Object.keys(existingManifest).length} entries\n`);

// ─── 4. Synthesize missing ───────────────────────────────────────
const manifest = { ...existingManifest };
let generated = 0, skipped = 0, failed = 0, charsThisRun = 0;

async function synthesize(text) {
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
          stability: 0.7,
          similarity_boost: 0.85,
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

  if (existsSync(filepath)) { manifest[text] = hash; skipped++; continue; }
  if (!API_KEY) { if (!manifest[text]) failed++; continue; }

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
      console.error("\n⚠  Stopping — auth error. Check ELEVEN_API_KEY.");
      break;
    }
    if (/429/.test(String(err))) {
      console.log("    (rate limited — sleeping 10s)");
      await new Promise((r) => setTimeout(r, 10_000));
    }
  }
  await new Promise((r) => setTimeout(r, 60));
}

// ─── 5. Rewrite manifest ────────────────────────────────────────
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
 * Populated by:
 *   node scripts/generate-audio.mjs ${LANG_CODE}          (lesson content)
 *   node scripts/generate-landing-audio.mjs ${LANG_CODE}  (landing page content)
 *
 * When this map has an entry for the text being spoken, the app plays the
 * pre-generated MP3 instantly. Otherwise it falls through to Azure → browser TTS.
 */
export const AUDIO_MANIFEST: Record<string, string> = {
${body}
};
`;
writeFileSync(MANIFEST_PATH, manifestSource);

const seconds = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\n✓ Done in ${seconds}s`);
console.log(`  Language:               ${LANG_CODE}`);
console.log(`  Entries in manifest:    ${Object.keys(manifest).length} total (was ${Object.keys(existingManifest).length})`);
console.log(`  Generated this run:     ${generated}`);
console.log(`  Already on disk:        ${skipped}`);
if (failed) console.log(`  Missing (no key/error): ${failed}`);
if (charsThisRun) console.log(`  Characters used:        ${charsThisRun.toLocaleString()}`);
console.log(`  Manifest:               ${MANIFEST_PATH}`);
console.log(`  Audio dir:              ${AUDIO_DIR}/`);
console.log("\n  Restart 'npm run dev' to pick up changes.\n");

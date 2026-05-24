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
 *   1. Calls extractTargetStrings() from scripts/lib/extract-strings.mjs
 *      (the single source of truth for what counts as a speakable string —
 *      shared with audit-audio.mjs).
 *   2. Calls ElevenLabs Multilingual v2 for each missing string.
 *   3. Saves MP3s to public/audio/<code>/.
 *   4. Rewrites src/languages/<code>/audio-manifest.ts.
 *
 * Resumable: skips MP3s already on disk.
 * Rebuild-only mode: if no ELEVEN_API_KEY, rebuilds the manifest from disk.
 *
 * Setup: put ELEVEN_API_KEY in .env (and optionally ELEVEN_VOICE_ID).
 *
 * Verify coverage after running:
 *   node scripts/audit-audio.mjs <code>
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { extractTargetStrings } from "./lib/extract-strings.mjs";

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

const API_KEY  = process.env.ELEVEN_API_KEY;
const VOICE_ID = process.env.ELEVEN_VOICE_ID || "pNInz6obpgDQGcFmaJgB";
const MODEL_ID = process.env.ELEVEN_MODEL_ID || "eleven_multilingual_v2";

const MODULE_DIR    = path.join("src", "languages", LANG_CODE);
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

console.log(`→ Language module: ${LANG_CODE}`);
console.log(`  Source:   ${MODULE_DIR}/`);
console.log(`  Audio:    ${AUDIO_DIR}/`);
console.log(`  Manifest: ${MANIFEST_PATH}\n`);

// ─── 1. Extract via shared module ───────────────────────────────
console.log("→ Scanning module for target-language text…");
const { strings } = extractTargetStrings(MODULE_DIR);
const cleaned = [...strings].sort();
console.log(`  found ${cleaned.length} unique strings\n`);

// ─── 2. Generate or rebuild ─────────────────────────────────────
function hashOf(text) {
  return createHash("sha1").update(text, "utf8").digest("hex").slice(0, 12);
}

const manifest = {};
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
  if (!API_KEY) { failed++; continue; }

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

// ─── 3. Write manifest ──────────────────────────────────────────
const sortedEntries = Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b));
const body = sortedEntries.map(([text, hash]) => `  ${JSON.stringify(text)}: "${hash}",`).join("\n");

const manifestSource = `/**
 * AUTO-GENERATED FILE — do not edit by hand.
 *
 * Maps target-language text → content-hash filename in /public/audio/${LANG_CODE}/.
 *
 * Populated by:
 *   node scripts/generate-audio.mjs ${LANG_CODE}          (lesson content)
 *   node scripts/generate-landing-audio.mjs ${LANG_CODE}  (landing page content)
 *
 * Verified by:
 *   node scripts/audit-audio.mjs ${LANG_CODE}
 *
 * When this map has an entry for the text being spoken, the app plays the
 * pre-generated MP3 instantly. Otherwise it falls through to Azure (if
 * configured) → browser SpeechSynthesis.
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
console.log("\n  Verify with: node scripts/audit-audio.mjs " + LANG_CODE);
console.log("  Restart `npm run dev` to pick up the new manifest.\n");

#!/usr/bin/env node
/**
 * generate-landing-audio.mjs — pre-generate MP3s for landing-page
 * target-language strings.
 *
 * Usage:
 *   node scripts/generate-landing-audio.mjs <code>     # e.g. ro, es
 *   node scripts/generate-landing-audio.mjs            # defaults to "ro"
 *
 * Reads landing_tl_* values from src/languages/<code>/locales/landing.*.json,
 * expands "/" / "→" / "·" variants, and ships MP3s. Merges into the
 * existing audio-manifest.ts (does not replace).
 *
 * Verify: node scripts/audit-audio.mjs <code>
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { extractLandingStrings } from "./lib/extract-strings.mjs";

const LANG_CODE = (process.argv[2] || "ro").trim();
if (!/^[a-z][a-z0-9-]*$/.test(LANG_CODE)) {
  console.error(`✗ Bad language code: "${LANG_CODE}".`);
  process.exit(1);
}

if (existsSync(".env")) {
  const env = readFileSync(".env", "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const API_KEY  = process.env.ELEVEN_API_KEY;
const VOICE_ID = process.env.ELEVEN_VOICE_ID || "pNInz6obpgDQGcFmaJgB";
const MODEL_ID = process.env.ELEVEN_MODEL_ID || "eleven_multilingual_v2";

const MODULE_DIR    = path.join("src", "languages", LANG_CODE);
const LOCALES_DIR   = path.join(MODULE_DIR, "locales");
const AUDIO_DIR     = path.join("public", "audio", LANG_CODE);
const MANIFEST_PATH = path.join(MODULE_DIR, "audio-manifest.ts");

if (!existsSync(MODULE_DIR)) {
  console.error(`✗ No language module at ${MODULE_DIR}.`);
  process.exit(1);
}
mkdirSync(AUDIO_DIR, { recursive: true });

if (!API_KEY) console.warn("\n⚠  No ELEVEN_API_KEY — REBUILD-ONLY mode.\n");

console.log(`→ Language: ${LANG_CODE}`);
console.log(`  Locales:  ${LOCALES_DIR}/landing.*.json`);
console.log(`  Audio:    ${AUDIO_DIR}/`);
console.log(`  Manifest: ${MANIFEST_PATH} (merged)\n`);

// Extract
const tlStrings = extractLandingStrings(LOCALES_DIR);
const cleaned = [...tlStrings].sort();
console.log(`  Total unique landing strings: ${cleaned.length}\n`);
if (cleaned.length === 0) { console.log("  Nothing to generate.\n"); process.exit(0); }

// Hash + read existing manifest (merge)
const hashOf = (t) => createHash("sha1").update(t, "utf8").digest("hex").slice(0, 12);

const existingManifest = {};
if (existsSync(MANIFEST_PATH)) {
  const src = readFileSync(MANIFEST_PATH, "utf8");
  for (const m of src.matchAll(/^\s+"([^"]+)":\s+"([a-f0-9]{12})"/gm)) {
    existingManifest[m[1]] = m[2];
  }
}
console.log(`→ Existing manifest: ${Object.keys(existingManifest).length} entries\n`);

const manifest = { ...existingManifest };
let generated = 0, skipped = 0, failed = 0, charsThisRun = 0;

async function synthesize(text) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({
        text, model_id: MODEL_ID,
        voice_settings: { stability: 0.7, similarity_boost: 0.85, style: 0, use_speaker_boost: true },
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
    if (/401|403/.test(String(err))) { console.error("\n⚠  Auth error. Stopping."); break; }
    if (/429/.test(String(err))) { console.log("    (rate limited — sleeping 10s)"); await new Promise((r) => setTimeout(r, 10_000)); }
  }
  await new Promise((r) => setTimeout(r, 60));
}

const sortedEntries = Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b));
const body = sortedEntries.map(([t, h]) => `  ${JSON.stringify(t)}: "${h}",`).join("\n");
const manifestSource = `/**
 * AUTO-GENERATED FILE — do not edit by hand.
 * Maps target-language text → content-hash filename in /public/audio/${LANG_CODE}/.
 * Populated by generate-audio.mjs + generate-landing-audio.mjs.
 * Verify with: node scripts/audit-audio.mjs ${LANG_CODE}
 */
export const AUDIO_MANIFEST: Record<string, string> = {
${body}
};
`;
writeFileSync(MANIFEST_PATH, manifestSource);

const seconds = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\n✓ Done in ${seconds}s`);
console.log(`  Entries: ${Object.keys(manifest).length} total (was ${Object.keys(existingManifest).length})`);
console.log(`  Generated this run: ${generated}, on disk: ${skipped}, missing: ${failed}`);
if (charsThisRun) console.log(`  Characters used: ${charsThisRun.toLocaleString()}`);
console.log("\n  Verify: node scripts/audit-audio.mjs " + LANG_CODE + "\n");

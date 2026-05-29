#!/usr/bin/env node
/**
 * generate-landing-audio.mjs — pre-generate MP3s for landing-page
 * target-language strings, in parallel, with per-language voice config.
 *
 * Usage:
 *   node scripts/generate-landing-audio.mjs <code>     # e.g. ro, es
 *   node scripts/generate-landing-audio.mjs            # defaults to "ro"
 *
 * Reads landing_tl_* values from src/languages/<code>/locales/landing.*.json,
 * expands "/" / "→" / "·" variants, MERGES into existing audio-manifest.ts.
 * See generate-audio.mjs for full config docs.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { extractLandingStrings } from "./lib/extract-strings.mjs";
import { loadAudioConfig, loadPronunciationOverrides, generateInParallel } from "./lib/synth.mjs";

const LANG_CODE = (process.argv[2] || "").trim();
if (!/^[a-z][a-z0-9-]*$/.test(LANG_CODE)) {
  console.error(`✗ Usage: node scripts/generate-landing-audio.mjs <code>   (e.g. ro, es, fr)`);
  process.exit(1);
}

if (existsSync(".env")) {
  const env = readFileSync(".env", "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const API_KEY = process.env.ELEVEN_API_KEY;
const config  = loadAudioConfig(LANG_CODE);
const overrides = loadPronunciationOverrides(LANG_CODE);

const MODULE_DIR    = path.join("src", "languages", LANG_CODE);
const LOCALES_DIR   = path.join(MODULE_DIR, "locales");
const AUDIO_DIR     = path.join("public", "audio", LANG_CODE);
const MANIFEST_PATH = path.join(MODULE_DIR, "audio-manifest.ts");

if (!existsSync(MODULE_DIR)) {
  console.error(`✗ No language module at ${MODULE_DIR}.`);
  process.exit(1);
}
mkdirSync(AUDIO_DIR, { recursive: true });

console.log(`→ Language:  ${LANG_CODE}`);
console.log(`  Locales:   ${LOCALES_DIR}/landing.*.json`);
console.log(`  Audio:     ${AUDIO_DIR}/`);
console.log(`  Manifest:  ${MANIFEST_PATH} (merged)`);
console.log(`  Voice ID:  ${config.voiceId}`);
console.log(`  Bitrate:   ${config.bitrate}`);
console.log(`  Parallel:  ${config.concurrency} concurrent`);
console.log(`  Config:    ${config.configSource}`);
console.log(`  Overrides: ${Object.keys(overrides).length} pronunciation override(s)\n`);

if (!API_KEY) console.warn("⚠  No ELEVEN_API_KEY — REBUILD-ONLY mode.\n");

// Extract
const tlStrings = extractLandingStrings(LOCALES_DIR);
const cleaned = [...tlStrings].sort();
console.log(`  ${cleaned.length} unique landing strings\n`);
if (cleaned.length === 0) { console.log("  Nothing to generate.\n"); process.exit(0); }

// Read existing manifest (merge, not replace)
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
const tasks = [];
let skipped = 0;

for (const text of cleaned) {
  const hash = hashOf(text);
  const filepath = path.join(AUDIO_DIR, `${hash}.mp3`);
  if (existsSync(filepath)) {
    manifest[text] = hash;
    skipped++;
  } else if (API_KEY) {
    tasks.push({ text, hash, filepath });
  }
}

console.log(`  ${skipped} already on disk`);
console.log(`  ${tasks.length} to generate\n`);

const t0 = Date.now();
let generated = 0, failed = 0, charsThisRun = 0, aborted = false;

if (tasks.length > 0 && API_KEY) {
  console.log(`→ Generating with ${config.concurrency} workers…\n`);
  const result = await generateInParallel({
    tasks, config, apiKey: API_KEY, manifest, total: tasks.length, overrides,
  });
  ({ generated, failed, charsThisRun, aborted } = result);
} else if (!API_KEY) {
  failed = cleaned.length - skipped;
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
console.log(`\n${aborted ? "⚠  Aborted" : "✓ Done"} in ${seconds}s`);
console.log(`  Entries: ${Object.keys(manifest).length} total (was ${Object.keys(existingManifest).length})`);
console.log(`  Generated: ${generated}, on disk: ${skipped}, missing: ${failed}`);
if (charsThisRun) console.log(`  Characters: ${charsThisRun.toLocaleString()}`);
console.log(`\n  Verify: node scripts/audit-audio.mjs ${LANG_CODE}\n`);

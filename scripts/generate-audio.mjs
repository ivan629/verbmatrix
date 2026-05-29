#!/usr/bin/env node
/**
 * generate-audio.mjs — pre-generate native-quality MP3s for ONE language
 * module at a time, in parallel, with per-language voice configuration.
 *
 * Usage:
 *   node scripts/generate-audio.mjs <code>     # e.g. ro, es, fr
 *   node scripts/generate-audio.mjs            # defaults to "ro"
 *
 * Per-language config (optional):
 *   Create src/languages/<code>/audio-config.json with:
 *     {
 *       "voiceId":       "b4bnZ9y3ZRH0myLzE2B5",   // ElevenLabs voice ID
 *       "modelId":       "eleven_turbo_v2_5",        // enforces languageCode
 *       "bitrate":       "mp3_44100_64",           // 64kbps is fine for speech
 *       "voiceSettings": { ... },
 *       "concurrency":   5                          // parallel requests
 *     }
 *
 *   Env vars override file values:
 *     ELEVEN_VOICE_ID, ELEVEN_MODEL_ID, ELEVEN_BITRATE, ELEVEN_CONCURRENCY
 *
 * Speedup: defaults to 5 concurrent requests. Sequential was ~40min for
 *   1,610 RO strings; at concurrency=5 it's ~8min; at =10 it's ~4min.
 *   Don't exceed your ElevenLabs plan's concurrent-request limit.
 *
 * Resumable: skips MP3s already on disk.
 * Rebuild-only mode: if no ELEVEN_API_KEY, rebuilds the manifest from disk.
 *
 * Verify with: node scripts/audit-audio.mjs <code>
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { extractTargetStrings, extractExtraStrings } from "./lib/extract-strings.mjs";
import { loadAudioConfig, generateInParallel } from "./lib/synth.mjs";

// ─── 0. Args + .env ────────────────────────────────────────────────────────
const LANG_CODE = (process.argv[2] || "ro").trim();
const FORCE = process.argv.includes("--force") || process.argv.includes("-f");
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
const config   = loadAudioConfig(LANG_CODE);

const MODULE_DIR    = path.join("src", "languages", LANG_CODE);
const AUDIO_DIR     = path.join("public", "audio", LANG_CODE);
const MANIFEST_PATH = path.join(MODULE_DIR, "audio-manifest.ts");

if (!existsSync(MODULE_DIR)) {
  console.error(`✗ No language module at ${MODULE_DIR}.`);
  process.exit(1);
}
mkdirSync(AUDIO_DIR, { recursive: true });

console.log(`→ Language module: ${LANG_CODE}`);
console.log(`  Source:    ${MODULE_DIR}/`);
console.log(`  Audio:     ${AUDIO_DIR}/`);
console.log(`  Manifest:  ${MANIFEST_PATH}`);
console.log(`  Voice ID:  ${config.voiceId}`);
console.log(`  Model:     ${config.modelId}`);
console.log(`  Language:  ${config.languageCode ?? "(auto-detect)"}` +
  `${config.languageCode && !["eleven_turbo_v2_5","eleven_flash_v2_5"].includes(config.modelId) ? "  ⚠ NOT ENFORCED by this model" : "  (enforced)"}`);
console.log(`  Normalize: ${config.applyTextNormalization ?? "off"}`);
console.log(`  Bitrate:   ${config.bitrate}`);
console.log(`  Parallel:  ${config.concurrency} concurrent`);
console.log(`  Overrides: ${config.overrideCount} (${config.overrideSource})`);
console.log(`  Config:    ${config.configSource}\n`);

if (!API_KEY) {
  console.warn("⚠  No ELEVEN_API_KEY — running in REBUILD-ONLY mode.\n");
}

// ─── 1. Extract ────────────────────────────────────────────────────────────
console.log("→ Scanning module for target-language text…");
const { strings } = extractTargetStrings(MODULE_DIR);
console.log(`  static extraction:  ${strings.size} strings`);

const extras = await extractExtraStrings(MODULE_DIR);
if (extras.length > 0) {
  for (const s of extras) strings.add(s);
  console.log(`  dynamic (audio-extras.mjs):  +${extras.length} strings`);
}
const cleaned = [...strings].sort();
console.log(`  total:  ${cleaned.length} unique strings\n`);

// ─── 2. Plan: which strings need generating, which are already on disk? ────
const hashOf = (text) => createHash("sha1").update(text, "utf8").digest("hex").slice(0, 12);
const manifest = {};
const tasks = [];
let skipped = 0;

for (const text of cleaned) {
  const hash = hashOf(text);
  const filepath = path.join(AUDIO_DIR, `${hash}.mp3`);
  if (existsSync(filepath) && !FORCE) {
    manifest[text] = hash;
    skipped++;
  } else if (API_KEY) {
    tasks.push({ text, hash, filepath });
  }
}

if (FORCE) {
  console.log("  --force: ignoring existing MP3s; everything will be re-synthesized.");
  console.log("  (Use this after changing voice, model, languageCode, or overrides.)");
}

console.log(`  ${skipped} already on disk`);
console.log(`  ${tasks.length} to generate\n`);

// ─── 3. Generate in parallel ───────────────────────────────────────────────
const t0 = Date.now();
let generated = 0, failed = 0, charsThisRun = 0, aborted = false;

if (tasks.length > 0 && API_KEY) {
  console.log(`→ Generating with ${config.concurrency} workers…\n`);
  const result = await generateInParallel({
    tasks,
    config,
    apiKey: API_KEY,
    manifest,
    total: tasks.length,
  });
  generated = result.generated;
  failed = result.failed;
  charsThisRun = result.charsThisRun;
  aborted = result.aborted;
} else if (!API_KEY) {
  failed = cleaned.length - skipped;
  console.log("→ Skipping synthesis — rebuilding manifest only.\n");
} else {
  console.log("→ Nothing to do — all MP3s already on disk.\n");
}

// ─── 4. Write manifest ─────────────────────────────────────────────────────
const sortedEntries = Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b));
const body = sortedEntries
  .map(([text, hash]) => `  ${JSON.stringify(text)}: "${hash}",`)
  .join("\n");

const manifestSource = `/**
 * AUTO-GENERATED FILE — do not edit by hand.
 *
 * Maps target-language text → content-hash filename in /public/audio/${LANG_CODE}/.
 *
 * Populated by:
 *   node scripts/generate-audio.mjs ${LANG_CODE}          (lesson content)
 *   node scripts/generate-landing-audio.mjs ${LANG_CODE}  (landing content)
 * Verified by:
 *   node scripts/audit-audio.mjs ${LANG_CODE}
 *
 * When this map has an entry for the text being spoken, the app plays the
 * pre-generated MP3 instantly and offline. Otherwise it falls through to
 * Azure → browser SpeechSynthesis at runtime.
 */
export const AUDIO_MANIFEST: Record<string, string> = {
${body}
};
`;
writeFileSync(MANIFEST_PATH, manifestSource);

// ─── 5. Report ─────────────────────────────────────────────────────────────
const seconds = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`\n${aborted ? "⚠  Aborted" : "✓ Done"} in ${seconds}s`);
console.log(`  Language: ${LANG_CODE}`);
console.log(`  In manifest: ${Object.keys(manifest).length} / ${cleaned.length}`);
console.log(`  Generated this run: ${generated}`);
console.log(`  Already on disk: ${skipped}`);
if (failed) console.log(`  Missing: ${failed} ${API_KEY ? "(failed)" : "(no API key)"}`);
if (charsThisRun) console.log(`  Characters generated: ${charsThisRun.toLocaleString()}`);
console.log(`\n  Verify: node scripts/audit-audio.mjs ${LANG_CODE}`);
console.log("  Restart `npm run dev` to pick up the new manifest.\n");

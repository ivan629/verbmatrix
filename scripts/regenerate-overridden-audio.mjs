#!/usr/bin/env node
/**
 * Regenerate audio files affected by pronunciation overrides.
 *
 * ─── What & why ──────────────────────────────────────────────────────
 * When you add a new word to `pronunciation-overrides.json`, the existing
 * MP3 for that word is now stale — it was synthesized BEFORE the override
 * applied. This script:
 *
 *   1. Loads the per-language manifest (text → hash map).
 *   2. Loads the pronunciation overrides.
 *   3. For each manifest entry: checks if applying overrides would
 *      transform the text. If yes → DELETES the MP3 + removes the entry.
 *   4. Saves the cleaned manifest.
 *   5. Tells you to run `generate-audio.mjs` to refill the gaps.
 *
 * It does NOT delete files that aren't affected — saves API cost vs
 * a blanket "delete everything" approach.
 *
 * ─── Usage ───────────────────────────────────────────────────────────
 *   # Default — dry-run (just reports what WOULD be deleted)
 *   node scripts/regenerate-overridden-audio.mjs ro
 *
 *   # Apply: actually delete the affected files + manifest entries
 *   node scripts/regenerate-overridden-audio.mjs ro --apply
 *
 *   # Optional: include landing audio in scope
 *   node scripts/regenerate-overridden-audio.mjs ro --apply --landing
 *
 * After running with --apply, run:
 *   node scripts/generate-audio.mjs            # for lesson/extras
 *   node scripts/generate-landing-audio.mjs    # for landing locales
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import path from "node:path";
import { loadPronunciationOverrides, applyOverrides } from "./lib/overrides.mjs";

const args = process.argv.slice(2);
const LANG_CODE = args.find((a) => !a.startsWith("--")) || "ro";
const APPLY     = args.includes("--apply");

const AUDIO_DIR    = path.join("public", "audio", LANG_CODE);
const MANIFEST_PATH = path.join("src", "languages", LANG_CODE, "audio-manifest.ts");

console.log(`→ Regenerate-affected audit for: ${LANG_CODE}`);
console.log(`  Audio dir:  ${AUDIO_DIR}/`);
console.log(`  Manifest:   ${MANIFEST_PATH}`);
console.log(`  Mode:       ${APPLY ? "APPLY (deletes files + manifest entries)" : "DRY-RUN (no changes — pass --apply to commit)"}\n`);

// ─── Load overrides ────────────────────────────────────────────────────
const { words: overrides, configSource } = loadPronunciationOverrides(LANG_CODE);
const overrideCount = Object.keys(overrides).length;
console.log(`Loaded ${overrideCount} overrides from ${configSource}`);
if (overrideCount === 0) {
  console.log("No overrides defined — nothing to do.");
  process.exit(0);
}

// ─── Load manifest ────────────────────────────────────────────────────
if (!existsSync(MANIFEST_PATH)) {
  console.error(`✗ Manifest not found: ${MANIFEST_PATH}`);
  process.exit(1);
}
const manifestRaw = readFileSync(MANIFEST_PATH, "utf8");
// Manifest is a generated TS file. The codebase uses:
//   export const AUDIO_MANIFEST: Record<string, string> = { … };
// (also accept `export default { … }` for forward-compat).
const manifestMatch =
  manifestRaw.match(/export\s+const\s+AUDIO_MANIFEST[^=]*=\s*({[\s\S]*?});/) ||
  manifestRaw.match(/export\s+default\s+({[\s\S]*?})(?:\s+as\s+const)?\s*;?\s*$/);
if (!manifestMatch) {
  console.error("✗ Could not parse manifest. Expected one of:");
  console.error("  export const AUDIO_MANIFEST: Record<string, string> = { … };");
  console.error("  export default { … } as const;");
  process.exit(1);
}
// Use Function constructor to safely-ish parse the object literal.
let manifest;
try {
  manifest = new Function(`return ${manifestMatch[1]}`)();
} catch (err) {
  console.error("✗ Manifest parse error:", err.message);
  process.exit(1);
}

const totalBefore = Object.keys(manifest).length;
console.log(`Manifest has ${totalBefore} entries\n`);

// ─── Identify affected entries ─────────────────────────────────────────
const affected = [];
for (const [text, hash] of Object.entries(manifest)) {
  const transformed = applyOverrides(text, overrides);
  if (transformed !== text) {
    affected.push({ text, hash, transformed });
  }
}

console.log(`Affected entries: ${affected.length} of ${totalBefore}`);
if (affected.length === 0) {
  console.log("No regeneration needed.");
  process.exit(0);
}

// Show a preview
const preview = affected.slice(0, 8);
for (const { text, transformed, hash } of preview) {
  console.log(`  ${hash}.mp3`);
  console.log(`    Before: ${JSON.stringify(text)}`);
  console.log(`    After:  ${JSON.stringify(transformed)}`);
}
if (affected.length > preview.length) {
  console.log(`  … and ${affected.length - preview.length} more`);
}

// ─── Apply (or skip in dry-run) ────────────────────────────────────────
if (!APPLY) {
  console.log(`\nDRY-RUN. Re-run with --apply to:`);
  console.log(`  • delete ${affected.length} MP3 file(s) from ${AUDIO_DIR}/`);
  console.log(`  • remove ${affected.length} entries from manifest`);
  console.log(`  • then run generate-audio.mjs to recreate with correct pronunciation`);
  process.exit(0);
}

let deletedFiles = 0;
let missingFiles = 0;
for (const { hash } of affected) {
  const filepath = path.join(AUDIO_DIR, `${hash}.mp3`);
  if (existsSync(filepath)) {
    unlinkSync(filepath);
    deletedFiles++;
  } else {
    missingFiles++;
  }
  delete manifest[affected.text];
}
// Re-build manifest object cleanly (preserve insertion order, drop affected)
const cleanedManifest = {};
const affectedTexts = new Set(affected.map((a) => a.text));
for (const [text, hash] of Object.entries(manifest)) {
  if (!affectedTexts.has(text)) cleanedManifest[text] = hash;
}

const manifestOut =
`/**
 * AUTO-GENERATED FILE — do not edit by hand.
 *
 * Maps target-language text → content-hash filename in /public/audio/${LANG_CODE}/.
 *
 * Populated by:
 *   node scripts/generate-audio.mjs ${LANG_CODE}          (lesson content)
 *   node scripts/generate-landing-audio.mjs ${LANG_CODE}  (landing content)
 * Pruned by:
 *   node scripts/regenerate-overridden-audio.mjs ${LANG_CODE} --apply
 */
export const AUDIO_MANIFEST: Record<string, string> = {
${Object.entries(cleanedManifest)
  .map(([t, h]) => `  ${JSON.stringify(t)}: "${h}",`)
  .join("\n")}
};
`;
writeFileSync(MANIFEST_PATH, manifestOut);

console.log(`\n✓ Deleted ${deletedFiles} MP3 file(s), ${missingFiles} already missing`);
console.log(`✓ Manifest now has ${Object.keys(cleanedManifest).length} entries (was ${totalBefore})`);
console.log(`\nNext: regenerate the gaps:`);
console.log(`  node scripts/generate-audio.mjs`);
console.log(`  node scripts/generate-landing-audio.mjs   # if landing words were affected`);

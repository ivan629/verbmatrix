#!/usr/bin/env node
/**
 * audit-audio.mjs — verify every speakable string has a working MP3.
 *
 * Usage:
 *   node scripts/audit-audio.mjs <code>          # exit 0 if clean, 1 if drift
 *   node scripts/audit-audio.mjs <code> --fix    # delete orphan MP3s
 *   node scripts/audit-audio.mjs                 # defaults to "ro"
 *
 * Reports four kinds of drift:
 *
 *   1. MISSING AUDIO  — a string appears in code but has no MP3.
 *                       Users will hear runtime TTS (lower quality).
 *                       Fix: re-run generate-audio scripts.
 *
 *   2. ORPHAN ENTRIES — a manifest entry references a string no longer
 *                       in the source code. Wasted bytes in the bundle.
 *                       Fix: re-run generate-audio scripts (auto-prunes).
 *
 *   3. DEAD MP3s      — an MP3 on disk isn't referenced by the manifest.
 *                       Wasted disk + git bloat.
 *                       Fix: --fix flag, or re-run generators.
 *
 *   4. BROKEN MP3s    — a manifest entry's MP3 file is missing or empty
 *                       or doesn't look like an MP3. Worst — silent failure.
 *
 * Suitable for CI: exits non-zero on any failure category.
 */

import { existsSync, readFileSync, readdirSync, statSync, unlinkSync } from "node:fs";
import path from "node:path";
import { extractTargetStrings, extractExtraStrings, extractLandingStrings, loadModuleHooks } from "./lib/extract-strings.mjs";
import { loadPronunciationOverrides } from "./lib/synth.mjs";

const LANG_CODE = (process.argv[2] || "").trim();
if (!/^[a-z][a-z0-9-]*$/.test(LANG_CODE)) {
  console.error(`✗ Usage: node scripts/audit-audio.mjs <code> [--fix]   (e.g. ro, es, fr)`);
  process.exit(2);
}
const FIX = process.argv.includes("--fix");

const MODULE_DIR    = path.join("src", "languages", LANG_CODE);
const LOCALES_DIR   = path.join(MODULE_DIR, "locales");
const AUDIO_DIR     = path.join("public", "audio", LANG_CODE);
const MANIFEST_PATH = path.join(MODULE_DIR, "audio-manifest.ts");

if (!existsSync(MODULE_DIR)) {
  console.error(`✗ No language module at ${MODULE_DIR}.`);
  process.exit(2);
}

// ── ANSI helpers (skip if not a TTY) ──────────────────────────────────────
const useColor = process.stdout.isTTY;
const c = {
  red:    (s) => useColor ? `\x1b[31m${s}\x1b[0m` : s,
  green:  (s) => useColor ? `\x1b[32m${s}\x1b[0m` : s,
  yellow: (s) => useColor ? `\x1b[33m${s}\x1b[0m` : s,
  blue:   (s) => useColor ? `\x1b[34m${s}\x1b[0m` : s,
  dim:    (s) => useColor ? `\x1b[2m${s}\x1b[0m` : s,
  bold:   (s) => useColor ? `\x1b[1m${s}\x1b[0m` : s,
};

console.log(c.bold(`\nAudio coverage audit — ${LANG_CODE}\n`));

// ── 1. Extract expected strings from source ──────────────────────────────
const hooks = await loadModuleHooks(MODULE_DIR);
const { strings: lessonStrings, sourceMap } = extractTargetStrings(MODULE_DIR, hooks.looksTargetLanguage);
const extraStrings = await extractExtraStrings(MODULE_DIR);
for (const s of extraStrings) lessonStrings.add(s);

let landingStrings = new Set();
try {
  landingStrings = extractLandingStrings(LOCALES_DIR);
} catch {
  /* no landing files — fine */
}
const expected = new Set([...lessonStrings, ...landingStrings]);

console.log(`  Strings expected from source:  ${c.bold(expected.size)}`);
console.log(`    from lesson code:            ${lessonStrings.size - extraStrings.length}`);
if (extraStrings.length > 0) {
  console.log(`    from audio-extras.mjs:       ${extraStrings.length}`);
}
console.log(`    from landing locales:        ${landingStrings.size}`);

// ── 2. Read manifest ──────────────────────────────────────────────────────
const manifest = {};
if (existsSync(MANIFEST_PATH)) {
  const src = readFileSync(MANIFEST_PATH, "utf8");
  for (const m of src.matchAll(/^\s+"([^"]+)":\s+"([a-f0-9]{12})"/gm)) {
    manifest[m[1]] = m[2];
  }
}
console.log(`  Entries in manifest:           ${c.bold(Object.keys(manifest).length)}`);

// ── 3. Read MP3 files on disk ─────────────────────────────────────────────
const onDisk = new Set();
if (existsSync(AUDIO_DIR)) {
  for (const f of readdirSync(AUDIO_DIR)) {
    if (f.endsWith(".mp3")) onDisk.add(f.slice(0, -4));
  }
}
console.log(`  MP3 files on disk:             ${c.bold(onDisk.size)}\n`);

// ── 4. Cross-reference ────────────────────────────────────────────────────
const missing      = [];   // in source, not in manifest
const orphan       = [];   // in manifest, not in source
const dead         = [];   // on disk, not in manifest
const broken       = [];   // in manifest, MP3 missing or empty/invalid

for (const text of expected) {
  if (!manifest[text]) missing.push(text);
}

const referencedHashes = new Set(Object.values(manifest));

for (const [text, hash] of Object.entries(manifest)) {
  if (!expected.has(text)) orphan.push({ text, hash });

  const filepath = path.join(AUDIO_DIR, `${hash}.mp3`);
  if (!existsSync(filepath)) {
    broken.push({ text, hash, reason: "file missing" });
    continue;
  }
  const st = statSync(filepath);
  if (st.size < 200) {
    broken.push({ text, hash, reason: `file too small (${st.size} bytes)` });
    continue;
  }
  // Validate MP3 header: ID3 tag or 0xFF 0xFB/0xF3/0xF2 sync word
  const buf = readFileSync(filepath).subarray(0, 4);
  const isID3 = buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33;
  const isSync = buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0;
  if (!isID3 && !isSync) {
    broken.push({ text, hash, reason: "not a valid MP3 (header bytes wrong)" });
  }
}

for (const hash of onDisk) {
  if (!referencedHashes.has(hash)) dead.push(hash);
}

// ── 5. Report ─────────────────────────────────────────────────────────────
const totalExpected = expected.size;
const covered = totalExpected - missing.length;
const pct = totalExpected ? ((covered / totalExpected) * 100).toFixed(1) : "100";

function summary(label, count, color, hint) {
  const mark = count === 0 ? c.green("✓") : c[color]("✗");
  const num = c.bold(String(count).padStart(4));
  console.log(`  ${mark}  ${label.padEnd(34)} ${num}${hint ? c.dim("  " + hint) : ""}`);
}

summary("Missing audio (source → manifest)",   missing.length, "red");
summary("Orphan entries (manifest → source)",  orphan.length,  "yellow");
summary("Dead MP3 files (disk → manifest)",    dead.length,    "yellow");
summary("Broken MP3 files (file/format bad)",  broken.length,  "red");

// ── Pronunciation overrides sanity: keys that match no expected string ────
const overrides = loadPronunciationOverrides(LANG_CODE);
const unusedOverrides = Object.keys(overrides).filter((k) => !expected.has(k));
if (Object.keys(overrides).length > 0) {
  summary(
    "Unused pronunciation overrides",
    unusedOverrides.length,
    "yellow",
    `${Object.keys(overrides).length} total`
  );
}

console.log();
console.log(`  Coverage: ${c.bold(pct + "%")} (${covered}/${totalExpected})\n`);

// ── 6. Detailed lists (capped) ────────────────────────────────────────────
function showList(title, items, formatter, max = 25) {
  if (items.length === 0) return;
  console.log(c.bold(`  ${title} (${items.length}):`));
  for (const item of items.slice(0, max)) {
    console.log(`    ${formatter(item)}`);
  }
  if (items.length > max) {
    console.log(c.dim(`    … and ${items.length - max} more`));
  }
  console.log();
}

showList(
  c.red("✗ MISSING AUDIO"),
  missing,
  (text) => {
    const sources = sourceMap.get(text);
    const src = sources && sources.size > 0
      ? c.dim(` — ${[...sources][0].replace(/^src\/languages\/[^/]+\//, "")}`)
      : "";
    return `${JSON.stringify(text)}${src}`;
  }
);

showList(
  c.yellow("✗ ORPHAN ENTRIES"),
  orphan,
  ({ text }) => JSON.stringify(text)
);

showList(
  c.yellow("✗ DEAD MP3 FILES"),
  dead,
  (hash) => `${hash}.mp3`
);

showList(
  c.red("✗ BROKEN MP3s"),
  broken,
  ({ text, hash, reason }) => `${hash}.mp3 — ${reason} (${JSON.stringify(text)})`
);

showList(
  c.yellow("✗ UNUSED OVERRIDES (key matches no current string)"),
  unusedOverrides,
  (key) => JSON.stringify(key)
);

// ── 7. Fix mode: delete orphan + dead files ──────────────────────────────
if (FIX && (orphan.length > 0 || dead.length > 0)) {
  console.log(c.bold("--fix: removing orphan and dead files"));
  let deleted = 0;
  for (const { hash } of orphan) {
    const fp = path.join(AUDIO_DIR, `${hash}.mp3`);
    if (existsSync(fp)) { unlinkSync(fp); deleted++; }
  }
  for (const hash of dead) {
    const fp = path.join(AUDIO_DIR, `${hash}.mp3`);
    if (existsSync(fp)) { unlinkSync(fp); deleted++; }
  }
  console.log(`  deleted ${deleted} MP3 files`);
  console.log(c.dim(`  rerun generate-audio.mjs to rebuild the manifest`));
}

// ── 8. Exit codes ─────────────────────────────────────────────────────────
const failures = missing.length + broken.length;
const warnings = orphan.length + dead.length;

if (failures > 0) {
  console.log(c.red(c.bold(`\n✗ AUDIT FAILED — ${failures} hard failures`)));
  console.log(c.dim(`  Fix: node scripts/generate-audio.mjs ${LANG_CODE}`));
  console.log(c.dim(`       node scripts/generate-landing-audio.mjs ${LANG_CODE}\n`));
  process.exit(1);
} else if (warnings > 0) {
  console.log(c.yellow(`\n⚠ AUDIT PASSED with ${warnings} warnings (orphans/dead files)`));
  console.log(c.dim(`  Clean up: node scripts/audit-audio.mjs ${LANG_CODE} --fix\n`));
  process.exit(0);
} else {
  console.log(c.green(c.bold(`\n✓ AUDIT PASSED — 100% coverage, no drift\n`)));
  process.exit(0);
}

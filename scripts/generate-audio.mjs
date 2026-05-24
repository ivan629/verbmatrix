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
 *      (data files, lesson .tsx, DataTable rows, SoundGrid symbols).
 *   2. Calls ElevenLabs Multilingual v2 for each missing string.
 *   3. Saves MP3s to public/audio/<code>/.
 *   4. Rewrites src/languages/<code>/audio-manifest.ts.
 *
 * Extraction strategy:
 *   • <RO text="..." />                              — every speakable element
 *   • ro: "..."  and  ro: ["...", ...]               — data fields
 *   • word / exampleWord / infinitive / euForm /
 *     elForm / participle / text / symbol / answer   — typed data fields
 *   • DataTable rows={[ ["a","b"] , ... ]}           — Romanian-looking cells
 *   • Multi-form cells split on " / " and " → "      — each variant separately
 *     (matches the SpeakableCell runtime behavior in ui.tsx)
 *
 * Resumable on two levels:
 *   - If an MP3 for a given string already exists on disk, the API call
 *     is skipped and the string is just recorded in the manifest.
 *   - With no API key, runs in REBUILD-ONLY mode — manifest is rebuilt
 *     from MP3s already on disk.
 *
 * Setup: put ELEVEN_API_KEY in .env (and optionally ELEVEN_VOICE_ID).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

// ─── 0. Parse args + load .env ──────────────────────────────────
const LANG_CODE = (process.argv[2] || "ro").trim();
if (!/^[a-z][a-z0-9-]*$/.test(LANG_CODE)) {
  console.error(`✗ Bad language code: "${LANG_CODE}". Use lowercase letters/digits/hyphens.`);
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

/**
 * Voice selection — set ELEVEN_VOICE_ID in .env to your chosen voice.
 *
 * For Romanian, pick a NATIVE Romanian voice from the ElevenLabs Voice
 * Library. Defaults like Rachel (21m00Tcm4TlvDq8ikWAM, English) and Adam
 * (pNInz6obpgDQGcFmaJgB, English) will produce English-accented Romanian
 * even on the multilingual model — wrong pronunciation, trains bad habits.
 *
 * To grab a voice ID:
 *   ElevenLabs → Voice Library → filter Language=Romanian
 *   → open a voice → click "⋯" → "Copy voice ID"
 *
 * Top picks for a learning app (clarity > drama):
 *
 *   ▸ Mihai — Warm, Chill Narrator        Narration | mid-pitch | 2y retention
 *     Best clarity for diacritics (ț/ș/ă/â/î). Calm, conversational.
 *
 *   ▸ Cristi Romana — Deep and Engaging   Educational | deep | 2y retention
 *     Only "Educational"-tagged Romanian voice. Deep voice = slightly
 *     muddier ț/ș but excellent overall.
 *
 *   ▸ Jora Slobod — Calm, Deep            Narration | deep | 160K users | 2y
 *     The most-used Romanian voice on the platform. Safe default. Deep.
 *
 * For dialogues (speaker A vs speaker B), set ELEVEN_VOICE_ID_SECONDARY
 * to a different voice so learners hear two distinct speakers. Recommended:
 *   ▸ Eva — Friendly & calm female-RO     Description: "warm, clear, natural"
 */
const VOICE_ID = process.env.ELEVEN_VOICE_ID;
const VOICE_ID_SECONDARY = process.env.ELEVEN_VOICE_ID_SECONDARY || null;
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
  console.warn("\n⚠  No ELEVEN_API_KEY in .env — running in REBUILD-ONLY mode.\n");
  console.warn("   The manifest will be rebuilt from MP3s already on disk;");
  console.warn("   no new audio will be generated.\n");
}

if (API_KEY && !VOICE_ID) {
  console.error("\n✗ ELEVEN_VOICE_ID not set in .env.\n");
  console.error("   Pick a native Romanian voice from the ElevenLabs Voice Library");
  console.error("   (filter Language = Romanian, prefer Narration/Educational tags),");
  console.error("   click ⋯ → Copy voice ID, then add to .env:");
  console.error("     ELEVEN_VOICE_ID=...");
  console.error("     ELEVEN_VOICE_ID_SECONDARY=...   # optional, for dialogues\n");
  process.exit(1);
}

console.log(`→ Language module: ${LANG_CODE}`);
console.log(`  Source:   ${MODULE_DIR}/`);
console.log(`  Audio:    ${AUDIO_DIR}/`);
console.log(`  Manifest: ${MANIFEST_PATH}\n`);

// ─── 1. Walk source files ───────────────────────────────────────
function walk(dir, exts, found = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    if (name === "locales") continue;             // i18n JSON — interface text
    if (name === "audio-manifest.ts") continue;   // the manifest itself
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, exts, found);
    else if (exts.some((e) => name.endsWith(e))) found.push(full);
  }
  return found;
}

// ─── 2. Romanian-detection heuristic ────────────────────────────
// Used to filter strings out of DataTable rows, which can mix English
// column-0 labels (e.g. "Group III", "Masculine") with the actual
// Romanian conjugated forms in columns 1+.
const RO_DIACRITICS = /[ăâîșțĂÂÎȘȚ]/;

function looksRomanian(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  // Definitive — Romanian-specific diacritics
  if (RO_DIACRITICS.test(trimmed)) return true;
  // Infinitive: "a face", "a vorbi", "a se gândi"
  if (/^a\s+(se\s+)?[a-z]{2,}/i.test(trimmed)) return true;
  // Future-auxiliary + verb: "voi face", "vei merge"
  if (/^(voi|vei|va|vom|veți|vor)\s+[a-zăâîșț]/i.test(trimmed)) return true;
  // Past-auxiliary + participle: "am vorbit"
  if (/^(am|ai|au)\s+[a-zăâîșț]+(at|it|ut|ât|s)\b/i.test(trimmed)) return true;
  // Pronoun + verb: "eu vorbesc", "tu mergi"
  if (/^(eu|tu|el|ea|noi|voi|ei|ele)\s+[a-zăâîșț]/i.test(trimmed)) return true;
  // Subjunctive marker
  if (/\bsă\s+[a-zăâîșț]/i.test(trimmed)) return true;
  // Reflexive clitic + verb: "mă uit", "se gândește"
  if (/^(mă|te|se|ne|vă|îmi|îți|îi|le)\s+[a-zăâîșț]/i.test(trimmed)) return true;
  // Imperative endings (single-word commands like "Vino!", "Stai!")
  if (/^[A-ZĂÂÎȘȚ][a-zăâîșț]+[!.]?$/.test(trimmed) && /(ă|i|e|ești|iți|ați)!?$/.test(trimmed.replace(/[!.]$/, ""))) {
    return true;
  }
  return false;
}

// ─── 3. Variant expansion ───────────────────────────────────────
// SpeakableCell in ui.tsx renders each "/" and "→" variant as its own
// clickable <RO>. Mirror that here so the manifest covers each one.
// Also splits on " · " (used as in-cell paragraph separator).
function expandVariants(text) {
  const out = new Set();
  out.add(text.trim());
  for (const seg of text.split(/\s*·\s*/)) {
    out.add(seg.trim());
    for (const part of seg.split(/\s*→\s*/)) {
      out.add(part.trim());
      for (const variant of part.split(/\s*\/\s*/)) {
        const v = variant.trim();
        // Skip pure morphology markers like "-at", "-ut / -s"
        if (v && !/^-/.test(v)) out.add(v);
      }
    }
  }
  return [...out].filter((s) => s.length > 0);
}

// ─── 4. DataTable parser (uses speakableCols to know which cells play) ──
//
// The previous approach guessed at Romanian-vs-English from cell content.
// Lesson tables now declare `speakableCols={[1, 2, 3]}` to mark exactly
// which columns become clickable <RO> chips at runtime. Trust that
// declaration — it's authoritative.
//
// For tables without speakableCols, fall back to the Romanian heuristic
// (covers older patterns / future tables that forget the prop).

function findDataTableBlocks(src) {
  // Each <DataTable .../> is always self-closing in this codebase.
  const blocks = [];
  let idx = 0;
  while (true) {
    const start = src.indexOf("<DataTable", idx);
    if (start === -1) break;
    let i = start;
    let inString = null;  // tracks if we're inside a quoted string
    let braceDepth = 0;
    while (i < src.length) {
      const c = src[i];
      if (inString) {
        if (c === inString && src[i - 1] !== "\\") inString = null;
      } else if (c === '"' || c === "'") {
        inString = c;
      } else if (c === "{") braceDepth++;
      else if (c === "}") braceDepth--;
      else if (c === "/" && src[i + 1] === ">" && braceDepth === 0) {
        blocks.push(src.substring(start, i + 2));
        idx = i + 2;
        break;
      }
      i++;
    }
    if (i >= src.length) break;
  }
  return blocks;
}

function extractRowsValue(blockSrc) {
  // Returns everything inside the rows={ ... } prop, or null if absent.
  const marker = "rows={";
  const idx = blockSrc.indexOf(marker);
  if (idx === -1) return null;
  let i = idx + marker.length;
  let depth = 1;
  while (i < blockSrc.length && depth > 0) {
    if (blockSrc[i] === "{") depth++;
    else if (blockSrc[i] === "}") depth--;
    i++;
  }
  if (depth !== 0) return null;
  return blockSrc.substring(idx + marker.length, i - 1);
}

function parseRowsArray(rowsContent) {
  // The outer `[ ... ]` brackets are included in rowsContent, so each row
  // is an inner array at depth=2 (depth=1 means "inside the outer array").
  const rows = [];
  let depth = 0;
  let rowStart = -1;
  for (let i = 0; i < rowsContent.length; i++) {
    const c = rowsContent[i];
    if (c === "[") {
      depth++;
      if (depth === 2) rowStart = i + 1;
    } else if (c === "]") {
      if (depth === 2 && rowStart !== -1) {
        rows.push(rowsContent.substring(rowStart, i));
        rowStart = -1;
      }
      depth--;
    }
  }
  return rows.map((rowSrc) => {
    // Cells in order. Strings come out as strings; JSX/expressions as null
    // placeholders so column indices still line up with speakableCols.
    const cells = [];
    let pos = 0;
    let cellStart = 0;
    let inString = null;
    let curlyDepth = 0;
    for (; pos < rowSrc.length; pos++) {
      const c = rowSrc[pos];
      if (inString) {
        if (c === inString && rowSrc[pos - 1] !== "\\") {
          cells.push(rowSrc.substring(cellStart, pos + 1));
          inString = null;
          cellStart = pos + 1;
        }
      } else if (c === '"' || c === "'") {
        if (curlyDepth === 0) {
          inString = c;
          cellStart = pos;
        }
      } else if (c === "{") curlyDepth++;
      else if (c === "}") curlyDepth--;
    }
    return cells.map((cell) => {
      const m = cell.match(/^["'](.*)["']$/s);
      return m ? m[1] : null;
    });
  });
}

function extractSpeakableCols(blockSrc) {
  const m = blockSrc.match(/speakableCols\s*=\s*\{\s*\[([^\]]*)\]\s*\}/);
  if (!m) return null;
  return m[1]
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}

// ─── 5. Extract strings from one source file ────────────────────
// Returns a Set of all Romanian strings, plus a Set of strings that should
// use the SECONDARY voice (dialogue speaker B). The secondary set is a
// subset of the main set — every speaker-B line also gets generated; the
// flag just routes it to the female/alternate voice.
function extractStrings(file, results, secondaryResults) {
  const src = readFileSync(file, "utf8");

  const add = (text) => {
    if (!text) return;
    for (const variant of expandVariants(text)) {
      results.add(variant);
    }
  };

  const addSecondary = (text) => {
    if (!text) return;
    for (const variant of expandVariants(text)) {
      results.add(variant);
      secondaryResults.add(variant);
    }
  };

  // Dialogue speaker B → secondary voice.
  // Match { speaker: "B", ro: "..." } and { ro: "...", speaker: "B" } orderings.
  for (const m of src.matchAll(
    /speaker:\s*"B"\s*,\s*ro:\s*(?:"([^"]+)"|'([^']+)')/g
  )) {
    addSecondary(m[1] ?? m[2]);
  }
  for (const m of src.matchAll(
    /ro:\s*(?:"([^"]+)"|'([^']+)')\s*,\s*speaker:\s*"B"/g
  )) {
    addSecondary(m[1] ?? m[2]);
  }

  // <RO text="..." />
  for (const m of src.matchAll(/<RO\b[^>]*\btext=(?:"([^"]+)"|'([^']+)')/g)) {
    add(m[1] ?? m[2]);
  }
  // ro: "..."
  for (const m of src.matchAll(/\bro:\s*(?:"([^"]+)"|'([^']+)')/g)) {
    add(m[1] ?? m[2]);
  }
  // ro: ["...", "...", ...]
  for (const m of src.matchAll(/\bro:\s*\[([^\]]+)\]/g)) {
    for (const sm of m[1].matchAll(/"([^"]+)"/g)) add(sm[1]);
  }
  // Typed data fields (note: `symbol` covers SoundGrid)
  const FIELDS = ["word", "exampleWord", "infinitive", "euForm", "elForm",
                  "participle", "text", "symbol"];
  for (const field of FIELDS) {
    const re = new RegExp(`\\b${field}:\\s*(?:"([^"]+)"|'([^']+)')`, "g");
    for (const m of src.matchAll(re)) add(m[1] ?? m[2]);
  }
  // TestBox answers (target language)
  for (const m of src.matchAll(/\banswer:\s*(?:"([^"]+)"|'([^']+)')/g)) {
    add(m[1] ?? m[2]);
  }
  // DataTable invocations — extract speakable cells.
  // Strategy: if the table declares `speakableCols={[1,2,3]}`, extract
  // ONLY those columns (no heuristic — they're authoritatively speakable).
  // If no speakableCols, fall back to the Romanian heuristic over all cells.
  for (const block of findDataTableBlocks(src)) {
    const rowsContent = extractRowsValue(block);
    if (!rowsContent) continue;
    const rows = parseRowsArray(rowsContent);
    const speakable = extractSpeakableCols(block);

    if (speakable && speakable.length > 0) {
      for (const row of rows) {
        for (const colIdx of speakable) {
          const cell = row[colIdx];
          if (cell) add(cell);
        }
      }
    } else {
      for (const row of rows) {
        for (const cell of row) {
          if (cell && looksRomanian(cell)) add(cell);
        }
      }
    }
  }
}

console.log("→ Scanning module for target-language text…");
const allFiles = walk(MODULE_DIR, [".ts", ".tsx"]);

const strings = new Set();
const secondaryStrings = new Set(); // dialogue speaker B → uses VOICE_ID_SECONDARY if set
for (const f of allFiles) extractStrings(f, strings, secondaryStrings);

const cleaned = [...strings]
  .map((s) => s.trim())
  .filter((s) => {
    if (s.length < 1 || s.length > 400) return false;
    if (!/[\p{L}]/u.test(s)) return false;
    return true;
  });
cleaned.sort();
console.log(`  found ${cleaned.length} unique strings`);
if (VOICE_ID_SECONDARY) {
  console.log(`  of which ${secondaryStrings.size} use the secondary voice (dialogue speaker B)`);
}
console.log("");

// ─── 6. Hash + synthesize ───────────────────────────────────────
// Hash includes the voice ID so swapping voices automatically invalidates
// the old MP3 cache without you needing to manually clear public/audio/.
function hashOf(text, voiceId) {
  return createHash("sha1").update(`${voiceId}:${text}`, "utf8").digest("hex").slice(0, 12);
}

const manifest = {};
let generated = 0;
let skipped = 0;
let failed = 0;
let charsThisRun = 0;

async function synthesize(text, voiceId) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
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
          stability: 0.7,            // higher → more consistent, less variation between runs
          similarity_boost: 0.85,    // higher → stays closer to the original speaker
          style: 0,                  // 0 → no dramatic style; ideal for learners
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
  // Route to secondary voice if (a) the string came from speaker B and
  // (b) a secondary voice ID is configured. Otherwise primary.
  const useSecondary = VOICE_ID_SECONDARY && secondaryStrings.has(text);
  const activeVoiceId = useSecondary ? VOICE_ID_SECONDARY : VOICE_ID;
  const hash = hashOf(text, activeVoiceId);
  const filepath = path.join(AUDIO_DIR, `${hash}.mp3`);

  if (existsSync(filepath)) {
    manifest[text] = hash;
    skipped++;
    continue;
  }

  if (!API_KEY) { failed++; continue; }

  const display = text.length > 60 ? text.slice(0, 57) + "…" : text;
  const tag = useSecondary ? "♀" : " ";
  process.stdout.write(`  [${i + 1}/${cleaned.length}] ${tag} ${display.padEnd(60)} `);

  try {
    const mp3 = await synthesize(text, activeVoiceId);
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

// ─── 7. Write manifest ──────────────────────────────────────────
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

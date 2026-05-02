#!/usr/bin/env node
/**
 * generate-audio.mjs — pre-generate native-quality Romanian MP3s.
 *
 * Walks every Romanian string used in the app (data files + lesson .tsx
 * files), calls ElevenLabs Multilingual v2, saves MP3s to public/audio/,
 * and rewrites src/data/audio-manifest.ts.
 *
 * Resumable: existing MP3s are skipped, so you can run on the free tier
 * across multiple months and the script will only generate what's missing.
 *
 * Setup: put ELEVEN_API_KEY in .env (and optionally ELEVEN_VOICE_ID).
 *
 * To swap providers (OpenAI, Azure, etc.), replace the `synthesize()`
 * function at the bottom — everything else stays the same.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

// ─── 0. Load .env into process.env ──────────────────────────────
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

if (!API_KEY) {
  console.error("\n❌ Missing ELEVEN_API_KEY in .env\n");
  console.error("   1. Sign up at https://elevenlabs.io (free tier: 10K chars/month)");
  console.error("   2. Profile menu → API Keys → create one");
  console.error("   3. Add to .env:    ELEVEN_API_KEY=your_key_here\n");
  console.error("   Optional: ELEVEN_VOICE_ID=...   (default: Adam, multilingual male)");
  console.error("             ELEVEN_MODEL_ID=...   (default: eleven_multilingual_v2)\n");
  process.exit(1);
}

const AUDIO_DIR = "public/audio";
const MANIFEST_PATH = "src/data/audio-manifest.ts";
mkdirSync(AUDIO_DIR, { recursive: true });

// ─── 1. Walk source files and extract Romanian strings ──────────
function walk(dir, exts, found = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, exts, found);
    else if (exts.some((e) => name.endsWith(e))) found.push(full);
  }
  return found;
}

function extractStrings(file, results) {
  const src = readFileSync(file, "utf8");

  // <RO text="..."  or  text="..." (close enough — only used in JSX with RO context)
  for (const m of src.matchAll(/<RO\b[^>]*\btext=(?:"([^"]+)"|'([^']+)')/g)) {
    results.add(m[1] ?? m[2]);
  }

  // ro: "..." (PhraseItem, VocabItem, DialogueLine, etc.)
  for (const m of src.matchAll(/\bro:\s*(?:"([^"]+)"|'([^']+)')/g)) {
    results.add(m[1] ?? m[2]);
  }

  // ro: ["...", "..."]  (Matrix arrays)
  for (const m of src.matchAll(/\bro:\s*\[([^\]]+)\]/g)) {
    for (const sm of m[1].matchAll(/"([^"]+)"/g)) results.add(sm[1]);
  }

  // Other Romanian-content fields used across the data files
  const FIELDS = ["word", "exampleWord", "infinitive", "euForm", "elForm", "participle"];
  for (const field of FIELDS) {
    const re = new RegExp(`\\b${field}:\\s*(?:"([^"]+)"|'([^']+)')`, "g");
    for (const m of src.matchAll(re)) {
      results.add(m[1] ?? m[2]);
    }
  }

  // Test answers ("answer: '...'")
  for (const m of src.matchAll(/\banswer:\s*(?:"([^"]+)"|'([^']+)')/g)) {
    results.add(m[1] ?? m[2]);
  }
}

console.log("→ Scanning source for Romanian text…");
const allFiles = [
  ...walk("src/data", [".ts"]),
  ...walk("src/components", [".tsx"]),
];

const strings = new Set();
for (const f of allFiles) extractStrings(f, strings);

// Clean up: trim, drop empties, drop strings that are clearly not Romanian
// (no letters at all, or pure English-only short words used in test answers).
const cleaned = [...strings]
  .map((s) => s.trim())
  .filter((s) => {
    if (s.length < 1 || s.length > 400) return false;
    if (!/[a-zA-ZăâîșțĂÂÎȘȚ]/.test(s)) return false;
    return true;
  });
cleaned.sort();

console.log(`  found ${cleaned.length} unique strings\n`);

// ─── 2. Hash each string ────────────────────────────────────────
function hashOf(text) {
  return createHash("sha1").update(text, "utf8").digest("hex").slice(0, 12);
}

// ─── 3. Generate MP3s for missing ones ──────────────────────────
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

console.log("→ Generating audio…\n");
const t0 = Date.now();

for (let i = 0; i < cleaned.length; i++) {
  const text = cleaned[i];
  const hash = hashOf(text);
  manifest[text] = hash;

  const filepath = path.join(AUDIO_DIR, `${hash}.mp3`);
  if (existsSync(filepath)) {
    skipped++;
    continue;
  }

  const display = text.length > 60 ? text.slice(0, 57) + "…" : text;
  process.stdout.write(`  [${i + 1}/${cleaned.length}] ${display.padEnd(60)} `);

  try {
    const mp3 = await synthesize(text);
    writeFileSync(filepath, mp3);
    generated++;
    charsThisRun += text.length;
    process.stdout.write(`✓ ${(mp3.length / 1024).toFixed(1)}KB\n`);
  } catch (err) {
    failed++;
    process.stdout.write(`✗ ${err.message}\n`);
    // Bail on auth errors so we don't burn the rest of the run
    if (/401|403/.test(String(err))) {
      console.error("\n⚠  Stopping — auth error suggests the key is wrong or quota is exhausted.");
      break;
    }
    // Soft rate-limit: pause briefly and continue
    if (/429/.test(String(err))) {
      console.log("    (rate limited — sleeping 10s)");
      await new Promise((r) => setTimeout(r, 10_000));
    }
  }

  // Tiny delay to be polite to the API
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
 * Maps Romanian text → content-hash filename in /public/audio/.
 * Populated by \`npm run generate-audio\` (scripts/generate-audio.mjs).
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
console.log(`  generated: ${generated}`);
console.log(`  skipped (already on disk): ${skipped}`);
if (failed) console.log(`  failed: ${failed}`);
console.log(`  characters this run: ${charsThisRun.toLocaleString()}`);
console.log(`  manifest: ${MANIFEST_PATH}`);
console.log(`  audio:    ${AUDIO_DIR}/`);
console.log("\n  Restart `npm run dev` to pick up the new manifest.\n");

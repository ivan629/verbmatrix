/**
 * Shared synthesis layer for generate-audio.mjs and generate-landing-audio.mjs.
 *
 * Responsibilities:
 *   • Per-language config loading (src/languages/<code>/audio-config.json)
 *   • Parallel synthesis with bounded concurrency
 *   • 429 backoff with exponential retry
 *   • 401/403 fail-fast (auth bad — no point continuing)
 *   • Atomic file writes (no half-written MP3 if killed mid-stream)
 *   • Progress logging that makes sense with parallel workers
 *
 * Config precedence (highest wins):
 *   1. CLI args / env vars
 *   2. src/languages/<code>/audio-config.json
 *   3. Built-in defaults
 *
 * Per-language config schema (all fields optional):
 *   {
 *     "voiceId":   "b4bnZ9y3ZRH0myLzE2B5",        // Robert Mihai for RO
 *     "modelId":   "eleven_multilingual_v2",
 *     "bitrate":   "mp3_44100_64",                 // half-size, same speech quality
 *     "voiceSettings": {
 *       "stability":        0.7,
 *       "similarity_boost": 0.85,
 *       "style":            0,
 *       "use_speaker_boost": true
 *     },
 *     "concurrency": 5
 *   }
 */

import { readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import path from "node:path";

const DEFAULTS = {
  voiceId: "pNInz6obpgDQGcFmaJgB",
  modelId: "eleven_multilingual_v2",
  bitrate: "mp3_44100_64",
  voiceSettings: {
    stability: 0.7,
    similarity_boost: 0.85,
    style: 0,
    use_speaker_boost: true,
  },
  concurrency: 5,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Load the per-language pronunciation override map, if present.
 *
 * File: src/languages/<code>/pronunciation.json
 *   { "<exact target text>": "<respelling fed to the TTS>", ... }
 *
 * Purpose: some words (international loanwords spelled the same as English,
 * homographs, names) are read by the English-biased multilingual model with
 * the wrong pronunciation. The override gives the engine a respelling that
 * yields the correct native sound. The manifest key and content hash stay
 * based on the ORIGINAL text, so the app still looks the word up unchanged —
 * only the audio the engine generates is affected.
 *
 * Keys beginning with "_" (e.g. "_README") are ignored. Returns {} if absent.
 */
export function loadPronunciationOverrides(langCode) {
  const overridePath = path.join("src", "languages", langCode, "pronunciation.json");
  if (!existsSync(overridePath)) return {};
  try {
    const raw = JSON.parse(readFileSync(overridePath, "utf8"));
    const out = {};
    for (const [k, v] of Object.entries(raw)) {
      if (!k.startsWith("_") && typeof v === "string" && v.trim()) out[k] = v;
    }
    return out;
  } catch (err) {
    console.warn(`⚠  Could not parse ${overridePath}: ${err.message}`);
    return {};
  }
}

/** Load and merge config for a given language code. */
export function loadAudioConfig(langCode) {
  const configPath = path.join("src", "languages", langCode, "audio-config.json");
  let fileConfig = {};
  if (existsSync(configPath)) {
    try {
      fileConfig = JSON.parse(readFileSync(configPath, "utf8"));
    } catch (err) {
      console.warn(`⚠  Could not parse ${configPath}: ${err.message}`);
    }
  }
  const envConcurrency = process.env.ELEVEN_CONCURRENCY
    ? parseInt(process.env.ELEVEN_CONCURRENCY, 10)
    : undefined;
  return {
    voiceId: process.env.ELEVEN_VOICE_ID || fileConfig.voiceId || DEFAULTS.voiceId,
    modelId: process.env.ELEVEN_MODEL_ID || fileConfig.modelId || DEFAULTS.modelId,
    bitrate: process.env.ELEVEN_BITRATE  || fileConfig.bitrate || DEFAULTS.bitrate,
    voiceSettings: { ...DEFAULTS.voiceSettings, ...(fileConfig.voiceSettings || {}) },
    concurrency: envConcurrency || fileConfig.concurrency || DEFAULTS.concurrency,
    configSource: existsSync(configPath) ? configPath : "defaults + env",
  };
}

/** Synthesize one phrase with retry-on-429. Throws on auth error or final failure. */
async function synthesizeOnce(text, config, apiKey) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}?output_format=${config.bitrate}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: config.modelId,
        voice_settings: config.voiceSettings,
      }),
    }
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new Error(`HTTP ${res.status}: ${detail.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  return Buffer.from(await res.arrayBuffer());
}

async function synthesizeWithRetry(text, config, apiKey) {
  const maxAttempts = 4;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await synthesizeOnce(text, config, apiKey);
    } catch (err) {
      // Auth errors — bubble up, caller stops the run.
      if (err.status === 401 || err.status === 403) throw err;
      // Rate-limit — exponential backoff (1s, 3s, 9s).
      if (err.status === 429 && attempt < maxAttempts - 1) {
        await sleep(1000 * Math.pow(3, attempt));
        continue;
      }
      // Last attempt — let the error propagate so the runner can count it.
      if (attempt === maxAttempts - 1) throw err;
    }
  }
  throw new Error("unreachable");
}

/** Atomic write: stage to .tmp, then rename. Kills mid-write never leave a broken MP3. */
function writeAtomic(filepath, buffer) {
  const tmp = filepath + ".tmp";
  writeFileSync(tmp, buffer);
  renameSync(tmp, filepath);
}

/**
 * Parallel generator. Takes an iterable of {text, filepath, hash}, processes
 * them with bounded concurrency, returns { generated, failed, charsThisRun }.
 *
 * Updates `manifest` in-place as each one succeeds.
 */
export async function generateInParallel({ tasks, config, apiKey, manifest, total, overrides = {} }) {
  let generated = 0;
  let failed = 0;
  let charsThisRun = 0;
  let completed = 0;
  let aborted = false;
  const startedAt = Date.now();

  // Shared task queue — workers pull from this.
  const queue = [...tasks];

  async function worker(workerId) {
    while (queue.length > 0 && !aborted) {
      const task = queue.shift();
      if (!task) break;

      // The text SPOKEN may be a respelling (override), but the manifest key
      // and content hash always stay the original task.text.
      const spokenText = overrides[task.text] ?? task.text;

      try {
        const mp3 = await synthesizeWithRetry(spokenText, config, apiKey);
        writeAtomic(task.filepath, mp3);
        manifest[task.text] = task.hash;
        generated++;
        charsThisRun += spokenText.length;

        completed++;
        const elapsed = (Date.now() - startedAt) / 1000;
        const rate = completed / elapsed;
        const remaining = (total - completed) / rate;
        const display = task.text.length > 50 ? task.text.slice(0, 47) + "…" : task.text;
        process.stdout.write(
          `  [${String(completed).padStart(4)}/${total}] ` +
          `${(mp3.length / 1024).toFixed(1).padStart(5)}KB  ` +
          `~${remaining.toFixed(0).padStart(3)}s left  ${display}\n`
        );
      } catch (err) {
        failed++;
        completed++;
        console.error(`  ✗ ${task.text.slice(0, 50)} — ${err.message}`);
        if (err.status === 401 || err.status === 403) {
          console.error("\n⚠  Auth error — stopping all workers. Check ELEVEN_API_KEY.");
          aborted = true;
        }
      }
    }
  }

  const workers = Array.from({ length: config.concurrency }, (_, i) => worker(i));
  await Promise.all(workers);

  return { generated, failed, charsThisRun, aborted };
}

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
import { loadPronunciationOverrides, applyOverrides } from "./overrides.mjs";

const DEFAULTS = {
  voiceId: "b4bnZ9y3ZRH0myLzE2B5",   // Robert Mihai — native Romanian
  // Turbo v2.5 ENFORCES the language passed in `language_code`. That means
  // words spelled like English (radio, weekend, computer, brand names, and —
  // crucially — single-word vocab drills that have no surrounding sentence to
  // disambiguate from) are still spoken with the target language's phonetics.
  // The old default, eleven_multilingual_v2, only AUTO-DETECTS language per
  // word and cannot be forced — which is exactly why English-looking Romanian
  // words were coming out sounding English. Latency is irrelevant for an
  // offline batch job, so there's no downside to Turbo here.
  // (eleven_flash_v2_5 is functionally identical and also valid.)
  modelId: "eleven_turbo_v2_5",
  bitrate: "mp3_44100_128",           // 128kbps — clean for speech
  languageCode: "ro",
  // Offline batch → we can afford full text normalization, so numbers, dates
  // and currencies are read as words in the target language ("123" →
  // "o sută douăzeci și trei") instead of being spelled out oddly. "auto" lets
  // the model decide and never errors; set to "on" to force it where allowed.
  applyTextNormalization: "auto",
  voiceSettings: {
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0,
    use_speaker_boost: true,
  },
  concurrency: 4,
};

// Models that accept the `language_code` enforcement parameter. Sending it to
// any other model (e.g. multilingual_v2) is rejected with HTTP 400 — and those
// models can't be forced to a language anyway — so we gate on this set. To add
// a model that supports enforcement in the future, add its id here.
const LANGUAGE_ENFORCING_MODELS = new Set([
  "eleven_turbo_v2_5",
  "eleven_flash_v2_5",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  // Per-language pronunciation overrides (applied to text just before TTS).
  const { words: overrideWords, configSource: overrideSource } =
    loadPronunciationOverrides(langCode);

  const modelId = process.env.ELEVEN_MODEL_ID || fileConfig.modelId || DEFAULTS.modelId;
  const languageCode =
    process.env.ELEVEN_LANGUAGE_CODE || fileConfig.languageCode || DEFAULTS.languageCode || null;

  // Loud warning if a language is configured but the chosen model can't enforce
  // it. This is the #1 cause of "Romanian words sound English": the model just
  // auto-detects and guesses English for English-looking spellings.
  if (languageCode && !LANGUAGE_ENFORCING_MODELS.has(modelId)) {
    console.warn(
      `⚠  Model "${modelId}" does NOT enforce language_code="${languageCode}".\n` +
      `   It will auto-detect language per word, so words spelled like English\n` +
      `   may be pronounced in English. Use one of: ${[...LANGUAGE_ENFORCING_MODELS].join(", ")}.`
    );
  }

  return {
    voiceId: process.env.ELEVEN_VOICE_ID || fileConfig.voiceId || DEFAULTS.voiceId,
    modelId,
    bitrate: process.env.ELEVEN_BITRATE  || fileConfig.bitrate || DEFAULTS.bitrate,
    languageCode,
    applyTextNormalization:
      process.env.ELEVEN_TEXT_NORMALIZATION ||
      fileConfig.applyTextNormalization ||
      DEFAULTS.applyTextNormalization ||
      null,
    voiceSettings: { ...DEFAULTS.voiceSettings, ...(fileConfig.voiceSettings || {}) },
    concurrency: envConcurrency || fileConfig.concurrency || DEFAULTS.concurrency,
    pronunciationOverrides: overrideWords,
    overrideCount: Object.keys(overrideWords).length,
    overrideSource,
    configSource: existsSync(configPath) ? configPath : "defaults + env",
  };
}

/** Synthesize one phrase with retry-on-429. Throws on auth error or final failure. */
async function synthesizeOnce(text, config, apiKey) {
  // Transform the text via pronunciation overrides (no-op if none defined).
  // The UI string and the manifest key both stay as `text`; only what
  // ElevenLabs receives is rewritten to coax correct pronunciation.
  const synthesisText = applyOverrides(text, config.pronunciationOverrides || {});

  // Build request body. `language_code` enforces the language, but ONLY on
  // models that support it (see LANGUAGE_ENFORCING_MODELS). Sending it to a
  // model that doesn't (e.g. multilingual_v2) returns HTTP 400, so we gate on
  // both: a configured languageCode AND a model that accepts it.
  const body = {
    text: synthesisText,
    model_id: config.modelId,
    voice_settings: config.voiceSettings,
  };
  if (config.languageCode && LANGUAGE_ENFORCING_MODELS.has(config.modelId)) {
    body.language_code = config.languageCode;
  }
  if (config.applyTextNormalization) {
    body.apply_text_normalization = config.applyTextNormalization;
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}?output_format=${config.bitrate}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify(body),
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
export async function generateInParallel({ tasks, config, apiKey, manifest, total }) {
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

      try {
        const mp3 = await synthesizeWithRetry(task.text, config, apiKey);
        writeAtomic(task.filepath, mp3);
        manifest[task.text] = task.hash;
        generated++;
        charsThisRun += task.text.length;

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

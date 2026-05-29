#!/usr/bin/env node
/**
 * Voice audition — generate the SAME Romanian sample across multiple voices.
 *
 * Before committing to regenerate 3,000+ files with one voice, audition a
 * handful of candidate voices on representative Romanian sentences. Listen,
 * pick the best, THEN do the full run. Costs a few cents instead of dollars.
 *
 * ─── Usage ───────────────────────────────────────────────────────────
 *   ELEVEN_API_KEY=xxx node scripts/audition-voices.mjs VOICE_ID_1 VOICE_ID_2 ...
 *
 *   # Example — audition three native Romanian voices:
 *   ELEVEN_API_KEY=xxx node scripts/audition-voices.mjs \
 *     b4bnZ9y3ZRH0myLzE2B5 \
 *     OlBp4oyr3FBAGEAtJOnU \
 *     <another-voice-id>
 *
 * ─── Output ──────────────────────────────────────────────────────────
 *   Creates public/audio/_audition/<voiceId>/sample_NN.mp3 for each voice,
 *   plus an index.html you can open to listen to all of them side by side.
 *
 *   Open: public/audio/_audition/index.html
 *
 * ─── Sample sentences ────────────────────────────────────────────────
 * Hand-picked to exercise the hardest Romanian sounds:
 *   ț, ș, â, î, ă, ce/ci, ge/gi, ch, gh, diphthongs, numbers.
 * If a voice nails these, it'll nail the rest of the course.
 */

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const API_KEY = process.env.ELEVEN_API_KEY;
const MODEL_ID = process.env.ELEVEN_MODEL_ID || "eleven_turbo_v2_5";
const LANGUAGE_CODE = process.env.ELEVEN_LANGUAGE_CODE || "ro";
const voiceIds = process.argv.slice(2).filter((a) => !a.startsWith("--"));

if (!API_KEY) {
  console.error("✗ ELEVEN_API_KEY not set.");
  process.exit(1);
}
if (voiceIds.length === 0) {
  console.error("✗ No voice IDs given.");
  console.error("  Usage: ELEVEN_API_KEY=xxx node scripts/audition-voices.mjs VOICE_ID_1 VOICE_ID_2 ...");
  console.error("  Tip:   run scripts/list-voices.mjs ro first to find IDs.");
  process.exit(1);
}

// Sentences that stress-test every hard Romanian sound.
const SAMPLES = [
  "Bună ziua! Mă numesc Ivan și învăț limba română.",                 // greetings, î, ă
  "Mulțumesc foarte mult pentru ajutorul tău.",                       // ț, multiple
  "Cinci copii mici merg încet spre școală.",                         // ci, mic, ș, î
  "Cerul este senin și soarele strălucește.",                         // ce, ș, diphthong
  "Gheorghe a cumpărat ghete noi de la magazin.",                     // gh, ă, diphthong
  "Astăzi este o zi frumoasă de primăvară.",                          // ă, â, diphthong
  "Eu aș vrea o cafea și un ceai, te rog.",                           // eu, ș, ce, diphthong
  "Acesta este un exercițiu de pronunție corectă.",                   // ț, ci, hard test
  "Țara noastră are munți înalți și râuri adânci.",                   // ț, â, î, adânci
  "Unu, doi, trei, patru, cinci, șase, șapte, opt, nouă, zece.",      // all numbers
];

async function synth(voiceId, text) {
  // language_code only works on enforcing models; sending it elsewhere 400s.
  const enforces = MODEL_ID === "eleven_turbo_v2_5" || MODEL_ID === "eleven_flash_v2_5";
  const reqBody = {
    text,
    model_id: MODEL_ID,
    apply_text_normalization: "auto",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.8,
      style: 0.0,
      use_speaker_boost: true,
    },
  };
  if (enforces && LANGUAGE_CODE) reqBody.language_code = LANGUAGE_CODE;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify(reqBody),
    }
  );
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${(await res.text().catch(() => "")).slice(0, 150)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const baseDir = path.join("public", "audio", "_audition");
  mkdirSync(baseDir, { recursive: true });

  console.log(`\n→ Auditioning ${voiceIds.length} voice(s) on ${SAMPLES.length} samples`);
  console.log(`  Model: ${MODEL_ID}   Language: ${LANGUAGE_CODE}\n`);

  const results = {};
  for (const voiceId of voiceIds) {
    const dir = path.join(baseDir, voiceId);
    mkdirSync(dir, { recursive: true });
    results[voiceId] = [];
    console.log(`Voice ${voiceId}:`);
    for (let i = 0; i < SAMPLES.length; i++) {
      const text = SAMPLES[i];
      const file = `sample_${String(i + 1).padStart(2, "0")}.mp3`;
      const filepath = path.join(dir, file);
      try {
        const audio = await synth(voiceId, text);
        writeFileSync(filepath, audio);
        results[voiceId].push({ file, text });
        console.log(`  ✓ ${file}  ${text.slice(0, 40)}…`);
      } catch (err) {
        console.log(`  ✗ ${file}  ${err.message}`);
      }
    }
    console.log("");
  }

  // Build an index.html for side-by-side listening
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Romanian Voice Audition</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;background:#0d0c11;color:#e8e8ea}
  h1{font-size:1.4rem} h2{font-size:1rem;color:#c9a96a;margin-top:2rem}
  table{width:100%;border-collapse:collapse;margin-top:.5rem}
  td{padding:.6rem;border-bottom:1px solid #2a2a32;vertical-align:top}
  .txt{font-family:ui-monospace,monospace;font-size:.85rem;color:#b8b8c0}
  audio{width:260px}
  .vid{font-family:ui-monospace,monospace;font-size:.75rem;color:#6a6a72}
</style></head><body>
<h1>Romanian Voice Audition</h1>
<p class="txt">Model: ${MODEL_ID} · Language: ${LANGUAGE_CODE} · ${voiceIds.length} voices · ${SAMPLES.length} samples</p>
${voiceIds.map((vid) => `
<h2>Voice: ${vid}</h2>
<table>
${(results[vid] || []).map((r) => `  <tr>
    <td><audio controls src="${vid}/${r.file}"></audio></td>
    <td class="txt">${r.text}</td>
  </tr>`).join("\n")}
</table>`).join("\n")}
</body></html>`;
  writeFileSync(path.join(baseDir, "index.html"), html);

  console.log("✓ Done.");
  console.log(`\nListen side-by-side — open this in a browser:`);
  console.log(`  ${path.resolve(baseDir, "index.html")}`);
  console.log(`\nOr serve it: npx serve public/audio/_audition\n`);
  console.log("Once you've chosen, put the winning Voice ID in");
  console.log("src/languages/ro/audio-config.json → voiceId, then: npm run audio:fresh\n");
}

main().catch((err) => {
  console.error("✗ Failed:", err.message);
  process.exit(1);
});

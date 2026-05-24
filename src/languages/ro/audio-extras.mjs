/**
 * audio-extras.mjs — declares Romanian strings the static extractor
 * cannot see because they're built at runtime by buildMatrix() in
 * data/conjugations.ts.
 *
 * The Practice page conjugates each of 33 verbs into a 3×3 matrix
 * (future × present × past) × (question × affirmative × negative)
 * × 6 persons = 162 sentences per verb = ~5,300 strings total.
 *
 * This file replicates buildMatrix()'s template logic by:
 *   1. Parsing data/conjugations.ts for the verb table
 *   2. Producing every sentence the runtime would build
 *
 * The generator and audit scripts auto-load this file if present.
 * Other languages can ship their own audio-extras.mjs the same way.
 *
 * KEEP IN SYNC with data/conjugations.ts buildMatrix() — if the template
 * changes there, change it here too. (TODO: factor a single source.)
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

// Mirror language constants from data/conjugations.ts
const PRONOUN_UPPER = ["Eu", "Tu", "El", "Noi", "Voi", "Ei"];
const PRONOUN_LOWER = ["eu", "tu", "el", "noi", "voi", "ei"];
const AUX_PAST      = ["am", "ai", "a",  "am",  "ați", "au"];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Parse data/conjugations.ts to get every verb's participle, present[6],
 * subjunctive[6]. Regex-based (not AST) — the file format is consistent and
 * machine-friendly; an AST parser would be overkill.
 */
function parseConjugations() {
  const src = readFileSync(path.join(HERE, "data", "conjugations.ts"), "utf8");
  const verbs = [];

  // Match each verb object literal: { infinitive: "...", meaning: "...",
  //   participle: "...", present: [...], subjunctive: [...] }
  // Order of fields is consistent in the source.
  const re = /\{\s*infinitive:\s*"([^"]+)"[\s\S]*?participle:\s*"([^"]+)"[\s\S]*?present:\s*\[([^\]]+)\][\s\S]*?subjunctive:\s*\[([^\]]+)\]\s*\}/g;

  for (const m of src.matchAll(re)) {
    const [, infinitive, participle, presentArr, subjunctiveArr] = m;
    const parseArr = (s) =>
      [...s.matchAll(/"([^"]+)"/g)].map((mm) => mm[1]);
    const present = parseArr(presentArr);
    const subjunctive = parseArr(subjunctiveArr);
    if (present.length === 6 && subjunctive.length === 6) {
      verbs.push({ infinitive, participle, present, subjunctive });
    }
  }
  return verbs;
}

/**
 * Replicate buildMatrix() output for one verb — produces every Romanian
 * sentence the Practice matrix renders.
 */
function buildMatrixStrings(verb) {
  const out = [];
  for (let i = 0; i < 6; i++) {
    const subj = verb.subjunctive[i];
    const pres = verb.present[i];
    const aux  = AUX_PAST[i];
    const PU   = PRONOUN_UPPER[i];
    const PL   = PRONOUN_LOWER[i];
    const part = verb.participle;

    // Future = "o să" + subjunctive
    out.push(`${PU} o să ${subj}.`);
    out.push(`N-o să ${subj}.`);
    out.push(`O să ${subj}?`);

    // Present indicative
    out.push(`${PU} ${pres}.`);
    out.push(`${PU} nu ${pres}.`);
    out.push(`${cap(pres)} ${PL}?`);

    // Past = aux + participle
    out.push(`${PU} ${aux} ${part}.`);
    out.push(`${PU} nu ${aux} ${part}.`);
    out.push(`${cap(aux)} ${part} ${PL}?`);
  }
  return out;
}

/** Public entrypoint. Returns the array of Romanian strings the extractor
 *  cannot find by walking source code alone. */
export function getExtraStrings() {
  const verbs = parseConjugations();
  const out = new Set();
  for (const verb of verbs) {
    for (const s of buildMatrixStrings(verb)) out.add(s);
  }
  return [...out];
}

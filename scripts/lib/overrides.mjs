/**
 * Pronunciation overrides for ElevenLabs TTS.
 *
 * ─── What this does ──────────────────────────────────────────────────
 * Loads `pronunciation-overrides.json` (per-language) and provides a
 * function to rewrite text BEFORE it's sent to ElevenLabs. The UI text
 * stays exactly as written in source code; only the TTS audio gets the
 * phonetic-respelling treatment.
 *
 * Example:
 *   UI displays: "Mulțumesc!"
 *   ElevenLabs receives: "Multsumesc!"
 *   User hears: correct [t͡s] sound at the 'ț' position.
 *
 * ─── Override file shape ─────────────────────────────────────────────
 *   {
 *     "words": {
 *       "mulțumesc": "multsumesc",   // case-insensitive match
 *       "țară":      "tsara",
 *       "îți":       "ihtsi",
 *       ...
 *     }
 *   }
 *
 * ─── Case preservation ───────────────────────────────────────────────
 * "Mulțumesc" + "multsumesc" → "Multsumesc"  (sentence start: Capitalized)
 * "MULȚUMESC" + "multsumesc" → "MULTSUMESC"  (all caps preserved)
 * "mulțumesc" + "multsumesc" → "multsumesc"  (lowercase as-is)
 *
 * ─── Word boundaries ─────────────────────────────────────────────────
 * Replacement only fires at Unicode word boundaries. So overriding "în"
 * does NOT also rewrite "îndelung", "început", etc. Use full-word entries
 * for each inflection you need.
 *
 * ─── Why a separate module ───────────────────────────────────────────
 * Keeps `synth.mjs` clean (one import, two function calls) and lets the
 * regenerate script share the same logic.
 */

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Mirror the case style of `source` onto `replacement`.
 *  ALLCAPS   → ALLCAPS
 *  Titlecase → Titlecase
 *  anything  → as-given
 */
function matchCase(source, replacement) {
  if (source === source.toUpperCase() && source !== source.toLowerCase()) {
    return replacement.toUpperCase();
  }
  if (source[0] && source[0] === source[0].toUpperCase() && source[0] !== source[0].toLowerCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

/**
 * Load pronunciation overrides for a language code. Returns {} if no file.
 * @param {string} langCode  e.g. "ro"
 * @returns {{ words: Record<string,string>, configSource: string }}
 */
export function loadPronunciationOverrides(langCode) {
  const filePath = path.join("src", "languages", langCode, "pronunciation-overrides.json");
  if (!existsSync(filePath)) {
    return { words: {}, configSource: "(no overrides file)" };
  }
  try {
    const config = JSON.parse(readFileSync(filePath, "utf8"));
    const words = config.words || {};
    // Sort keys by length descending — longer matches first to avoid
    // partial replacements (e.g., "îți mulțumesc" before "îți" alone).
    const sorted = Object.fromEntries(
      Object.entries(words).sort(([a], [b]) => b.length - a.length)
    );
    return { words: sorted, configSource: filePath };
  } catch (err) {
    console.warn(`⚠  Could not parse ${filePath}: ${err.message}`);
    return { words: {}, configSource: "(parse error)" };
  }
}

/**
 * Apply word-level overrides to text. Case-preserving, word-boundary safe.
 *
 * @param {string} text       Original text (the UI-visible string).
 * @param {Record<string,string>} overrides  Map of word → respelling.
 * @returns {string}          Transformed text ready for ElevenLabs.
 */
export function applyOverrides(text, overrides) {
  if (!text || !overrides) return text;
  const keys = Object.keys(overrides);
  if (keys.length === 0) return text;

  let result = text;
  for (const original of keys) {
    const replacement = overrides[original];
    if (!original || replacement == null) continue;
    // Unicode-aware word boundary: not preceded/followed by a letter/mark.
    // Using lookbehind/lookahead with \p{L} (letter) and \p{M} (combining mark).
    const escaped = escapeRegex(original);
    const regex = new RegExp(
      `(?<![\\p{L}\\p{M}])${escaped}(?![\\p{L}\\p{M}])`,
      "giu"
    );
    result = result.replace(regex, (match) => matchCase(match, replacement));
  }
  return result;
}

/**
 * Cheap predicate: does `text` contain any word that would be overridden?
 * Useful for "find audio files affected by an override change".
 *
 * @param {string} text
 * @param {Record<string,string>} overrides
 * @returns {boolean}
 */
export function hasAnyOverride(text, overrides) {
  if (!text || !overrides) return false;
  return applyOverrides(text, overrides) !== text;
}

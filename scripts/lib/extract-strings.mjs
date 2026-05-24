/**
 * Shared extraction logic for both generate-audio.mjs and audit-audio.mjs.
 * See file header comments in audit-audio.mjs for the convention list.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import * as fs from "node:fs";
import path from "node:path";

const RO_DIACRITICS = /[ăâîșțĂÂÎȘȚ]/;
const TYPED_FIELDS = ["word", "exampleWord", "infinitive", "euForm", "elForm",
                      "participle", "text", "symbol"];

export function looksRomanian(text) {
  const t = text.trim();
  if (!t) return false;
  if (RO_DIACRITICS.test(t)) return true;
  if (/^a\s+(se\s+)?[a-z]{2,}/i.test(t)) return true;
  if (/^(voi|vei|va|vom|veți|vor)\s+[a-zăâîșț]/i.test(t)) return true;
  if (/^(am|ai|au)\s+[a-zăâîșț]+(at|it|ut|ât|s)\b/i.test(t)) return true;
  if (/^(eu|tu|el|ea|noi|voi|ei|ele)\s+[a-zăâîșț]/i.test(t)) return true;
  if (/\bsă\s+[a-zăâîșț]/i.test(t)) return true;
  if (/^(mă|te|se|ne|vă|îmi|îți|îi|le)\s+[a-zăâîșț]/i.test(t)) return true;
  return false;
}

export function expandVariants(text) {
  // Strip trailing "(English gloss)" so the manifest key matches what
  // SpeakableCell actually passes to speak() at runtime.
  const stripGloss = (s) => {
    const m = s.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    return m && /[a-zA-Z]/.test(m[2]) ? m[1].trim() : s.trim();
  };
  const out = new Set();
  out.add(stripGloss(text));
  for (const seg of text.split(/\s*·\s*/)) {
    out.add(stripGloss(seg));
    for (const part of seg.split(/\s*→\s*/)) {
      out.add(stripGloss(part));
      for (const variant of part.split(/\s*\/\s*/)) {
        const v = stripGloss(variant);
        if (v && !/^-/.test(v)) out.add(v);
      }
    }
  }
  return [...out].filter((s) => s.length > 0);
}

function findDataTableBlocks(src) {
  const blocks = [];
  let idx = 0;
  while (true) {
    const start = src.indexOf("<DataTable", idx);
    if (start === -1) break;
    let i = start, inString = null, braceDepth = 0;
    while (i < src.length) {
      const c = src[i];
      if (inString) { if (c === inString && src[i - 1] !== "\\") inString = null; }
      else if (c === '"' || c === "'") inString = c;
      else if (c === "{") braceDepth++;
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
  const marker = "rows={";
  const idx = blockSrc.indexOf(marker);
  if (idx === -1) return null;
  let i = idx + marker.length, depth = 1;
  while (i < blockSrc.length && depth > 0) {
    if (blockSrc[i] === "{") depth++;
    else if (blockSrc[i] === "}") depth--;
    i++;
  }
  if (depth !== 0) return null;
  return blockSrc.substring(idx + marker.length, i - 1);
}

function parseRowsArray(rowsContent) {
  const rows = [];
  let depth = 0, rowStart = -1;
  for (let i = 0; i < rowsContent.length; i++) {
    const c = rowsContent[i];
    if (c === "[") { depth++; if (depth === 2) rowStart = i + 1; }
    else if (c === "]") {
      if (depth === 2 && rowStart !== -1) {
        rows.push(rowsContent.substring(rowStart, i));
        rowStart = -1;
      }
      depth--;
    }
  }
  return rows.map((rowSrc) => {
    const cells = [];
    let pos = 0, cellStart = 0, inString = null, curlyDepth = 0;
    for (; pos < rowSrc.length; pos++) {
      const c = rowSrc[pos];
      if (inString) {
        if (c === inString && rowSrc[pos - 1] !== "\\") {
          cells.push(rowSrc.substring(cellStart, pos + 1));
          inString = null;
          cellStart = pos + 1;
        }
      } else if (c === '"' || c === "'") {
        if (curlyDepth === 0) { inString = c; cellStart = pos; }
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
  return m[1].split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
}

function walk(dir, exts, found = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    if (name === "locales") continue;
    if (name === "audio-manifest.ts") continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, exts, found);
    else if (exts.some((e) => name.endsWith(e))) found.push(full);
  }
  return found;
}

function extractFromFile(file, results, sourceMap) {
  const src = readFileSync(file, "utf8");
  const add = (text) => {
    if (!text) return;
    for (const variant of expandVariants(text)) {
      results.add(variant);
      if (!sourceMap.has(variant)) sourceMap.set(variant, new Set());
      sourceMap.get(variant).add(file);
    }
  };
  for (const m of src.matchAll(/<RO\b[^>]*\btext=(?:"([^"]+)"|'([^']+)')/g)) add(m[1] ?? m[2]);
  for (const m of src.matchAll(/\bro:\s*(?:"([^"]+)"|'([^']+)')/g)) add(m[1] ?? m[2]);
  for (const m of src.matchAll(/\bro:\s*\[([^\]]+)\]/g)) {
    for (const sm of m[1].matchAll(/"([^"]+)"/g)) add(sm[1]);
  }
  for (const field of TYPED_FIELDS) {
    const re = new RegExp(`\\b${field}:\\s*(?:"([^"]+)"|'([^']+)')`, "g");
    for (const m of src.matchAll(re)) add(m[1] ?? m[2]);
  }
  for (const m of src.matchAll(/\banswer:\s*(?:"([^"]+)"|'([^']+)')/g)) add(m[1] ?? m[2]);
  for (const block of findDataTableBlocks(src)) {
    const rowsContent = extractRowsValue(block);
    if (!rowsContent) continue;
    const rows = parseRowsArray(rowsContent);
    const speakable = extractSpeakableCols(block);
    if (speakable && speakable.length > 0) {
      for (const row of rows) {
        for (const colIdx of speakable) { const cell = row[colIdx]; if (cell) add(cell); }
      }
    } else {
      for (const row of rows) {
        for (const cell of row) { if (cell && looksRomanian(cell)) add(cell); }
      }
    }
  }
}

export function extractTargetStrings(moduleDir) {
  const strings = new Set();
  const sourceMap = new Map();
  for (const f of walk(moduleDir, [".ts", ".tsx"])) {
    extractFromFile(f, strings, sourceMap);
  }
  const cleaned = [...strings]
    .map((s) => s.trim())
    .filter((s) => s.length >= 1 && s.length <= 400 && /[\p{L}]/u.test(s));
  const cleanedSet = new Set(cleaned);
  // Trim sourceMap to only include cleaned strings
  for (const k of [...sourceMap.keys()]) {
    if (!cleanedSet.has(k)) sourceMap.delete(k);
  }
  return { strings: cleanedSet, sourceMap };
}

/**
 * Extract runtime-generated strings via the optional audio-extras.mjs hook.
 *
 * Some apps build target-language text at runtime via template literals
 * (e.g., conjugating verbs in a Practice matrix). The static extractor can't
 * see those — they don't exist as literals in source. Each language can ship
 * an `audio-extras.mjs` exporting `getExtraStrings(): string[]` that
 * replicates the runtime logic and returns the missing strings.
 *
 * Returns an empty array if no hook exists.
 */
export async function extractExtraStrings(moduleDir) {
  const extrasPath = path.join(moduleDir, "audio-extras.mjs");
  if (!fs.existsSync(extrasPath)) return [];
  try {
    // Dynamic import — convert to file URL for Windows compatibility
    const url = "file://" + path.resolve(extrasPath);
    const mod = await import(url);
    if (typeof mod.getExtraStrings !== "function") {
      console.warn(`⚠  ${extrasPath} doesn't export getExtraStrings()`);
      return [];
    }
    const extras = await mod.getExtraStrings();
    if (!Array.isArray(extras)) {
      console.warn(`⚠  ${extrasPath} getExtraStrings() must return string[]`);
      return [];
    }
    // Filter same way as static extraction
    return extras
      .map((s) => String(s).trim())
      .filter((s) => s.length >= 1 && s.length <= 400 && /[\p{L}]/u.test(s));
  } catch (err) {
    console.warn(`⚠  Failed to load ${extrasPath}: ${err.message}`);
    return [];
  }
}

export function extractLandingStrings(localesDir) {
  const strings = new Set();
  const files = readdirSync(localesDir).filter(
    (f) => f.startsWith("landing.") && f.endsWith(".json")
  );
  for (const file of files) {
    const data = JSON.parse(readFileSync(path.join(localesDir, file), "utf8"));
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith("landing_tl_") && typeof value === "string" &&
          value.trim().length > 0 && /[\p{L}]/u.test(value)) {
        for (const variant of expandVariants(value.trim())) strings.add(variant);
      }
    }
  }
  return strings;
}

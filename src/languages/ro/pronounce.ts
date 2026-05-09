/**
 * Romanian → simple English-friendly phonetic transcription.
 *
 * Romanian is highly phonetic, so a small rule-set covers >95% of words.
 * This is *guidance* for English speakers, not IPA.
 *
 * Conventions in output:
 *   "uh"  = ă or â/î (schwa-ish)
 *   "sh"  = ș
 *   "ts"  = ț
 *   "ch"  = c+e/i
 *   "j"   = g+e/i (soft, as in English "jet")
 *   "k"   = ch+e/i
 *   "g"   = gh+e/i
 *   STRESS in CAPS on the syllable a Romanian would naturally stress
 *   (heuristic: penultimate syllable, the rule that fits ~80% of words).
 */

const STRESS_OVERRIDES: Record<string, string> = {
  // Common stress exceptions worth getting right.
  "copil": "ko-PEEL",
  "copilul": "ko-PEE-lool",
  "băiat": "buh-YAHT",
  "băiatul": "buh-YAH-tool",
  "cafea": "ka-FAH",
  "casă": "KAH-suh",
  "casa": "KAH-sah",
  "fată": "FAH-tuh",
  "fata": "FAH-tah",
  "masă": "MAH-suh",
  "masa": "MAH-sah",
  "mulțumesc": "mool-tsoo-MESK",
  "bună": "BOO-nuh",
  "ziua": "ZEE-wah",
  "noapte": "NWAHP-teh",
  "bună ziua": "BOO-nuh ZEE-wah",
  "bună seara": "BOO-nuh SEH-ah-rah",
  "noapte bună": "NWAHP-teh BOO-nuh",
  "vă rog": "vuh ROHG",
  "da": "dah",
  "nu": "noo",
  "eu": "yeh-oo",
  "tu": "too",
  "el": "el",
  "ea": "yah",
  "noi": "noy",
  "voi": "voy",
  "ei": "yey",
  "ele": "EH-leh",
  "este": "YES-teh",
  "sunt": "soont",
  "ești": "YESHT'",
  "suntem": "SOON-tem",
  "sunteți": "SOON-tets'",
  "am": "ahm",
  "ai": "ay",
  "are": "AH-reh",
  "avem": "ah-VEM",
  "aveți": "ah-VETS'",
  "au": "ow",
  "România": "roh-muh-NEE-ah",
  "București": "boo-koo-RESHT'",
  "în": "uhn",
  "și": "shee",
  "sau": "sow",
  "dar": "dahr",
  "ce": "cheh",
  "cine": "CHEE-neh",
  "unde": "OON-deh",
  "când": "kuhnd",
  "cum": "koom",
  "de ce": "deh CHEH",
  "câine": "KUH-y-neh",
  "vorbi": "vor-BEE",
  "vorbesc": "vor-BESK",
  "vorbește": "vor-BESH-teh",
  "lucrez": "loo-KREZ",
  "lucrează": "loo-KREH-ah-zuh",
  "lucrăm": "loo-KRUHM",
  "fac": "fahk",
  "face": "FAH-cheh",
  "făcut": "fuh-KOOT",
  "merg": "merg",
  "merge": "MER-jeh",
  "mers": "mers",
  "mănânc": "muh-NUHNK",
  "mănâncă": "muh-NUHN-kuh",
  "mâncat": "muhn-KAHT",
  "îmi place": "uhm' PLAH-cheh",
  "mi-e foame": "mee-yeh FWAH-meh",
  "mi-e sete": "mee-yeh SEH-teh",
  "mi-e dor": "mee-yeh DOR",
  "mi-e dor de tine": "mee-yeh dor deh TEE-neh",
  "salut": "sah-LOOT",
  "ciao": "chow",
  "pa": "pah",
  "la revedere": "lah reh-veh-DEH-reh",
  "scuzați-mă": "skoo-ZAHTS' muh",
  "îmi pare rău": "uhm' PAH-reh ruh-OO",
  "cât costă": "kuht KOS-tuh",
  "noroc": "no-ROHK",
};

/** Lower-case, strip Romanian diacritics for lookup fall-throughs. */
const stripDiacritics = (s: string) =>
  s
    .replace(/ă/g, "a")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/ș/g, "s")
    .replace(/ț/g, "t")
    .replace(/Ă/g, "A")
    .replace(/Â/g, "A")
    .replace(/Î/g, "I")
    .replace(/Ș/g, "S")
    .replace(/Ț/g, "T");

const VOWELS = "aeiouăâîAEIOUĂÂÎ";
const isVowel = (c: string) => VOWELS.includes(c);

/** Transcribe a single Romanian word (no spaces). */
function transcribeWord(word: string): string {
  const lower = word.toLowerCase();
  if (STRESS_OVERRIDES[lower]) return STRESS_OVERRIDES[lower];

  // Walk character by character with digraph awareness.
  const chars = lower.split("");
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!;
    const next = chars[i + 1] ?? "";
    const next2 = chars[i + 2] ?? "";

    // Digraphs first
    if (c === "c" && next === "h" && (next2 === "e" || next2 === "i")) {
      out += "k";
      i += 1; // skip h
      continue;
    }
    if (c === "g" && next === "h" && (next2 === "e" || next2 === "i")) {
      out += "g";
      i += 1; // skip h
      continue;
    }
    if (c === "c" && (next === "e" || next === "i")) {
      out += "ch";
      continue;
    }
    if (c === "g" && (next === "e" || next === "i")) {
      out += "j";
      continue;
    }

    // Single character mappings
    switch (c) {
      case "ă":
      case "â":
      case "î":
        out += "uh";
        break;
      case "ș":
        out += "sh";
        break;
      case "ț":
        out += "ts";
        break;
      case "a":
        out += "ah";
        break;
      case "e":
        out += "eh";
        break;
      case "i":
        // word-final unstressed "i" is whispered → mark with apostrophe
        if (i === chars.length - 1 && i > 0 && !isVowel(chars[i - 1] ?? "")) {
          out += "'";
        } else {
          out += "ee";
        }
        break;
      case "o":
        out += "oh";
        break;
      case "u":
        out += "oo";
        break;
      case "j":
        out += "zh";
        break;
      case "h":
        out += "h";
        break;
      case "r":
        out += "r";
        break;
      case "y":
        out += "y";
        break;
      default:
        // b, c, d, f, g, k, l, m, n, p, q, s, t, v, w, x, z, etc.
        out += c;
    }
  }
  return out;
}

/** Public: produce a friendly pronunciation guide for a Romanian word or phrase. */
export function pronounce(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (!trimmed) return "";

  // Whole-phrase override?
  const lowerWhole = trimmed.toLowerCase();
  if (STRESS_OVERRIDES[lowerWhole]) return STRESS_OVERRIDES[lowerWhole];

  // Tokenize, preserving punctuation.
  return trimmed
    .split(/(\s+|[.,!?;:()"'])/g)
    .map((tok) => {
      if (!tok || /^\s+$/.test(tok) || /^[.,!?;:()"']$/.test(tok)) return tok;
      return transcribeWord(tok);
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Romanian content for the landing-page CinematicMatrix component.
 *
 * Stage III shows a "verb cloud" — 32 high-frequency verbs at three weight
 * tiers (3 = biggest/most central, 1 = small). Stage IV shows the same
 * for vocabulary nouns/adjectives.
 *
 * Each entry uses `text` so the extractor's TYPED_FIELDS pattern catches
 * it automatically. Using a tuple form (e.g. ["a fi", 3]) would render
 * fine at runtime but would silently skip extraction — every click on a
 * verb in stage III would fall back to runtime TTS.
 */

import type { CinematicData } from "../../types";

export const CINEMATIC: CinematicData = {
  verbs: [
    { text: "a fi", weight: 3 }, { text: "a avea", weight: 3 },
    { text: "a face", weight: 3 }, { text: "a vorbi", weight: 3 },
    { text: "a merge", weight: 2 }, { text: "a veni", weight: 2 },
    { text: "a vrea", weight: 2 }, { text: "a putea", weight: 2 },
    { text: "a ști", weight: 2 }, { text: "a vedea", weight: 2 },
    { text: "a da", weight: 2 }, { text: "a lua", weight: 2 },
    { text: "a mânca", weight: 1 }, { text: "a bea", weight: 1 },
    { text: "a dormi", weight: 1 }, { text: "a citi", weight: 1 },
    { text: "a scrie", weight: 1 }, { text: "a înțelege", weight: 1 },
    { text: "a plăcea", weight: 1 }, { text: "a cumpăra", weight: 1 },
    { text: "a pleca", weight: 1 }, { text: "a sta", weight: 1 },
    { text: "a învăța", weight: 1 }, { text: "a plăti", weight: 1 },
    { text: "a lucra", weight: 1 }, { text: "a locui", weight: 1 },
    { text: "a deschide", weight: 1 }, { text: "a închide", weight: 1 },
    { text: "a spune", weight: 1 }, { text: "a ajunge", weight: 1 },
    { text: "a chema", weight: 1 }, { text: "a suna", weight: 1 },
  ],
  vocab: [
    { text: "apă", weight: 3 }, { text: "pâine", weight: 3 },
    { text: "cafea", weight: 3 }, { text: "timp", weight: 3 },
    { text: "om", weight: 3 },
    { text: "casă", weight: 2 }, { text: "lume", weight: 2 },
    { text: "zi", weight: 2 }, { text: "noapte", weight: 2 },
    { text: "prieten", weight: 2 }, { text: "copil", weight: 2 },
    { text: "mare", weight: 2 }, { text: "munte", weight: 2 },
    { text: "soare", weight: 2 }, { text: "lună", weight: 2 },
    { text: "fereastră", weight: 1 }, { text: "pădure", weight: 1 },
    { text: "cer", weight: 1 }, { text: "mâncare", weight: 1 },
    { text: "carte", weight: 1 }, { text: "scaun", weight: 1 },
    { text: "masă", weight: 1 }, { text: "bere", weight: 1 },
    { text: "vin", weight: 1 }, { text: "lapte", weight: 1 },
    { text: "sat", weight: 1 }, { text: "oraș", weight: 1 },
    { text: "drum", weight: 1 }, { text: "tren", weight: 1 },
    { text: "mic", weight: 1 }, { text: "frumos", weight: 1 },
    { text: "rece", weight: 1 }, { text: "cald", weight: 1 },
    { text: "bun", weight: 1 }, { text: "nou", weight: 1 },
    { text: "vechi", weight: 1 }, { text: "greu", weight: 1 },
    { text: "ușor", weight: 1 }, { text: "azi", weight: 1 },
    { text: "mâine", weight: 1 },
  ],
};

import type { MatrixData, MatrixRow } from "../types";

// ─── Conjugation data ───────────────────────────────────────────
//
// For every verb we store:
//   • participle      — used to build the past (perfect compus)
//   • present[6]      — eu / tu / el / noi / voi / ei
//   • subjunctive[6]  — what comes after "să" / "o să" (drives the future)
//
// Most verbs have subjunctive[i] === present[i] for i ∈ {0,1,3,4} and
// only differ in 3rd person — but a fi, a avea, a vrea etc. break that
// rule, so we store the full paradigm and never try to derive it.

export interface VerbConjugation {
    infinitive: string;
    /** Translation key (and English fallback). Used for the dropdown label. */
    meaning: string;
    participle: string;
    present: readonly [string, string, string, string, string, string];
    subjunctive: readonly [string, string, string, string, string, string];
}

export const ALL_CONJUGATIONS: readonly VerbConjugation[] = [
    // The two foundation verbs come first — they drive most of the language.
    { infinitive: "a fi",        meaning: "to be",
        participle: "fost",
        present:     ["sunt", "ești", "este", "suntem", "sunteți", "sunt"],
        subjunctive: ["fiu",  "fii",  "fie",  "fim",    "fiți",    "fie"] },

    { infinitive: "a avea",      meaning: "to have",
        participle: "avut",
        present:     ["am", "ai", "are",  "avem", "aveți", "au"],
        subjunctive: ["am", "ai", "aibă", "avem", "aveți", "aibă"] },

    // Then the 30 high-frequency verbs.
    { infinitive: "a face",      meaning: "to do / make",
        participle: "făcut",
        present:     ["fac", "faci", "face", "facem", "faceți", "fac"],
        subjunctive: ["fac", "faci", "facă", "facem", "faceți", "facă"] },

    { infinitive: "a merge",     meaning: "to go",
        participle: "mers",
        present:     ["merg", "mergi", "merge",  "mergem", "mergeți", "merg"],
        subjunctive: ["merg", "mergi", "meargă", "mergem", "mergeți", "meargă"] },

    { infinitive: "a veni",      meaning: "to come",
        participle: "venit",
        present:     ["vin", "vii", "vine", "venim", "veniți", "vin"],
        subjunctive: ["vin", "vii", "vină", "venim", "veniți", "vină"] },

    { infinitive: "a vorbi",     meaning: "to speak",
        participle: "vorbit",
        present:     ["vorbesc", "vorbești", "vorbește",  "vorbim", "vorbiți", "vorbesc"],
        subjunctive: ["vorbesc", "vorbești", "vorbească", "vorbim", "vorbiți", "vorbească"] },

    { infinitive: "a lucra",     meaning: "to work",
        participle: "lucrat",
        present:     ["lucrez", "lucrezi", "lucrează", "lucrăm", "lucrați", "lucrează"],
        subjunctive: ["lucrez", "lucrezi", "lucreze",  "lucrăm", "lucrați", "lucreze"] },

    { infinitive: "a locui",     meaning: "to live (reside)",
        participle: "locuit",
        present:     ["locuiesc", "locuiești", "locuiește",  "locuim", "locuiți", "locuiesc"],
        subjunctive: ["locuiesc", "locuiești", "locuiască", "locuim", "locuiți", "locuiască"] },

    { infinitive: "a vrea",      meaning: "to want",
        participle: "vrut",
        present:     ["vreau", "vrei", "vrea", "vrem", "vreți", "vor"],
        subjunctive: ["vreau", "vrei", "vrea", "vrem", "vreți", "vrea"] },

    { infinitive: "a putea",     meaning: "can / to be able",
        participle: "putut",
        present:     ["pot", "poți", "poate", "putem", "puteți", "pot"],
        subjunctive: ["pot", "poți", "poată", "putem", "puteți", "poată"] },

    { infinitive: "a ști",       meaning: "to know (a fact)",
        participle: "știut",
        present:     ["știu", "știi", "știe", "știm", "știți", "știu"],
        subjunctive: ["știu", "știi", "știe", "știm", "știți", "știe"] },

    { infinitive: "a vedea",     meaning: "to see",
        participle: "văzut",
        present:     ["văd", "vezi", "vede", "vedem", "vedeți", "văd"],
        subjunctive: ["văd", "vezi", "vadă", "vedem", "vedeți", "vadă"] },

    { infinitive: "a da",        meaning: "to give",
        participle: "dat",
        present:     ["dau", "dai", "dă",  "dăm", "dați", "dau"],
        subjunctive: ["dau", "dai", "dea", "dăm", "dați", "dea"] },

    { infinitive: "a lua",       meaning: "to take",
        participle: "luat",
        present:     ["iau", "iei", "ia", "luăm", "luați", "iau"],
        subjunctive: ["iau", "iei", "ia", "luăm", "luați", "ia"] },

    { infinitive: "a mânca",     meaning: "to eat",
        participle: "mâncat",
        present:     ["mănânc", "mănânci", "mănâncă", "mâncăm", "mâncați", "mănâncă"],
        subjunctive: ["mănânc", "mănânci", "mănânce", "mâncăm", "mâncați", "mănânce"] },

    { infinitive: "a bea",       meaning: "to drink",
        participle: "băut",
        present:     ["beau", "bei", "bea", "bem", "beți", "beau"],
        subjunctive: ["beau", "bei", "bea", "bem", "beți", "bea"] },

    { infinitive: "a dormi",     meaning: "to sleep",
        participle: "dormit",
        present:     ["dorm", "dormi", "doarme",  "dormim", "dormiți", "dorm"],
        subjunctive: ["dorm", "dormi", "doarmă", "dormim", "dormiți", "doarmă"] },

    { infinitive: "a citi",      meaning: "to read",
        participle: "citit",
        present:     ["citesc", "citești", "citește",   "citim", "citiți", "citesc"],
        subjunctive: ["citesc", "citești", "citească", "citim", "citiți", "citească"] },

    { infinitive: "a scrie",     meaning: "to write",
        participle: "scris",
        present:     ["scriu", "scrii", "scrie", "scriem", "scrieți", "scriu"],
        subjunctive: ["scriu", "scrii", "scrie", "scriem", "scrieți", "scrie"] },

    { infinitive: "a înțelege",  meaning: "to understand",
        participle: "înțeles",
        present:     ["înțeleg", "înțelegi", "înțelege",   "înțelegem", "înțelegeți", "înțeleg"],
        subjunctive: ["înțeleg", "înțelegi", "înțeleagă", "înțelegem", "înțelegeți", "înțeleagă"] },

    { infinitive: "a cumpăra",   meaning: "to buy",
        participle: "cumpărat",
        present:     ["cumpăr", "cumperi", "cumpără", "cumpărăm", "cumpărați", "cumpără"],
        subjunctive: ["cumpăr", "cumperi", "cumpere", "cumpărăm", "cumpărați", "cumpere"] },

    { infinitive: "a pleca",     meaning: "to leave",
        participle: "plecat",
        present:     ["plec", "pleci", "pleacă", "plecăm", "plecați", "pleacă"],
        subjunctive: ["plec", "pleci", "plece",  "plecăm", "plecați", "plece"] },

    { infinitive: "a sta",       meaning: "to stay / sit",
        participle: "stat",
        present:     ["stau", "stai", "stă",  "stăm", "stați", "stau"],
        subjunctive: ["stau", "stai", "stea", "stăm", "stați", "stea"] },

    { infinitive: "a învăța",    meaning: "to learn / teach",
        participle: "învățat",
        present:     ["învăț", "înveți", "învață", "învățăm", "învățați", "învață"],
        subjunctive: ["învăț", "înveți", "învețe", "învățăm", "învățați", "învețe"] },

    { infinitive: "a plăti",     meaning: "to pay",
        participle: "plătit",
        present:     ["plătesc", "plătești", "plătește",   "plătim", "plătiți", "plătesc"],
        subjunctive: ["plătesc", "plătești", "plătească", "plătim", "plătiți", "plătească"] },

    { infinitive: "a deschide",  meaning: "to open",
        participle: "deschis",
        present:     ["deschid", "deschizi", "deschide", "deschidem", "deschideți", "deschid"],
        subjunctive: ["deschid", "deschizi", "deschidă", "deschidem", "deschideți", "deschidă"] },

    { infinitive: "a închide",   meaning: "to close",
        participle: "închis",
        present:     ["închid", "închizi", "închide", "închidem", "închideți", "închid"],
        subjunctive: ["închid", "închizi", "închidă", "închidem", "închideți", "închidă"] },

    { infinitive: "a spune",     meaning: "to say / tell",
        participle: "spus",
        present:     ["spun", "spui", "spune", "spunem", "spuneți", "spun"],
        subjunctive: ["spun", "spui", "spună", "spunem", "spuneți", "spună"] },

    { infinitive: "a ajunge",    meaning: "to arrive",
        participle: "ajuns",
        present:     ["ajung", "ajungi", "ajunge", "ajungem", "ajungeți", "ajung"],
        subjunctive: ["ajung", "ajungi", "ajungă", "ajungem", "ajungeți", "ajungă"] },

    { infinitive: "a chema",     meaning: "to call / be named",
        participle: "chemat",
        present:     ["chem", "chemi", "cheamă", "chemăm", "chemați", "cheamă"],
        subjunctive: ["chem", "chemi", "cheme",  "chemăm", "chemați", "cheme"] },

    { infinitive: "a suna",      meaning: "to call (phone)",
        participle: "sunat",
        present:     ["sun", "suni", "sună", "sunăm", "sunați", "sună"],
        subjunctive: ["sun", "suni", "sune", "sunăm", "sunați", "sune"] },

    { infinitive: "a asculta",   meaning: "to listen",
        participle: "ascultat",
        present:     ["ascult", "asculți", "ascultă", "ascultăm", "ascultați", "ascultă"],
        subjunctive: ["ascult", "asculți", "asculte", "ascultăm", "ascultați", "asculte"] },
] as const;

// ─── Matrix generator ──────────────────────────────────────────

const PRONOUN_UPPER = ["Eu", "Tu", "El", "Noi", "Voi", "Ei"] as const;
const PRONOUN_LOWER = ["eu", "tu", "el", "noi", "voi", "ei"] as const;
const AUX_PAST       = ["am", "ai", "a",  "am",  "ați", "au"] as const;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Build a 3×3 matrix (future / present / past × question / affirmative /
 * negative) for any verb. Each cell holds 6 lines — one per person.
 *
 * The forms here intentionally match the conventions used in the static
 * matrices in `matrices.ts` so that hand-written and generated matrices
 * look identical to the reader.
 */
export function buildMatrix(verb: VerbConjugation, title: string): MatrixData {
    const futureA: string[] = [];
    const futureN: string[] = [];
    const futureQ: string[] = [];
    const presA: string[] = [];
    const presN: string[] = [];
    const presQ: string[] = [];
    const pastA: string[] = [];
    const pastN: string[] = [];
    const pastQ: string[] = [];

    for (let i = 0; i < 6; i++) {
        const subj = verb.subjunctive[i];
        const pres = verb.present[i];
        const aux  = AUX_PAST[i];
        const PU   = PRONOUN_UPPER[i];
        const PL   = PRONOUN_LOWER[i];
        const part = verb.participle;

        // Future = "o să" + subjunctive. No pronoun in the question — matches
        // the existing static matrices (MATRIX_LUCRA_FULL etc.).
        futureA.push(`${PU} o să ${subj}.`);
        futureN.push(`N-o să ${subj}.`);
        futureQ.push(`O să ${subj}?`);

        // Present indicative.
        presA.push(`${PU} ${pres}.`);
        presN.push(`${PU} nu ${pres}.`);
        presQ.push(`${cap(pres)} ${PL}?`);

        // Past = aux ("am/ai/a/am/ați/au") + participle.
        pastA.push(`${PU} ${aux} ${part}.`);
        pastN.push(`${PU} nu ${aux} ${part}.`);
        pastQ.push(`${cap(aux)} ${part} ${PL}?`);
    }

    const rows: MatrixRow[] = [
        {
            tenseName: "Future", tenseSub: "o să …",
            question:    { ro: futureQ },
            affirmative: { ro: futureA },
            negative:    { ro: futureN },
        },
        {
            tenseName: "Present", tenseSub: "indicativ",
            question:    { ro: presQ },
            affirmative: { ro: presA },
            negative:    { ro: presN },
        },
        {
            tenseName: "Past", tenseSub: "perfect compus",
            question:    { ro: pastQ },
            affirmative: { ro: pastA },
            negative:    { ro: pastN },
        },
    ];

    return { title, rows };
}
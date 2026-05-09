import type { OnboardingData } from "../../types";

/**
 * Romanian onboarding data — the language-specific content for the
 * 5-step first-contact flow. UI chrome lives in engine locales; only
 * the content here is per-language.
 *
 * Cognates are 24 high-recognition words: -ție / -tate suffixes (direct
 * Latin parallels), concrete objects, recognisable adjectives, day-one
 * vocabulary. Enough variety without overwhelming a 90-second slot.
 */
export const ONBOARDING: OnboardingData = {
  cognates: [
    // Concepts & abstractions — recognisable suffix patterns
    { text: "informație",    en: "information" },
    { text: "televiziune",   en: "television" },
    { text: "universitate",  en: "university" },
    { text: "comunicație",   en: "communication" },
    { text: "conversație",   en: "conversation" },
    { text: "naționalitate", en: "nationality" },

    // Concrete objects & places
    { text: "restaurant",    en: "restaurant" },
    { text: "telefon",       en: "telephone" },
    { text: "hotel",         en: "hotel" },
    { text: "aeroport",      en: "airport" },
    { text: "bancă",         en: "bank" },
    { text: "supermarket",   en: "supermarket" },

    // Adjectives — recognisable across Romance languages
    { text: "important",     en: "important" },
    { text: "interesant",    en: "interesting" },
    { text: "modern",        en: "modern" },
    { text: "natural",       en: "natural" },
    { text: "fantastic",     en: "fantastic" },
    { text: "perfect",       en: "perfect" },

    // Day-one domain words
    { text: "muzică",        en: "music" },
    { text: "film",          en: "film / movie" },
    { text: "cafea",         en: "coffee" },
    { text: "salată",        en: "salad" },
    { text: "doctor",        en: "doctor" },
    { text: "internet",      en: "internet" },
  ],

  firstVerb: {
    infinitive: "a vorbi",
    meaning: "to speak",
    forms: [
      { tenseLabel: "Future",  text: "Eu o să vorbesc.", en: "I will speak." },
      { tenseLabel: "Present", text: "Eu vorbesc.",       en: "I speak."      },
      { tenseLabel: "Past",    text: "Eu am vorbit.",     en: "I spoke."      },
    ],
  },

  firstSentence: {
    text: "Eu vorbesc.",
    en:   "I speak.",
  },
};

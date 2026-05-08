import type { NumberItem, PhraseItem } from "../../../types";

export const NUMBERS_0_10: NumberItem[] = [
  { num: 0, word: "zero" }, { num: 1, word: "unu / una" }, { num: 2, word: "doi / două" },
  { num: 3, word: "trei" }, { num: 4, word: "patru" }, { num: 5, word: "cinci" },
  { num: 6, word: "șase" }, { num: 7, word: "șapte" }, { num: 8, word: "opt" },
  { num: 9, word: "nouă" }, { num: 10, word: "zece" },
];

export const NUMBERS_11_19: NumberItem[] = [
  { num: 11, word: "unsprezece" }, { num: 12, word: "doisprezece" },
  { num: 13, word: "treisprezece" }, { num: 14, word: "paisprezece" },
  { num: 15, word: "cincisprezece" }, { num: 16, word: "șaisprezece" },
  { num: 17, word: "șaptesprezece" }, { num: 18, word: "optsprezece" },
  { num: 19, word: "nouăsprezece" },
];

export const NUMBERS_TENS: NumberItem[] = [
  { num: 20, word: "douăzeci" }, { num: 30, word: "treizeci" },
  { num: 40, word: "patruzeci" }, { num: 50, word: "cincizeci" },
  { num: 60, word: "șaizeci" }, { num: 70, word: "șaptezeci" },
  { num: 80, word: "optzeci" }, { num: 90, word: "nouăzeci" },
  { num: 100, word: "o sută" }, { num: 1000, word: "o mie" },
];

export const SEASONS = [
  { icon: "❀", ro: "primăvară", en: "spring" },
  { icon: "☀︎", ro: "vară", en: "summer" },
  { icon: "❦", ro: "toamnă", en: "autumn" },
  { icon: "❄︎", ro: "iarnă", en: "winter" },
];

export const WEATHER_PHRASES: PhraseItem[] = [
  { ro: "E cald.", en: "It’s hot." },
  { ro: "E frig.", en: "It’s cold." },
  { ro: "Plouă.", en: "It’s raining." },
  { ro: "Ninge.", en: "It’s snowing." },
  { ro: "E soare.", en: "It’s sunny." },
  { ro: "E vânt.", en: "It’s windy." },
];

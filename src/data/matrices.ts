import type { MatrixData, FillerItem, PhraseItem, TestItem } from "../types";

// ─── Lesson 3 Matrices ──────────────────────────────────────────

export const MATRIX_VORBI_EU: MatrixData = {
  title: "A vorbi — to speak (the “eu” row)",
  rows: [
    {
      tenseName: "Future", tenseSub: "colloquial",
      question: { ro: ["O să vorbesc?"], en: ["Will I speak?"] },
      affirmative: { ro: ["Eu o să vorbesc."], en: ["I will speak."] },
      negative: { ro: ["N-o să vorbesc."], en: ["I won’t speak."] },
    },
    {
      tenseName: "Present", tenseSub: "indicative",
      question: { ro: ["Vorbesc eu?"], en: ["Do I speak?"] },
      affirmative: { ro: ["Eu vorbesc."], en: ["I speak."] },
      negative: { ro: ["Eu nu vorbesc."], en: ["I don’t speak."] },
    },
    {
      tenseName: "Past", tenseSub: "perfect compus",
      question: { ro: ["Am vorbit eu?"], en: ["Did I speak?"] },
      affirmative: { ro: ["Eu am vorbit."], en: ["I spoke."] },
      negative: { ro: ["Eu nu am vorbit."], en: ["I didn’t speak."] },
    },
  ],
};

export const MATRIX_LUCRA_FULL: MatrixData = {
  title: "A lucra — to work (all six persons)",
  rows: [
    {
      tenseName: "Future",
      question: { ro: ["O să lucrez?", "O să lucrezi?", "O să lucreze?", "O să lucrăm?", "O să lucrați?", "O să lucreze?"] },
      affirmative: { ro: ["Eu o să lucrez.", "Tu o să lucrezi.", "El o să lucreze.", "Noi o să lucrăm.", "Voi o să lucrați.", "Ei o să lucreze."] },
      negative: { ro: ["N-o să lucrez.", "N-o să lucrezi.", "N-o să lucreze.", "N-o să lucrăm.", "N-o să lucrați.", "N-o să lucreze."] },
    },
    {
      tenseName: "Present",
      question: { ro: ["Lucrez eu?", "Lucrezi tu?", "Lucrează el?", "Lucrăm noi?", "Lucrați voi?", "Lucrează ei?"] },
      affirmative: { ro: ["Eu lucrez.", "Tu lucrezi.", "El lucrează.", "Noi lucrăm.", "Voi lucrați.", "Ei lucrează."] },
      negative: { ro: ["Eu nu lucrez.", "Tu nu lucrezi.", "El nu lucrează.", "Noi nu lucrăm.", "Voi nu lucrați.", "Ei nu lucrează."] },
    },
    {
      tenseName: "Past",
      question: { ro: ["Am lucrat eu?", "Ai lucrat tu?", "A lucrat el?", "Am lucrat noi?", "Ați lucrat voi?", "Au lucrat ei?"] },
      affirmative: { ro: ["Eu am lucrat.", "Tu ai lucrat.", "El a lucrat.", "Noi am lucrat.", "Voi ați lucrat.", "Ei au lucrat."] },
      negative: { ro: ["Eu nu am lucrat.", "Tu nu ai lucrat.", "El nu a lucrat.", "Noi nu am lucrat.", "Voi nu ați lucrat.", "Ei nu au lucrat."] },
    },
  ],
};

export const MATRIX_FACE_FULL: MatrixData = {
  title: "A face — to do / make (all six persons)",
  rows: [
    {
      tenseName: "Future",
      question: { ro: ["O să fac?", "O să faci?", "O să facă?", "O să facem?", "O să faceți?", "O să facă?"] },
      affirmative: { ro: ["Eu o să fac.", "Tu o să faci.", "El o să facă.", "Noi o să facem.", "Voi o să faceți.", "Ei o să facă."] },
      negative: { ro: ["N-o să fac.", "N-o să faci.", "N-o să facă.", "N-o să facem.", "N-o să faceți.", "N-o să facă."] },
    },
    {
      tenseName: "Present",
      question: { ro: ["Fac eu?", "Faci tu?", "Face el?", "Facem noi?", "Faceți voi?", "Fac ei?"] },
      affirmative: { ro: ["Eu fac.", "Tu faci.", "El face.", "Noi facem.", "Voi faceți.", "Ei fac."] },
      negative: { ro: ["Eu nu fac.", "Tu nu faci.", "El nu face.", "Noi nu facem.", "Voi nu faceți.", "Ei nu fac."] },
    },
    {
      tenseName: "Past",
      question: { ro: ["Am făcut eu?", "Ai făcut tu?", "A făcut el?", "Am făcut noi?", "Ați făcut voi?", "Au făcut ei?"] },
      affirmative: { ro: ["Eu am făcut.", "Tu ai făcut.", "El a făcut.", "Noi am făcut.", "Voi ați făcut.", "Ei au făcut."] },
      negative: { ro: ["Eu nu am făcut.", "Tu nu ai făcut.", "El nu a făcut.", "Noi nu am făcut.", "Voi nu ați făcut.", "Ei nu au făcut."] },
    },
  ],
};

export const MATRIX_FI: MatrixData = {
  title: "A fi — to be",
  rows: [
    {
      tenseName: "Future", tenseSub: "o să fiu",
      question: { ro: ["O să fiu?", "O să fii?", "O să fie?", "O să fim?", "O să fiți?", "O să fie?"] },
      affirmative: { ro: ["O să fiu.", "O să fii.", "O să fie.", "O să fim.", "O să fiți.", "O să fie."] },
      negative: { ro: ["N-o să fiu.", "N-o să fii.", "N-o să fie.", "N-o să fim.", "N-o să fiți.", "N-o să fie."] },
    },
    {
      tenseName: "Present", tenseSub: "sunt / ești / e",
      question: { ro: ["Sunt eu?", "Ești tu?", "Este el?", "Suntem noi?", "Sunteți voi?", "Sunt ei?"] },
      affirmative: { ro: ["Eu sunt.", "Tu ești.", "El / ea este (e).", "Noi suntem.", "Voi sunteți.", "Ei / ele sunt."] },
      negative: { ro: ["Nu sunt.", "Nu ești.", "Nu este.", "Nu suntem.", "Nu sunteți.", "Nu sunt."] },
    },
    {
      tenseName: "Past", tenseSub: "am fost",
      question: { ro: ["Am fost eu?", "Ai fost tu?", "A fost el?", "Am fost noi?", "Ați fost voi?", "Au fost ei?"] },
      affirmative: { ro: ["Eu am fost.", "Tu ai fost.", "El / ea a fost.", "Noi am fost.", "Voi ați fost.", "Ei / ele au fost."] },
      negative: { ro: ["Nu am fost.", "Nu ai fost.", "Nu a fost.", "Nu am fost.", "Nu ați fost.", "Nu au fost."] },
    },
  ],
};

export const MATRIX_AVEA: MatrixData = {
  title: "A avea — to have",
  rows: [
    {
      tenseName: "Future", tenseSub: "o să am",
      question: { ro: ["O să am?", "O să ai?", "O să aibă?", "O să avem?", "O să aveți?", "O să aibă?"] },
      affirmative: { ro: ["O să am.", "O să ai.", "O să aibă.", "O să avem.", "O să aveți.", "O să aibă."] },
      negative: { ro: ["N-o să am.", "N-o să ai.", "N-o să aibă.", "N-o să avem.", "N-o să aveți.", "N-o să aibă."] },
    },
    {
      tenseName: "Present", tenseSub: "am / ai / are",
      question: { ro: ["Am eu?", "Ai tu?", "Are el?", "Avem noi?", "Aveți voi?", "Au ei?"] },
      affirmative: { ro: ["Eu am.", "Tu ai.", "El / ea are.", "Noi avem.", "Voi aveți.", "Ei / ele au."] },
      negative: { ro: ["Nu am.", "Nu ai.", "Nu are.", "Nu avem.", "Nu aveți.", "Nu au."] },
    },
    {
      tenseName: "Past", tenseSub: "am avut",
      question: { ro: ["Am avut eu?", "Ai avut tu?", "A avut el?", "Am avut noi?", "Ați avut voi?", "Au avut ei?"] },
      affirmative: { ro: ["Eu am avut.", "Tu ai avut.", "El / ea a avut.", "Noi am avut.", "Voi ați avut.", "Ei / ele au avut."] },
      negative: { ro: ["Nu am avut.", "Nu ai avut.", "Nu a avut.", "Nu am avut.", "Nu ați avut.", "Nu au avut."] },
    },
  ],
};

// ─── Lesson 16 Data ─────────────────────────────────────────────

export const FILLER_WORDS: FillerItem[] = [
  { word: "deci", meaning: "so, well, therefore", example: "Deci, ce facem?" },
  { word: "păi", meaning: "well, um", example: "Păi, nu știu." },
  { word: "uite", meaning: "look, see", example: "Uite ce frumos!" },
  { word: "adică", meaning: "I mean, that is", example: "Adică, nu e chiar așa." },
  { word: "bine", meaning: "OK, fine, alright", example: "Bine, hai." },
  { word: "na", meaning: "well… (mid-sentence hesitation). Note: 'eeeh, na?' = what a surprise! / 'eeeh, na!' = whatever, doesn’t matter. (Avoid 'Na, ia-l!' for 'here, take this' — that sounds rural; use 'poftim' instead.)", example: "Am vorbit cu el, dar na, nu știu dacă a înțeles." },
  { word: "poftim", meaning: "here, take it / pardon? — didn’t catch that (with question intonation)", example: "Poftim, ia cartea! · Poftim? Mai spuneți o dată." },
  { word: "mda", meaning: "yeah, I guess", example: "Mda, ai dreptate." },
  { word: "știi", meaning: "you know", example: "E complicat, știi?" },
];

export const EXPRESSIONS: PhraseItem[] = [
  { ro: "Nu-i bai!", en: "No problem!" },
  { ro: "Noroc!", en: "Cheers! / Good luck!" },
  { ro: "Poftă bună!", en: "Bon appétit!" },
  { ro: "Nu-mi vine să cred!", en: "I can’t believe it!" },
  { ro: "Doamne ferește!", en: "God forbid!" },
  { ro: "Las-o baltă!", en: "Let it go! / Drop it!" },
  { ro: "Ce mai faci?", en: "How have you been?" },
  { ro: "Nu face nimic.", en: "It doesn’t matter." },
];

export const COMPLEX_SENTENCES: PhraseItem[] = [
  { ro: "Am plecat pentru că era târziu.", en: "I left because it was late." },
  { ro: "Deși era obosit, a continuat.", en: "Although tired, he continued." },
  { ro: "Nu știu dacă vine sau nu.", en: "I don’t know if he’s coming." },
  { ro: "Cred că are dreptate.", en: "I think he’s right." },
  { ro: "Mi-a spus că o să vină mai târziu.", en: "He told me he’ll come later." },
  { ro: "Cu cât învăț mai mult, cu atât înțeleg mai bine.", en: "The more I learn, the more I understand." },
];

export const GRAND_REVIEW_TESTS: TestItem[] = [
  { question: "1. I spoke Romanian yesterday.", answer: "Am vorbit românește ieri." },
  { question: "2. She doesn’t have time because she’s working.", answer: "Ea nu are timp pentru că lucrează." },
  { question: "3. If I had money, I would travel to Romania.", answer: "Dacă aș avea bani, aș călători în România." },
  { question: "4. Let’s eat something! I’m hungry.", answer: "Hai să mâncăm ceva! Mi-e foame." },
  { question: "5. Nobody knows anything.", answer: "Nimeni nu știe nimic." },
  { question: "6. I like Romanian food, especially sarmale.", answer: "Îmi place mâncarea românească, mai ales sarmalele." },
  { question: "7. Can I pay by card?", answer: "Pot să plătesc cu cardul?" },
  { question: "8. I wake up at 7 and I feel good.", answer: "Mă trezesc la 7 și mă simt bine." },
  { question: "9. When I was young, I used to live in the village.", answer: "Când eram mic, locuiam la sat." },
  { question: "10. It’s 3:30. I must leave now.", answer: "E ora trei și jumătate. Trebuie să plec acum." },
  { question: "11. I miss you. (the uniquely Romanian way)", answer: "Mi-e dor de tine." },
  { question: "12. The book that I’m reading is good.", answer: "Cartea pe care o citesc e bună." },
];

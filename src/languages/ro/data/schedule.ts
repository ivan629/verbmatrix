import type { PrincipleItem, ScheduleItem, NavGroup } from "../../../types";

export const CORE_PRINCIPLES: PrincipleItem[] = [
  { num: "1", title: "Remove the fear", description: "Romanian is phonetic, Romance-based, full of cognates. The barrier is emotional, not intellectual." },
  { num: "2", title: "Freedom before correctness", description: "Speak from minute one. Wrong endings don't matter yet. Communication first, perfection later." },
  { num: "3", title: "The multiplication table", description: "Three tenses × three forms = nine sentence types. Master them, generate thousands of sentences." },
  { num: "4", title: "Automatism", description: "Drill until structures fire without thinking — like knowing 7×8 = 56 instantly." },
  { num: "5", title: "High-frequency focus", description: "Three hundred words = ninety percent of speech. Thirty verbs cover all daily actions." },
  { num: "6", title: "Contextual learning", description: "Every word inside a real sentence. Never isolated flashcards. Always in context." },
  { num: "7", title: "Regularity over volume", description: "Five minutes, five times a day, beats one hour once a week. Short bursts wire the brain." },
];

export const LIBERATING_TRUTHS: PrincipleItem[] = [
  { num: "1", title: "You already speak a language", description: "Your brain already has the machinery. We're just installing new software." },
  { num: "2", title: "Romanian is easy for English speakers", description: "It's a Romance language. Thousands of cognates: informație, situație, televiziune. And it's phonetic — no silent letters." },
  { num: "3", title: "Mistakes are the method", description: "Wrong Romanian is infinitely better than no Romanian. Every mistake is a micro-lesson." },
];

export const KEY_PATTERNS: PrincipleItem[] = [
  { num: "?", title: "Question", description: "Invert or use rising intonation. Vorbesc eu?" },
  { num: "+", title: "Affirmative", description: "Subject + verb. Eu vorbesc." },
  { num: "−", title: "Negative", description: "Add NU before the verb. Eu nu vorbesc." },
];

export const SCHEDULE_ITEMS: ScheduleItem[] = [
  { days: "Days 1–2", task: "L0 + L1: Warm-up. Five special characters. Sounds aloud." },
  { days: "Days 3–4", task: "L2: Pronouns + ten question words. Demonstratives. The 'pe' rule." },
  { days: "Days 5–6", task: "L3: **The Matrix.** Drill five times daily, five minutes each." },
  { days: "Days 7–8", task: "L4: **a fi** — all forms until automatic." },
  { days: "Days 9–10", task: "L5: **a avea** + 'îmi place' + past participles." },
  { days: "Days 11–13", task: "L6: 32 verbs. Run ten per day through the matrix." },
  { days: "Days 14–15", task: "L7: Articles + gender + vocative + genitive." },
  { days: "Days 16–17", task: "L8: Adjectives + possessives. Describe ten things you can see." },
  { days: "Days 18–19", task: "L9: Numbers, time, days, months." },
  { days: "Days 20–21", task: "L10–11: Prepositions, modals, 'Hai să…'" },
  { days: "Days 22–23", task: "L12: Imperfect. 'Când eram mic…'" },
  { days: "Days 24–25", task: "L13–14: Commands and the subjunctive." },
  { days: "Days 26–28", task: "L15–16: Conditionals, reflexives, fillers, idioms." },
  { days: "Days 29–30", task: "Dialogues: read all 14 aloud, both roles." },
  { days: "Days 31–32", task: "Review: Grand Self-Test. Write your 'About Me'. Done." },
];

export const DAILY_PRACTICE: PrincipleItem[] = [
  { num: "☀︎", title: "Morning · 5 min", description: "Five verbs through the 9-cell matrix, aloud." },
  { num: "☼", title: "Midday · 5 min", description: "Review twenty vocabulary words inside sentences." },
  { num: "◐", title: "Afternoon · 5 min", description: "Read one dialogue aloud. Both roles." },
  { num: "☾", title: "Evening · 5 min", description: "Write five sentences about your day." },
];

export const NAV_GROUPS: NavGroup[] = [
  // ── The Practice group sits at the very top, on its own. The single
  //    `featured` link is the live drill engine the rest of the resource
  //    points back to. Visually distinct from every other nav item.
  {
    label: "Practice",
    links: [
      { href: "#matrix", label: "Practice Matrix", featured: true },
    ],
  },
  {
    label: "Foundations",
    links: [
      { href: "#rules", label: "Principles" },
      { href: "#L0", label: "Mindset" },
      { href: "#L1", label: "Sounds" },
      { href: "#L2", label: "Pronouns" },
    ],
  },
  {
    label: "Verbs",
    links: [
      { href: "#L3", label: "The Matrix" },
      { href: "#L4", label: "To Be — a fi" },
      { href: "#L5", label: "To Have — a avea" },
      { href: "#L6", label: "32 Core Verbs" },
    ],
  },
  {
    label: "Grammar",
    links: [
      { href: "#L7", label: "Articles & Nouns" },
      { href: "#L8", label: "Adjectives" },
      { href: "#L9", label: "Numbers & Time" },
      { href: "#L10", label: "Prepositions" },
      { href: "#L11", label: "Modals" },
    ],
  },
  {
    label: "Tenses",
    links: [
      { href: "#L12", label: "Imperfect" },
      { href: "#L13", label: "Commands" },
      { href: "#L14", label: "Subjunctive" },
      { href: "#L15", label: "Conditional" },
      { href: "#L16", label: "Advanced" },
      { href: "#L17", label: "Grand Review" },
    ],
  },
  {
    label: "Reference",
    links: [
      { href: "#vocab", label: "Vocabulary" },
      { href: "#dialogues", label: "Dialogues" },
      { href: "#schedule", label: "Study Plan" },
      { href: "#aboutme", label: "About Me" },
    ],
  },
];

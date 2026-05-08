import {
  LessonSection, SectionHeading, InfoBox, DrillBox, TestBox,
  PrincipleGrid, PsychBox, SoundGrid, DataTable, MonoBlock,
} from "../../../components/ui";
import { RO } from "../../../components/RO";
import { CORE_PRINCIPLES, LIBERATING_TRUTHS } from "../data/schedule";

// ─── Principles ─────────────────────────────────────────────────

export function LessonRules() {
  return (
    <LessonSection
      id="rules" num="★" tag="lesson_rules_tag"
      title="lesson_rules_title"
      subtitle="lesson_rules_subtitle"
    >
      <PrincipleGrid items={CORE_PRINCIPLES} />
    </LessonSection>
  );
}

// ─── Lesson 0 ───────────────────────────────────────────────────

export function Lesson0() {
  return (
    <LessonSection
      id="L0" num="0" tag="lesson_0_tag"
      title="lesson_0_title"
      subtitle="lesson_0_subtitle"
    >
      <PsychBox
        title="lesson_0_psych_title"
        questions={[
          "lesson_0_psych_q1",
          "lesson_0_psych_q2",
          "lesson_0_psych_q3",
          "lesson_0_psych_q4",
        ]}
        footer="lesson_0_psych_footer"
      />

      <SectionHeading>lesson_0_truths_heading</SectionHeading>
      <PrincipleGrid items={LIBERATING_TRUTHS} />

      <InfoBox variant="gold" title="lesson_0_contract_title">
        <p>“I will speak Romanian badly, bravely, and often — starting today.” Write it down. Sign it.</p>
      </InfoBox>

      <InfoBox variant="blue" title="lesson_0_why_title">
        <p>The goal is a <b>fireproof foundation</b> — a structural skeleton so strong that even if you stop for months, it never fully disappears.</p>
      </InfoBox>
    </LessonSection>
  );
}

// ─── Lesson 1 — Sounds ──────────────────────────────────────────

const SPECIAL_CHARS = [
  { symbol: "ă / Ă", pronunciation: "“uh” — like the a in “about”", description: "", example: "băiat (boy)", exampleWord: "băiat" },
  { symbol: "â / Â", pronunciation: "deeper “uh” — no English equivalent", description: "", example: "câine (dog)", exampleWord: "câine" },
  { symbol: "î / Î", pronunciation: "same sound as â — different position", description: "", example: "în (in)", exampleWord: "în" },
  { symbol: "ș", pronunciation: "“sh” — as in “show”", description: "", example: "școală (school)", exampleWord: "școală" },
  { symbol: "ț", pronunciation: "“ts” — as in “cats”", description: "", example: "țară (country)", exampleWord: "țară" },
];

const CONSONANT_COMBOS = [
  { symbol: "ce", pronunciation: "“che” — as in “check”", description: "", example: "ce (what)", exampleWord: "ce" },
  { symbol: "ci", pronunciation: "“chi” — as in “cheese”", description: "", example: "cinci (five)", exampleWord: "cinci" },
  { symbol: "che", pronunciation: "“ke” — as in “kept”", description: "", example: "chelner (waiter)", exampleWord: "chelner" },
  { symbol: "chi", pronunciation: "“ki” — as in “kid”", description: "", example: "chiar (really)", exampleWord: "chiar" },
  { symbol: "ge", pronunciation: "“je” — as in “jet”", description: "", example: "ger (frost)", exampleWord: "ger" },
  { symbol: "gi", pronunciation: "“ji” — as in “jingle”", description: "", example: "girafă (giraffe)", exampleWord: "girafă" },
  { symbol: "ghe", pronunciation: "“ghe” — as in “get”", description: "", example: "ghete (boots)", exampleWord: "ghete" },
  { symbol: "ghi", pronunciation: "“gi” — as in “give”", description: "", example: "ghid (guide)", exampleWord: "ghid" },
];

export function Lesson1() {
  return (
    <LessonSection
      id="L1" num="1" tag="lesson_1_tag"
      title="lesson_1_title"
      subtitle="lesson_1_subtitle"
    >
      <SectionHeading>lesson_1_h_special</SectionHeading>
      <SoundGrid items={SPECIAL_CHARS} />

      <InfoBox variant="blue" title="lesson_1_avi_title">
        <p><b>â</b> appears <i>inside</i> a word (<RO text="România" en="Romania" />). <b>î</b> appears at the <i>start or end</i> of a word (<RO text="în" en="in" />). They sound <b>exactly the same</b>.</p>
      </InfoBox>

      <SectionHeading>lesson_1_h_combos</SectionHeading>
      <SoundGrid items={CONSONANT_COMBOS} />

      <SectionHeading>lesson_1_h_vowels</SectionHeading>
      <DataTable
        headers={["Letter", "Sound", "Like English", "Example"]}
        rows={[
          ["a", "ah", "“father”", "apă (water)"],
          ["e", "eh", "“bed”", "este (is)"],
          ["i", "ee", "“see”", "iubi (to love)"],
          ["o", "oh", "“more”", "om (man)"],
          ["u", "oo", "“food”", "unu (one)"],
        ]}
        speakableCols={[3]}
      />

      <InfoBox variant="gold" title="lesson_1_stress_title">
        <p>Generally on the <b>second-to-last syllable</b> (about 80% of words). Unlike French, <b>every letter is pronounced</b>.</p>
      </InfoBox>

      <InfoBox variant="neutral" title="lesson_1_exceptions_title">
        <MonoBlock>
          <RO text="copil" en="child" /> · <RO text="băiat" en="boy" /> · <RO text="cafea" en="coffee" /><br />
          <RO text="casă" en="house" /> · <RO text="fată" en="girl" /> · <RO text="masă" en="table" />
        </MonoBlock>
      </InfoBox>

      <DrillBox title="lesson_1_drill_title" examples={
        <>
          <RO text="mulțumesc" en="thank you" /> · <RO text="bună ziua" en="good day" /> · <RO text="vă rog" en="please" /><br />
          <RO text="da" en="yes" /> / <RO text="nu" en="no" /> · <RO text="România" en="Romania" /> · <RO text="București" en="Bucharest" />
        </>
      } />
    </LessonSection>
  );
}

// ─── Lesson 2 — Pronouns ────────────────────────────────────────

const QUESTION_WORDS = [
  { symbol: "ce?", pronunciation: "what?", description: "", example: "Ce faci?", exampleWord: "Ce faci?" },
  { symbol: "cine?", pronunciation: "who?", description: "", example: "Cine este?", exampleWord: "Cine este?" },
  { symbol: "unde?", pronunciation: "where?", description: "", example: "Unde mergi?", exampleWord: "Unde mergi?" },
  { symbol: "când?", pronunciation: "when?", description: "", example: "Când pleci?", exampleWord: "Când pleci?" },
  { symbol: "cum?", pronunciation: "how?", description: "", example: "Cum te cheamă?", exampleWord: "Cum te cheamă?" },
  { symbol: "de ce?", pronunciation: "why?", description: "", example: "De ce plângi?", exampleWord: "De ce plângi?" },
  { symbol: "cât?", pronunciation: "how much?", description: "", example: "Cât costă?", exampleWord: "Cât costă?" },
  { symbol: "câți?", pronunciation: "how many?", description: "", example: "Câți ani ai?", exampleWord: "Câți ani ai?" },
  { symbol: "care?", pronunciation: "which?", description: "", example: "Care este?", exampleWord: "Care este?" },
  { symbol: "al cui?", pronunciation: "whose?", description: "", example: "Al cui este?", exampleWord: "Al cui este?" },
];

export function Lesson2() {
  return (
    <LessonSection
      id="L2" num="2" tag="lesson_2_tag"
      title="lesson_2_title"
      subtitle="lesson_2_subtitle"
    >
      <SectionHeading>lesson_2_h_subject</SectionHeading>
      <DataTable
        headers={["Romanian", "English", "Tip"]}
        rows={[
          ["eu", "I", "sounds like “yeh-oo”"],
          ["tu", "you (informal)", "like French “tu”"],
          ["el / ea", "he / she", ""],
          ["noi", "we", "like French “nous”"],
          ["voi", "you (plural)", "like French “vous”"],
          ["ei / ele", "they (m / f)", ""],
        ]}
        speakableCols={[0]}
      />

      <InfoBox variant="blue" title="lesson_2_formal_title">
        <p>Use <b><RO text="dumneavoastră" en="you (formal)" /></b> with strangers, older people, officials. It takes <b>voi</b> verb forms. Romanian formality is strict.</p>
        <MonoBlock><RO text="Dumneavoastră vorbiți românește?" en="Do you (formal) speak Romanian?" /></MonoBlock>
      </InfoBox>

      <SectionHeading>lesson_2_h_object</SectionHeading>
      <DataTable
        headers={["Subject", "Direct object", "Indirect object", "After preposition"]}
        rows={[
          ["eu", "mă", "îmi", "mine"],
          ["tu", "te", "îți", "tine"],
          ["el", "îl", "îi", "el"],
          ["ea", "o", "îi", "ea"],
          ["noi", "ne", "ne", "noi"],
          ["voi", "vă", "vă", "voi"],
          ["ei / ele", "îi / le", "le", "ei / ele"],
        ]}
      />

      <SectionHeading>lesson_2_h_pe</SectionHeading>
      <InfoBox variant="neutral" title="lesson_2_pe_title">
        <MonoBlock>
          <RO text="Îl văd pe Mihai." en="I see Mihai." /> ✓<br />
          <RO text="Văd mașina." en="I see the car." /> &nbsp;(no “pe” — it’s a thing)<br />
          <RO text="Pe cine cauți?" en="Who are you looking for?" />
        </MonoBlock>
        <p style={{ marginTop: 8 }}>Person → use “pe.” Thing → no “pe.”</p>
      </InfoBox>

      <SectionHeading>lesson_2_h_demo</SectionHeading>
      <DataTable
        headers={["English", "Formal", "Spoken", "Example"]}
        rows={[
          ["this (m)", "acest", "ăsta", "Ăsta e bun."],
          ["this (f)", "această", "asta", "Vreau asta."],
          ["that (m)", "acel", "ăla", "Ăla e scump."],
          ["that (f)", "acea", "aia", "Nu vreau aia."],
          ["these (m)", "acești", "ăștia", "Ăștia sunt buni."],
          ["these (f)", "aceste", "astea", "Astea sunt ieftine."],
          ["those (m)", "acei", "ăia", ""],
          ["those (f)", "acele", "alea", "Alea costă mult."],
        ]}
        speakableCols={[2, 3]}
      />
      <InfoBox variant="gold" title="lesson_2_demo_title">
        <p>Nobody says “această” in conversation. Use <b>ăsta / asta / ăla / aia</b>.</p>
      </InfoBox>

      <SectionHeading>lesson_2_h_qwords</SectionHeading>
      <SoundGrid items={QUESTION_WORDS} />

      <SectionHeading>lesson_2_h_survival</SectionHeading>
      <InfoBox variant="green" title="lesson_2_dontunderstand_title">
        <MonoBlock>
          <RO text="Nu înțeleg." en="I don’t understand." /><br />
          <RO text="Puteți repeta, vă rog?" en="Can you repeat, please?" /><br />
          <RO text="Mai încet, vă rog." en="Slower, please." /><br />
          <RO text="Ce înseamnă asta?" en="What does that mean?" /><br />
          <RO text="Vorbiți engleză?" en="Do you speak English?" />
        </MonoBlock>
      </InfoBox>

      <SectionHeading>lesson_2_h_greetings</SectionHeading>
      <InfoBox variant="gold" title="lesson_2_greetings_title">
        <p>
          Among friends, family, colleagues, or people of similar age, Romanian uses two informal
          greetings — and which one you pick depends on the genders of the people involved:
        </p>
        <MonoBlock>
          two men → <RO text="Salut!" en="Hi! (man → man)" /><br />
          two women → <RO text="Bună!" en="Hi! (woman → woman)" /><br />
          a man and a woman → <RO text="Bună!" en="Hi! (mixed)" />
        </MonoBlock>
        <p style={{ marginTop: 8 }}>
          For anyone older, a stranger, or in formal settings, use <b><RO text="Bună ziua!" en="Good day!" /></b> regardless of gender.
        </p>
      </InfoBox>

      <TestBox title="lesson_2_test_title" items={[
        { question: "“What is your name?” (informal)", answer: "Cum te cheamă?" },
        { question: "“I see Maria.” (don’t forget pe!)", answer: "O văd pe Maria." },
        { question: "“Can you repeat, please?”", answer: "Puteți repeta, vă rog?" },
      ]} />
    </LessonSection>
  );
}

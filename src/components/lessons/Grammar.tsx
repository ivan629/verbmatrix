import {
  LessonSection, SectionHeading, Paragraph, InfoBox, TestBox,
  PhraseGrid, VocabGrid, NumberGrid, SoundGrid, DataTable,
  MonoBlock, ContrastBox,
} from "../ui";
import { RO } from "../RO";
import {
  NUMBERS_0_10, NUMBERS_11_19, NUMBERS_TENS, SEASONS, WEATHER_PHRASES,
} from "../../data/numbers";
import {
  ADVERBS, COLORS, NOUNS_WITH_ARTICLES,
  DAYS, MONTHS, TIME_EXPRESSIONS, CONJUNCTIONS,
} from "../../data/vocabulary";

// ─── Lesson 7 — Articles ────────────────────────────────────────

export function Lesson7() {
  return (
    <LessonSection
      id="L7" num="7" tag="Articles, gender, plural"
      title="How Romanian nouns work"
      subtitle="Three genders. The definite article attaches to the END of the word — unique among Romance languages."
    >
      <SectionHeading>Indefinite articles (a, an)</SectionHeading>
      <DataTable
        headers={["Gender", "Singular", "Plural", "Example"]}
        rows={[
          ["Masculine", "un", "niște", "un băiat → niște băieți"],
          ["Feminine", "o", "niște", "o fată → niște fete"],
          ["Neuter", "un", "niște", "un lucru → niște lucruri"],
        ]}
        highlightCols={[1, 2]}
        speakableCols={[3]}
      />

      <SectionHeading>Definite articles (the) — attached to the end</SectionHeading>
      <DataTable
        headers={["Gender", "Ending", "Without ‘the’", "With ‘the’"]}
        rows={[
          ["M. sg.", "-(u)l", "băiat", "băiatul"],
          ["F. sg.", "-(u)a", "fată", "fata"],
          ["N. sg.", "-(u)l", "lucru", "lucrul"],
          ["M. pl.", "-ii", "băieți", "băieții"],
          ["F. pl.", "-ele", "fete", "fetele"],
        ]}
        highlightCols={[1, 3]}
        speakableCols={[3]}
      />

      <InfoBox variant="blue" title="Gender quick guide">
        <p>
          Consonant ending → usually masculine. <b>-ă</b> or <b>-e</b> → usually feminine.
          Neuter behaves like masculine in the singular and feminine in the plural.
        </p>
      </InfoBox>

      <SectionHeading>Genitive / dative — “of” / “to”</SectionHeading>
      <DataTable
        headers={["Gender", "Nominative", "Gen. / dat. sg.", "Gen. / dat. pl."]}
        rows={[
          ["M.", "băiatul", "băiatului", "băieților"],
          ["F.", "fata", "fetei", "fetelor"],
          ["F.", "mama", "mamei", "mamelor"],
        ]}
        highlightCols={[2, 3]}
        speakableCols={[2, 3]}
      />
      <PhraseGrid items={[
        { ro: "Casa mamei.", en: "Mother’s house." },
        { ro: "Cartea profesorului.", en: "The teacher’s book." },
      ]} />

      <SectionHeading>The vocative — calling someone</SectionHeading>
      <InfoBox variant="green" title="How Romanians address each other">
        <MonoBlock>
          mamă → <RO text="Mamo!" en="Mom!" /> &nbsp;·&nbsp;
          Maria → <RO text="Mario!" en="Maria!" /> &nbsp;·&nbsp;
          domn → <RO text="Domnule!" en="Sir!" /> &nbsp;·&nbsp;
          frate → <RO text="Frate!" en="Brother! / Bro!" />
        </MonoBlock>
      </InfoBox>

      <SectionHeading>Common nouns with their articles</SectionHeading>
      <VocabGrid items={NOUNS_WITH_ARTICLES} />
    </LessonSection>
  );
}

// ─── Lesson 8 — Adjectives ──────────────────────────────────────

export function Lesson8() {
  return (
    <LessonSection
      id="L8" num="8" tag="Adjectives, adverbs, possessives"
      title="Describing things, actions, and ownership"
      subtitle="Adjectives agree with the noun in gender and number. Possessives come AFTER the noun."
    >
      <SectionHeading>Adjective agreement</SectionHeading>
      <DataTable
        headers={["English", "M. sg.", "F. sg.", "M. pl.", "F. pl."]}
        rows={[
          ["good", "bun", "bună", "buni", "bune"],
          ["big", "mare", "mare", "mari", "mari"],
          ["small", "mic", "mică", "mici", "mici"],
          ["beautiful", "frumos", "frumoasă", "frumoși", "frumoase"],
          ["new", "nou", "nouă", "noi", "noi"],
          ["old", "vechi", "veche", "vechi", "vechi"],
          ["cheap", "ieftin", "ieftină", "ieftini", "ieftine"],
          ["expensive", "scump", "scumpă", "scumpi", "scumpe"],
          ["happy", "fericit", "fericită", "fericiți", "fericite"],
          ["tired", "obosit", "obosită", "obosiți", "obosite"],
        ]}
        highlightCols={[1, 2, 3, 4]}
        speakableCols={[1]}
      />

      <SectionHeading>Key adverbs</SectionHeading>
      <VocabGrid items={ADVERBS} />

      <SectionHeading>Colors</SectionHeading>
      <VocabGrid items={COLORS} />

      <SectionHeading>Possessives</SectionHeading>
      <DataTable
        headers={["English", "Before m. noun", "Before f. noun"]}
        rows={[
          ["my", "meu", "mea"],
          ["your (sg.)", "tău", "ta"],
          ["his", "lui", "lui"],
          ["her", "ei", "ei"],
          ["our", "nostru", "noastră"],
          ["your (pl. / formal)", "vostru", "voastră"],
          ["their", "lor", "lor"],
        ]}
        highlightCols={[1, 2]}
        speakableCols={[1, 2]}
      />
      <InfoBox variant="blue" title="Word order">
        <p>
          Noun (with article) <b>+</b> possessive: <RO text="casa mea" en="my house" />,{" "}
          <RO text="fratele meu" en="my brother" />, <RO text="prietenii noștri" en="our friends" />.
        </p>
      </InfoBox>
    </LessonSection>
  );
}

// ─── Lesson 9 — Numbers ─────────────────────────────────────────

export function Lesson9() {
  return (
    <LessonSection
      id="L9" num="9" tag="Numbers, time, calendar"
      title="Counting, telling time, talking about dates"
      subtitle="The trickiest part is the teens — and the rule that puts ‘de’ before nouns when the number is twenty or higher."
    >
      <SectionHeading>Numbers 0–10</SectionHeading>
      <NumberGrid items={NUMBERS_0_10} />

      <SectionHeading>Numbers 11–19 — the “spre zece” pattern</SectionHeading>
      <InfoBox variant="neutral" title="How they’re built">
        <p>
          11–19 literally mean “X toward ten” → number + <b>spre</b> + <b>zece</b>. Some forms
          contract: <i>paisprezece</i> (not <i>patrusprezece</i>), <i>șaisprezece</i> (not{" "}
          <i>șasesprezece</i>). This is the trickiest part of Romanian numbers — memorise them.
        </p>
      </InfoBox>
      <NumberGrid items={NUMBERS_11_19} />

      <InfoBox variant="gold" title="Twelve has a feminine form">
        <p>
          <b><RO text="doisprezece" en="twelve (m)" /></b> is masculine; <b><RO text="douăsprezece" en="twelve (f)" /></b> is
          feminine. Use the feminine when counting feminine nouns and when telling time —{" "}
          <RO text="ora douăsprezece" en="twelve o’clock" />.
          (12 is the only number 11–19 with both forms.)
        </p>
      </InfoBox>

      <SectionHeading>Tens (20–100)</SectionHeading>
      <NumberGrid items={NUMBERS_TENS} />

      <InfoBox variant="blue" title="Combining numbers">
        <MonoBlock>
          21 = <RO text="douăzeci și unu" en="twenty-one" /> &nbsp;·&nbsp;
          35 = <RO text="treizeci și cinci" en="thirty-five" /><br />
          47 = <RO text="patruzeci și șapte" en="forty-seven" /> &nbsp;·&nbsp;
          99 = <RO text="nouăzeci și nouă" en="ninety-nine" /><br />
          200 = <RO text="două sute" en="two hundred" /> &nbsp;·&nbsp;
          500 = <RO text="cinci sute" en="five hundred" /> &nbsp;·&nbsp;
          2000 = <RO text="două mii" en="two thousand" />
        </MonoBlock>
      </InfoBox>

      <InfoBox variant="neutral" title="The ‘de’ rule — numbers 20 and above">
        <p>After numbers <b>20 and above</b>, insert <b>de</b> before the noun:</p>
        <MonoBlock>
          <RO text="doi lei" en="two lei" /> ✓ &nbsp;(no “de”)<br />
          <RO text="douăzeci de lei" en="twenty lei" /> ✓ &nbsp;(with “de”!)<br />
          <RO text="o sută de oameni" en="one hundred people" /> ✓
        </MonoBlock>
        <p style={{ marginTop: 8 }}>1–19 → no “de.” &nbsp; 20+ → always “de.”</p>
      </InfoBox>

      <SectionHeading>Ordinal numbers</SectionHeading>
      <DataTable
        headers={["Number", "Masculine", "Feminine", "Example"]}
        rows={[
          ["1st", "primul", "prima", "primul etaj — first floor"],
          ["2nd", "al doilea", "a doua", "a doua zi — the second day"],
          ["3rd", "al treilea", "a treia", "al treilea rând — third row"],
          ["4th", "al patrulea", "a patra", ""],
          ["5th", "al cincilea", "a cincea", ""],
          ["3rd to last", "antepenultimul", "antepenultima", "antepenultimul rând — third-to-last row"],
          ["2nd to last", "penultimul", "penultima", "penultima zi — the second-to-last day"],
          ["last", "ultimul", "ultima", "ultima dată — last time"],
        ]}
        highlightCols={[1, 2]}
        speakableCols={[1, 2]}
      />

      <SectionHeading>Telling time</SectionHeading>
      <InfoBox variant="green" title="‘E ora …’ — it is … o’clock">
        <MonoBlock>
          <RO text="Cât e ceasul?" en="What time is it?" /><br />
          <RO text="E ora trei." en="It is three o’clock." /><br />
          <RO text="E ora trei și jumătate." en="It is half past three." /><br />
          <RO text="E ora trei și un sfert." en="It is a quarter past three." /><br />
          <RO text="E ora patru fără un sfert." en="It is a quarter to four. (lit. four minus a quarter)" /><br />
          <RO text="La ce oră?" en="At what time?" /> · <RO text="La ora opt." en="At eight." />
        </MonoBlock>
      </InfoBox>

      <SectionHeading>Days of the week</SectionHeading>
      <VocabGrid items={DAYS} />

      <SectionHeading>Months of the year</SectionHeading>
      <VocabGrid items={MONTHS} />

      <SectionHeading>Seasons</SectionHeading>
      <SoundGrid items={SEASONS.map((s) => ({
        symbol: s.icon,
        pronunciation: s.ro,
        description: s.en,
        example: "",
        exampleWord: s.ro,
      }))} />
      <InfoBox variant="gold" title="Talking about seasons and months">
        <MonoBlock>
          <RO text="în primăvară" en="in spring" /> &nbsp;·&nbsp;
          <RO text="vara trecută" en="last summer" /><br />
          <RO text="în ianuarie" en="in January" /> &nbsp;·&nbsp;
          <RO text="pe 15 martie" en="on March 15th" />
        </MonoBlock>
      </InfoBox>

      <SectionHeading>Time expressions</SectionHeading>
      <VocabGrid items={TIME_EXPRESSIONS} />

      <SectionHeading>Weather</SectionHeading>
      <PhraseGrid items={WEATHER_PHRASES} />

      <TestBox title="Self-test — numbers and time" items={[
        { question: "Say “17” in Romanian.", answer: "șaptesprezece" },
        { question: "“It’s 3:30.”", answer: "E ora trei și jumătate." },
        { question: "“25 lei” — remember the ‘de’ rule.", answer: "douăzeci și cinci de lei" },
        { question: "“In January.”", answer: "în ianuarie" },
      ]} />
    </LessonSection>
  );
}

// ─── Lesson 10 — Prepositions ───────────────────────────────────

export function Lesson10() {
  return (
    <LessonSection
      id="L10" num="10" tag="Prepositions and connectors"
      title="Linking words, places, directions"
      subtitle="A small set of prepositions does most of the work. Learn the “în vs la” distinction first."
    >
      <SectionHeading>Essential prepositions</SectionHeading>
      <DataTable
        headers={["Romanian", "English", "Example"]}
        rows={[
          ["în", "in / into", "Locuiesc în București."],
          ["la", "to / at", "Merg la serviciu."],
          ["din", "from (inside)", "Sunt din România."],
          ["de la", "from (a place)", "Vin de la birou."],
          ["cu", "with", "Beau cafea cu lapte."],
          ["fără", "without", "Cafea fără zahăr."],
          ["pe", "on", "Cartea e pe masă."],
          ["pentru", "for", "Aceasta e pentru tine."],
          ["despre", "about", "Vorbesc despre el."],
          ["după", "after", "După masă merg acasă."],
          ["înainte de", "before", "Înainte de prânz."],
          ["între", "between", "Între noi."],
        ]}
        speakableCols={[0, 2]}
      />

      <SectionHeading>“În” vs “la”</SectionHeading>
      <ContrastBox columns={[
        {
          type: "yes",
          title: "în — physically inside",
          items: [
            { ro: "în București", en: "in Bucharest" },
            { ro: "în România", en: "in Romania" },
            { ro: "în casă", en: "in the house" },
          ],
        },
        {
          type: "no",
          title: "la — at / to a destination",
          items: [
            { ro: "la hotel", en: "at the hotel" },
            { ro: "la birou", en: "at the office" },
            { ro: "la doctor", en: "to the doctor" },
          ],
        },
      ]} />

      <SectionHeading>Conjunctions</SectionHeading>
      <VocabGrid items={CONJUNCTIONS} />
    </LessonSection>
  );
}

// ─── Lesson 11 — Modals ─────────────────────────────────────────

export function Lesson11() {
  return (
    <LessonSection
      id="L11" num="11" tag="Modals and comparatives"
      title="Can, must, should — and how to compare"
      subtitle="Modals all use the same structure: modal + să + verb. Comparatives use ‘mai’ and ‘decât’."
    >
      <SectionHeading>Modal verbs</SectionHeading>
      <DataTable
        headers={["Modal", "Meaning", "Pattern", "Example"]}
        rows={[
          ["a putea", "can / be able", "pot + să + verb", "Pot să vorbesc românește."],
          ["trebuie", "must / have to", "trebuie + să + verb", "Trebuie să plec acum."],
          ["a vrea", "to want", "vreau + să + verb", "Vreau să mănânc ceva."],
          ["ar trebui", "should", "ar trebui + să + verb", "Ar trebui să înveți."],
          ["aș vrea", "I’d like", "aș vrea + (să) + verb", "Aș vrea o cafea."],
        ]}
        highlightCols={[2]}
        speakableCols={[0, 3]}
      />

      <SectionHeading>“Hai să …” — let’s …!</SectionHeading>
      <InfoBox variant="neutral" title="The most common Romanian invitation">
        <MonoBlock>
          <RO text="Hai să mergem!" en="Let’s go!" /> &nbsp;·&nbsp;
          <RO text="Hai să mâncăm!" en="Let’s eat!" /><br />
          <RO text="Hai să bem o cafea!" en="Let’s have a coffee!" />
        </MonoBlock>
      </InfoBox>

      <SectionHeading>Comparatives</SectionHeading>
      <DataTable
        headers={["Type", "Pattern", "Example"]}
        rows={[
          ["More … than", "mai + adj. + decât", "El e mai mare decât mine."],
          ["Less … than", "mai puțin + adj. + decât", "E mai puțin scump decât celălalt."],
          ["The most …", "cel mai + adj.", "Cel mai frumos oraș."],
          ["As … as", "la fel de + adj. + ca", "E la fel de bun ca el."],
        ]}
        highlightCols={[1]}
        speakableCols={[2]}
      />
    </LessonSection>
  );
}

import {
  LessonSection, SectionHeading, InfoBox, TestBox,
  PhraseGrid, VocabGrid, NumberGrid, SoundGrid, DataTable,
  MonoBlock, ContrastBox,
} from "../../../components/ui";
import { RO } from "../../../components/RO";
import {
  NUMBERS_0_10, NUMBERS_11_19, NUMBERS_TENS, SEASONS, WEATHER_PHRASES,
} from "../data/numbers";
import {
  ADVERBS, COLORS, NOUNS_WITH_ARTICLES,
  DAYS, MONTHS, TIME_EXPRESSIONS, CONJUNCTIONS,
} from "../data/vocabulary";

// ─── Lesson 7 — Articles ────────────────────────────────────────

export function Lesson7() {
  return (
    <LessonSection
      id="L7" num="7" tag="lesson_7_tag"
      title="lesson_7_title"
      subtitle="lesson_7_subtitle"
    >
      <SectionHeading>lesson_7_h_indef</SectionHeading>
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

      <SectionHeading>lesson_7_h_def</SectionHeading>
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

      <InfoBox variant="blue" title="lesson_7_gender_title">
        <p>
          Consonant ending → usually masculine. <b>-ă</b> or <b>-e</b> → usually feminine.
          Neuter behaves like masculine in the singular and feminine in the plural.
        </p>
      </InfoBox>

      <SectionHeading>lesson_7_h_gendat</SectionHeading>
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

      <SectionHeading>lesson_7_h_voc</SectionHeading>
      <InfoBox variant="green" title="lesson_7_voc_title">
        <MonoBlock>
          mamă → <RO text="Mamo!" en="Mom!" /> &nbsp;·&nbsp;
          Maria → <RO text="Mario!" en="Maria!" /> &nbsp;·&nbsp;
          domn → <RO text="Domnule!" en="Sir!" /> &nbsp;·&nbsp;
          frate → <RO text="Frate!" en="Brother! / Bro!" />
        </MonoBlock>
      </InfoBox>

      <SectionHeading>lesson_7_h_nouns</SectionHeading>
      <VocabGrid items={NOUNS_WITH_ARTICLES} />
    </LessonSection>
  );
}

// ─── Lesson 8 — Adjectives ──────────────────────────────────────

export function Lesson8() {
  return (
    <LessonSection
      id="L8" num="8" tag="lesson_8_tag"
      title="lesson_8_title"
      subtitle="lesson_8_subtitle"
    >
      <SectionHeading>lesson_8_h_agreement</SectionHeading>
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

      <SectionHeading>lesson_8_h_adverbs</SectionHeading>
      <VocabGrid items={ADVERBS} />

      <SectionHeading>lesson_8_h_colors</SectionHeading>
      <VocabGrid items={COLORS} />

      <SectionHeading>lesson_8_h_possessives</SectionHeading>
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
      <InfoBox variant="blue" title="lesson_8_word_order_title">
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
      id="L9" num="9" tag="lesson_9_tag"
      title="lesson_9_title"
      subtitle="lesson_9_subtitle"
    >
      <SectionHeading>lesson_9_h_0_10</SectionHeading>
      <NumberGrid items={NUMBERS_0_10} />

      <SectionHeading>lesson_9_h_11_19</SectionHeading>
      <InfoBox variant="neutral" title="lesson_9_built_title">
        <p>
          11–19 literally mean “X toward ten” → number + <b>spre</b> + <b>zece</b>. Some forms
          contract: <i>paisprezece</i> (not <i>patrusprezece</i>), <i>șaisprezece</i> (not{" "}
          <i>șasesprezece</i>). This is the trickiest part of Romanian numbers — memorise them.
        </p>
      </InfoBox>
      <NumberGrid items={NUMBERS_11_19} />

      <InfoBox variant="gold" title="lesson_9_twelve_title">
        <p>
          <b><RO text="doisprezece" en="twelve (m)" /></b> is masculine; <b><RO text="douăsprezece" en="twelve (f)" /></b> is
          feminine. Use the feminine when counting feminine nouns and when telling time —{" "}
          <RO text="ora douăsprezece" en="twelve o’clock" />.
          (12 is the only number 11–19 with both forms.)
        </p>
      </InfoBox>

      <SectionHeading>lesson_9_h_tens</SectionHeading>
      <NumberGrid items={NUMBERS_TENS} />

      <InfoBox variant="blue" title="lesson_9_combining_title">
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

      <InfoBox variant="neutral" title="lesson_9_de_title">
        <p>After numbers <b>20 and above</b>, insert <b>de</b> before the noun:</p>
        <MonoBlock>
          <RO text="doi lei" en="two lei" /> ✓ &nbsp;(no “de”)<br />
          <RO text="douăzeci de lei" en="twenty lei" /> ✓ &nbsp;(with “de”!)<br />
          <RO text="o sută de oameni" en="one hundred people" /> ✓
        </MonoBlock>
        <p style={{ marginTop: 8 }}>1–19 → no “de.” &nbsp; 20+ → always “de.”</p>
      </InfoBox>

      <SectionHeading>lesson_9_h_ordinals</SectionHeading>
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

      <SectionHeading>lesson_9_h_time</SectionHeading>
      <InfoBox variant="green" title="lesson_9_time_title">
        <MonoBlock>
          <RO text="Cât e ceasul?" en="What time is it?" /><br />
          <RO text="E ora trei." en="It is three o’clock." /><br />
          <RO text="E ora trei și jumătate." en="It is half past three." /><br />
          <RO text="E ora trei și un sfert." en="It is a quarter past three." /><br />
          <RO text="E ora patru fără un sfert." en="It is a quarter to four. (lit. four minus a quarter)" /><br />
          <RO text="La ce oră?" en="At what time?" /> · <RO text="La ora opt." en="At eight." />
        </MonoBlock>
      </InfoBox>

      <SectionHeading>lesson_9_h_days</SectionHeading>
      <VocabGrid items={DAYS} />

      <SectionHeading>lesson_9_h_months</SectionHeading>
      <VocabGrid items={MONTHS} />

      <SectionHeading>lesson_9_h_seasons</SectionHeading>
      <SoundGrid items={SEASONS.map((s) => ({
        symbol: s.icon,
        pronunciation: s.ro,
        description: s.en,
        example: "",
        exampleWord: s.ro,
      }))} />
      <InfoBox variant="gold" title="lesson_9_seasons_title">
        <MonoBlock>
          <RO text="în primăvară" en="in spring" /> &nbsp;·&nbsp;
          <RO text="vara trecută" en="last summer" /><br />
          <RO text="în ianuarie" en="in January" /> &nbsp;·&nbsp;
          <RO text="pe 15 martie" en="on March 15th" />
        </MonoBlock>
      </InfoBox>

      <SectionHeading>lesson_9_h_time_expr</SectionHeading>
      <VocabGrid items={TIME_EXPRESSIONS} />

      <SectionHeading>lesson_9_h_weather</SectionHeading>
      <PhraseGrid items={WEATHER_PHRASES} />

      <TestBox title="lesson_9_test_title" items={[
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
      id="L10" num="10" tag="lesson_10_tag"
      title="lesson_10_title"
      subtitle="lesson_10_subtitle"
    >
      <SectionHeading>lesson_10_h_prepositions</SectionHeading>
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

      <SectionHeading>lesson_10_h_in_vs_la</SectionHeading>
      <ContrastBox columns={[
        {
          type: "yes",
          title: "lesson_10_in_inside",
          items: [
            { ro: "în București", en: "in Bucharest" },
            { ro: "în România", en: "in Romania" },
            { ro: "în casă", en: "in the house" },
          ],
        },
        {
          type: "no",
          title: "lesson_10_la_destination",
          items: [
            { ro: "la hotel", en: "at the hotel" },
            { ro: "la birou", en: "at the office" },
            { ro: "la doctor", en: "to the doctor" },
          ],
        },
      ]} />

      <SectionHeading>lesson_10_h_conjunctions</SectionHeading>
      <VocabGrid items={CONJUNCTIONS} />
    </LessonSection>
  );
}

// ─── Lesson 11 — Modals ─────────────────────────────────────────

export function Lesson11() {
  return (
    <LessonSection
      id="L11" num="11" tag="lesson_11_tag"
      title="lesson_11_title"
      subtitle="lesson_11_subtitle"
    >
      <SectionHeading>lesson_11_h_modals</SectionHeading>
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

      <SectionHeading>lesson_11_h_hai</SectionHeading>
      <InfoBox variant="neutral" title="lesson_11_hai_title">
        <MonoBlock>
          <RO text="Hai să mergem!" en="Let’s go!" /> &nbsp;·&nbsp;
          <RO text="Hai să mâncăm!" en="Let’s eat!" /><br />
          <RO text="Hai să bem o cafea!" en="Let’s have a coffee!" />
        </MonoBlock>
      </InfoBox>

      <SectionHeading>lesson_11_h_comparatives</SectionHeading>
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

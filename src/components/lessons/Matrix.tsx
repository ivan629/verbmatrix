import {
  LessonSection, SectionHeading, Paragraph, InfoBox, DrillBox,
  PrincipleGrid, DataTable, MonoBlock,
} from "../ui";
import { RO } from "../RO";
import { Matrix } from "../Matrix";
import { KEY_PATTERNS } from "../../data/schedule";
import { MATRIX_VORBI_EU, MATRIX_LUCRA_FULL, MATRIX_FACE_FULL } from "../../data/matrices";

export function Lesson3() {
  return (
    <LessonSection
      id="L3" num="3" tag="lesson_3_tag"
      title="lesson_3_title"
      subtitle="lesson_3_subtitle"
    >
      <InfoBox variant="green" title="lesson_3_dont_panic_title">
        <p>
          Start with just the <b>“eu” (I)</b> row. Once that feels natural, add <b>tu</b> and <b>el / ea</b>.
          Aim for <b>speed</b>, not perfection.
        </p>
      </InfoBox>

      <SectionHeading>lesson_3_h_patterns</SectionHeading>
      <PrincipleGrid items={KEY_PATTERNS} />

      <InfoBox variant="blue" title="lesson_3_three_tenses_title">
        <p>
          <b>Future (colloquial)</b> = <RO text="o să" en="will" /> + subjunctive verb. &nbsp;
          <b>Present</b> = the conjugated verb. &nbsp;
          <b>Past</b> = <RO text="am" en="have" /> + past participle. &nbsp;
          That’s ninety percent of daily speech.
        </p>
        <p>
          Formal future uses <b><RO text="voi" en="will (formal aux.)" /> + infinitive</b> (e.g.{" "}
          <RO text="Voi vorbi." en="I will speak." />) — for news, books, and formal writing.
        </p>
      </InfoBox>

      <Matrix data={MATRIX_VORBI_EU} />
      <Matrix data={MATRIX_LUCRA_FULL} />
      <Matrix data={MATRIX_FACE_FULL} />

      <SectionHeading>lesson_3_h_formal_future</SectionHeading>
      <DataTable
        headers={["Pronoun", "Marker", "a face", "a merge", "a vorbi"]}
        rows={[
          ["eu", "voi", "voi face", "voi merge", "voi vorbi"],
          ["tu", "vei", "vei face", "vei merge", "vei vorbi"],
          ["el / ea", "va", "va face", "va merge", "va vorbi"],
          ["noi", "vom", "vom face", "vom merge", "vom vorbi"],
          ["voi", "veți", "veți face", "veți merge", "veți vorbi"],
          ["ei / ele", "vor", "vor face", "vor merge", "vor vorbi"],
        ]}
        highlightCols={[1]}
      />

      <SectionHeading>lesson_3_h_word_order</SectionHeading>
      <InfoBox variant="neutral" title="lesson_3_word_order_title">
        <MonoBlock>
          <RO text="Eu merg la școală." en="I go to school. (neutral)" /><br />
          <RO text="La școală merg eu." en="It’s ME who goes to school. (emphasis)" /><br />
          <RO text="Merg la școală." en="(I) go to school. (subject dropped)" />
        </MonoBlock>
        <p style={{ marginTop: 8 }}>
          Romanian often <b>drops the subject pronoun</b> — the verb ending already says who is speaking.
        </p>
      </InfoBox>

      <SectionHeading>lesson_3_h_contracted</SectionHeading>
      <InfoBox variant="neutral" title="lesson_3_contracted_title">
        <p style={{ marginBottom: 6 }}><b>Negation + auxiliary</b> — the most frequent contractions:</p>
        <MonoBlock>
          nu am → <RO text="n-am" en="I don’t have" /> &nbsp;·&nbsp;
          nu ai → <RO text="n-ai" en="you don’t have" /> &nbsp;·&nbsp;
          nu are → <RO text="n-are" en="he/she doesn’t have" /><br />
          nu este → <RO text="nu-i" en="it isn’t" /> &nbsp;·&nbsp;
          nu o să → <RO text="n-o să" en="will not" /> &nbsp;·&nbsp;
          este → <RO text="e" en="is" />
        </MonoBlock>

        <p style={{ marginTop: 12, marginBottom: 6 }}><b>Pronoun + auxiliary</b> — almost always contracted in speech:</p>
        <MonoBlock>
          mă a → <RO text="m-a" en="he/she … me" /> &nbsp;·&nbsp;
          te a → <RO text="te-a" en="he/she … you" /> &nbsp;·&nbsp;
          îl am → <RO text="l-am" en="I … him/it" /><br />
          îmi a → <RO text="mi-a" en="he/she … to me" /> &nbsp;·&nbsp;
          îți am → <RO text="ți-am" en="I … to you" /> &nbsp;·&nbsp;
          ne am → <RO text="ne-am" en="we … (ourselves)" /><br />
          se a → <RO text="s-a" en="he/she/it … (reflexive)" /> &nbsp;·&nbsp;
          v-am → <RO text="v-am" en="I … you (pl.)" /> &nbsp;·&nbsp;
          i-am → <RO text="i-am" en="I … to him/her" />
        </MonoBlock>

        <p style={{ marginTop: 12, marginBottom: 6 }}><b>Subjunctive shortcuts</b> — after <i>să</i> and <i>nu</i>:</p>
        <MonoBlock>
          să îl → <RO text="să-l" en="(to) … him" /> &nbsp;·&nbsp;
          să o → <RO text="s-o" en="(to) … her" /> &nbsp;·&nbsp;
          să îi → <RO text="să-i" en="(to) … him / them" /><br />
          nu îl → <RO text="nu-l" en="not him" /> &nbsp;·&nbsp;
          nu o → <RO text="n-o" en="not her / it" /> &nbsp;·&nbsp;
          ce este → <RO text="ce-i" en="what is" />
        </MonoBlock>

        <p style={{ marginTop: 12, marginBottom: 6 }}><b>How they sound in real sentences:</b></p>
        <MonoBlock>
          <RO text="N-am timp." en="I don’t have time." /> &nbsp;·&nbsp;
          <RO text="S-a terminat." en="It’s over. / It’s done." /><br />
          <RO text="L-am văzut ieri." en="I saw him yesterday." /> &nbsp;·&nbsp;
          <RO text="Mi-a spus adevărul." en="He/she told me the truth." /><br />
          <RO text="Ne-am întâlnit la cafenea." en="We met at the café." /> &nbsp;·&nbsp;
          <RO text="Ți-am zis!" en="I told you!" /><br />
          <RO text="Vreau să-l ajut." en="I want to help him." /> &nbsp;·&nbsp;
          <RO text="Nu-i bine." en="It’s not good." /><br />
          <RO text="Ce-i asta?" en="What is this?" /> &nbsp;·&nbsp;
          <RO text="V-am chemat de două ori." en="I called you (pl.) twice." />
        </MonoBlock>
      </InfoBox>

      <DrillBox
        title="lesson_3_drill_title"
        examples={
          <>
            <b>a vorbi:</b> &nbsp;
            <RO text="O să vorbesc." en="I will speak." /> →{" "}
            <RO text="Vorbesc." en="I speak." /> →{" "}
            <RO text="Am vorbit." en="I spoke." /><br />
            <RO text="O să vorbesc?" en="Will I speak?" /> →{" "}
            <RO text="Vorbesc?" en="Do I speak?" /> →{" "}
            <RO text="Am vorbit?" en="Did I speak?" /><br />
            <RO text="N-o să vorbesc." en="I won’t speak." /> →{" "}
            <RO text="Nu vorbesc." en="I don’t speak." /> →{" "}
            <RO text="Nu am vorbit." en="I didn’t speak." />
          </>
        }
      >
        <Paragraph>
          Pick any verb. Run it through all nine cells aloud. Twenty to thirty seconds per verb.
          Repeat five times daily, ideally at different times. Within two or three days, the structure
          fires automatically — that’s the whole point.
        </Paragraph>
      </DrillBox>
    </LessonSection>
  );
}

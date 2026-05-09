import { Trans, useTranslation } from "react-i18next";
import {
  LessonSection, SectionHeading, Paragraph, InfoBox, TestBox,
  PhraseGrid, DataTable, MonoBlock, VerbCardGrid,
} from "../../../components/ui";
import { RO } from "../../../components/RO";
import { Matrix } from "../../../components/Matrix";
import { MATRIX_FI, MATRIX_AVEA } from "../data/matrices";
import { CORE_VERBS } from "../data/verbs";

// ─── Lesson 4 — A FI ────────────────────────────────────────────

export function Lesson4() {
  return (
    <LessonSection
      id="L4" num="4" tag="lesson_4_tag"
      title="lesson_4_title"
      subtitle="lesson_4_subtitle"
    >
      <SectionHeading>lesson_4_h_matrix</SectionHeading>
      <Matrix data={MATRIX_FI} />

      <SectionHeading>lesson_4_h_using</SectionHeading>
      <PhraseGrid items={[
        { ro: "Eu sunt student.", en: "I am a student." },
        { ro: "Ea este frumoasă.", en: "She is beautiful." },
        { ro: "Noi suntem din România.", en: "We are from Romania." },
        { ro: "El a fost la București.", en: "He was in Bucharest." },
        { ro: "O să fie bine.", en: "It will be fine." },
        { ro: "Cine este el?", en: "Who is he?" },
      ]} />

      <InfoBox variant="gold" title="lesson_4_shortcut_title">
        <p>
          <Trans
            i18nKey="lesson_4_shortcut_body"
            components={[<b />, <RO text="El e student." en="He is a student." />, <RO text="El este student." en="He is a student." />]}
          />
        </p>
      </InfoBox>

      <TestBox title="lesson_4_test_title" items={[
        { question: "I am from England.", answer: "Eu sunt din Anglia." },
        { question: "She was not happy.", answer: "Ea nu a fost fericită." },
        { question: "It will be fine.", answer: "O să fie bine." },
      ]} />
    </LessonSection>
  );
}

// ─── Lesson 5 — A AVEA ──────────────────────────────────────────

export function Lesson5() {
  return (
    <LessonSection
      id="L5" num="5" tag="lesson_5_tag"
      title="lesson_5_title"
      subtitle="lesson_5_subtitle"
    >
      <SectionHeading>lesson_5_h_matrix</SectionHeading>
      <Matrix data={MATRIX_AVEA} />

      <SectionHeading>lesson_5_h_using</SectionHeading>
      <PhraseGrid items={[
        { ro: "Am o mașină nouă.", en: "I have a new car." },
        { ro: "Câți ani ai?", en: "How old are you? (lit. how many years do you have?)" },
        { ro: "Am 28 de ani.", en: "I am 28 years old." },
        { ro: "Ea nu are timp.", en: "She doesn’t have time." },
        { ro: "Aveți copii?", en: "Do you have children?" },
        { ro: "Am avut noroc.", en: "I was lucky." },
      ]} />

      <SectionHeading>lesson_5_h_imi_place</SectionHeading>
      <InfoBox variant="neutral" title="lesson_5_imi_place_title">
        <MonoBlock>
          <RO text="Îmi place cafeaua." en="I like coffee. (lit. coffee is pleasing to me)" /><br />
          <RO text="Îți place România?" en="Do you like Romania?" /><br />
          <RO text="Ne plac sarmalele." en="We like sarmale." /> &nbsp;
          <span className="text-[var(--ink-3)]"><Trans i18nKey="lesson_5_imi_place_plural_note" components={[<b />]} /></span><br />
          <RO text="Mi-a plăcut filmul." en="I liked the movie. (past)" />
        </MonoBlock>
        <p style={{ marginTop: 8 }}>
          <Trans i18nKey="lesson_5_imi_place_footer" components={[<b />]} />
        </p>
      </InfoBox>

      <SectionHeading>lesson_5_h_participles</SectionHeading>
      <DataTable
        headers={["Group", "Infinitive ends in", "Participle ends in", "Example"]}
        rows={[
          ["Group I", "-a", "-at", "a lucra → lucrat"],
          ["Group II", "-ea", "-ut", "a avea → avut"],
          ["Group III", "-e", "-ut / -s", "a face → făcut · a merge → mers"],
          ["Group IV", "-i / -î", "-it / -ât", "a vorbi → vorbit · a coborî → coborât"],
        ]}
        highlightCols={[2]}
      />

      <InfoBox variant="blue" title="lesson_5_perfect_title">
        <p>
          <Trans i18nKey="lesson_5_perfect_body" components={[<b />]} /> <br />
          <MonoBlock>
            <RO text="Eu am vorbit." en="I spoke." /> &nbsp;·&nbsp;
            <RO text="Tu ai vorbit." en="You spoke." /> &nbsp;·&nbsp;
            <RO text="El a vorbit." en="He spoke." /><br />
            <RO text="Noi am vorbit." en="We spoke." /> &nbsp;·&nbsp;
            <RO text="Voi ați vorbit." en="You (pl) spoke." /> &nbsp;·&nbsp;
            <RO text="Ei au vorbit." en="They spoke." />
          </MonoBlock>
        </p>
      </InfoBox>
    </LessonSection>
  );
}

// ─── Lesson 6 — 32 verbs ────────────────────────────────────────

export function Lesson6() {
  const { t } = useTranslation();
  return (
    <LessonSection
      id="L6" num="6" tag="lesson_6_tag"
      title="lesson_6_title"
      subtitle="lesson_6_subtitle"
    >
      <Paragraph>{t("lesson_6_intro")}</Paragraph>
      <VerbCardGrid verbs={CORE_VERBS} />
    </LessonSection>
  );
}

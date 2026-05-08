import { useTranslation } from "react-i18next";
import {
  LessonSection, SectionHeading, InfoBox,
  VocabSectionLabel, VocabGrid, PhraseGrid, DialogueBox,
  ScheduleGrid, PrincipleGrid, MonoBlock,
} from "../../../components/ui";
import { RO } from "../../../components/RO";
import { VOCAB_SECTIONS, SURVIVAL_PHRASES, HEALTH_PHRASES } from "../data/vocabulary";
import { DIALOGUES } from "../data/dialogues";
import { SCHEDULE_ITEMS, DAILY_PRACTICE } from "../data/schedule";

// ─── Vocabulary ─────────────────────────────────────────────────

export function VocabularySection() {
  const { t } = useTranslation();
  return (
    <LessonSection
      id="vocab" num="★" tag="vocab_section_tag"
      title="vocab_section_title"
      subtitle="vocab_section_subtitle"
    >
      {VOCAB_SECTIONS.map((section, i) => (
        <div key={i}>
          <VocabSectionLabel icon={section.icon} label={section.label} />
          <VocabGrid items={section.items} />
          {section.label === "Body & Health" && (
            <InfoBox variant="green" title="vocab_health_title">
              <MonoBlock>
                {HEALTH_PHRASES.map((p, j) => (
                  <span key={j}>
                    <RO text={p.ro} en={p.en} /> — {t(p.en)}<br />
                  </span>
                ))}
              </MonoBlock>
            </InfoBox>
          )}
        </div>
      ))}

      <VocabSectionLabel icon="✦" label="Survival phrases" />
      <PhraseGrid items={SURVIVAL_PHRASES} />
    </LessonSection>
  );
}

// ─── Dialogues ──────────────────────────────────────────────────

export function DialoguesSection() {
  return (
    <LessonSection
      id="dialogues" num="★" tag="dialogues_section_tag"
      title="dialogues_section_title"
      subtitle="dialogues_section_subtitle"
    >
      {DIALOGUES.map((d, i) => <DialogueBox key={i} dialogue={d} />)}
    </LessonSection>
  );
}

// ─── Schedule ───────────────────────────────────────────────────

export function ScheduleSection() {
  return (
    <LessonSection
      id="schedule" num="★" tag="schedule_section_tag"
      title="schedule_section_title"
      subtitle="schedule_section_subtitle"
    >
      <ScheduleGrid items={SCHEDULE_ITEMS} />
      <SectionHeading>schedule_section_h_daily</SectionHeading>
      <PrincipleGrid items={DAILY_PRACTICE} />
    </LessonSection>
  );
}

// ─── About-Me Template ──────────────────────────────────────────

function Blank({ tKey }: { tKey: string }) {
  const { t } = useTranslation();
  return (
    <span className="inline-block border-b border-dashed border-[var(--gold)] min-w-[80px] text-[var(--gold)] font-medium px-1 mx-0.5">
      {t(tKey)}
    </span>
  );
}

export function AboutMeSection() {
  return (
    <LessonSection
      id="aboutme" num="★" tag="aboutme_section_tag"
      title="aboutme_section_title"
      subtitle="aboutme_section_subtitle"
    >
      <div className="bg-[var(--gold-soft)] border border-[var(--gold-border)] rounded-[var(--radius-lg)] py-6 px-7 my-6">
        <p className="font-mono text-[0.95rem] leading-[2.4] text-[var(--ink)]">
          <RO text="Bună! Mă cheamă" en="Hi! My name is" /> <Blank tKey="aboutme_blank_name" />.{" "}
          <RO text="Am" en="I have / I am" /> <Blank tKey="aboutme_blank_age" />{" "}
          <RO text="de ani." en="years old." /><br />
          <RO text="Sunt din" en="I am from" /> <Blank tKey="aboutme_blank_country" />.{" "}
          <RO text="Locuiesc în" en="I live in" /> <Blank tKey="aboutme_blank_city" />.<br />
          <RO text="Lucrez ca" en="I work as" /> <Blank tKey="aboutme_blank_job" />.{" "}
          <RO text="Și acum învăț româna." en="And now I’m learning Romanian." /><br />
          <RO text="Îmi place" en="I like" /> <Blank tKey="aboutme_blank_hobby" />.{" "}
          <RO text="România este foarte frumoasă." en="Romania is very beautiful." /><br />
          <RO text="Încântat(ă) de cunoștință!" en="Pleased to meet you!" />
        </p>
      </div>

      <SectionHeading>aboutme_h_completed</SectionHeading>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] py-6 px-7 my-5 shadow-[var(--shadow-1)]">
        <p className="font-mono text-[0.95rem] leading-[2.4] text-[var(--ink)]">
          <RO text="Bună! Mă cheamă Sarah. Am treizeci și doi de ani." en="Hi! My name is Sarah. I’m thirty-two years old." /><br />
          <RO text="Sunt din Anglia. Locuiesc în Londra." en="I’m from England. I live in London." /><br />
          <RO text="Lucrez ca profesoară. Și acum învăț româna." en="I work as a teacher. And now I’m learning Romanian." /><br />
          <RO text="Îmi place muzica și îmi plac cărțile." en="I like music and I like books." /><br />
          <RO text="Am fost în România vara trecută și mi-a plăcut foarte mult." en="I was in Romania last summer and I liked it very much." /><br />
          <RO text="România este foarte frumoasă. Încântată de cunoștință!" en="Romania is very beautiful. Pleased to meet you!" />
        </p>
      </div>

      <InfoBox variant="gold" title="aboutme_write_title">
        <p>
          Replace the blanks with your own information. Read it aloud three times.
          This is your first real paragraph in Romanian.
        </p>
      </InfoBox>
    </LessonSection>
  );
}

import {
  LessonSection, SectionHeading, InfoBox,
  VocabSectionLabel, VocabGrid, PhraseGrid, DialogueBox,
  ScheduleGrid, PrincipleGrid, MonoBlock,
} from "../ui";
import { RO } from "../RO";
import { VOCAB_SECTIONS, SURVIVAL_PHRASES, HEALTH_PHRASES } from "../../data/vocabulary";
import { DIALOGUES } from "../../data/dialogues";
import { SCHEDULE_ITEMS, DAILY_PRACTICE } from "../../data/schedule";

// ─── Vocabulary ─────────────────────────────────────────────────

export function VocabularySection() {
  return (
    <LessonSection
      id="vocab" num="★" tag="Reference"
      title="500+ core vocabulary"
      subtitle="The high-frequency words. Hover for translation, click to hear them. Read aloud, in chunks of twenty."
    >
      {VOCAB_SECTIONS.map((section, i) => (
        <div key={i}>
          <VocabSectionLabel icon={section.icon} label={section.label} />
          <VocabGrid items={section.items} />
          {section.label === "Body & Health" && (
            <InfoBox variant="green" title="Saying ‘it hurts’">
              <MonoBlock>
                {HEALTH_PHRASES.map((p, j) => (
                  <span key={j}>
                    <RO text={p.ro} en={p.en} /> — {p.en}<br />
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
      id="dialogues" num="★" tag="Practice"
      title="Sixteen mini-conversations"
      subtitle="Read aloud — both roles. Cover the English column with your hand and try the Romanian first."
    >
      {DIALOGUES.map((d, i) => <DialogueBox key={i} dialogue={d} />)}
    </LessonSection>
  );
}

// ─── Schedule ───────────────────────────────────────────────────

export function ScheduleSection() {
  return (
    <LessonSection
      id="schedule" num="★" tag="Study plan"
      title="A 32-day pacing schedule"
      subtitle="A suggested rhythm. Adjust it to your life — but keep the daily micro-practice intact."
    >
      <ScheduleGrid items={SCHEDULE_ITEMS} />
      <SectionHeading>Daily micro-practice (forever)</SectionHeading>
      <PrincipleGrid items={DAILY_PRACTICE} />
    </LessonSection>
  );
}

// ─── About-Me Template ──────────────────────────────────────────

function Blank({ children }: { children: string }) {
  return (
    <span className="inline-block border-b border-dashed border-[var(--gold)] min-w-[80px] text-[var(--gold)] font-medium px-1 mx-0.5">
      {children}
    </span>
  );
}

export function AboutMeSection() {
  return (
    <LessonSection
      id="aboutme" num="★" tag="Your first paragraph"
      title="The ‘About Me’ template"
      subtitle="Fill in the blanks with your own life. This becomes your first real paragraph in Romanian — read it aloud three times."
    >
      <div className="bg-[var(--gold-soft)] border border-[var(--gold-border)] rounded-[var(--radius-lg)] py-6 px-7 my-6">
        <p className="font-mono text-[0.95rem] leading-[2.4] text-[var(--ink)]">
          <RO text="Bună! Mă cheamă" en="Hi! My name is" /> <Blank>name</Blank>.{" "}
          <RO text="Am" en="I have / I am" /> <Blank>age</Blank>{" "}
          <RO text="de ani." en="years old." /><br />
          <RO text="Sunt din" en="I am from" /> <Blank>country</Blank>.{" "}
          <RO text="Locuiesc în" en="I live in" /> <Blank>city</Blank>.<br />
          <RO text="Lucrez ca" en="I work as" /> <Blank>job</Blank>.{" "}
          <RO text="Și acum învăț româna." en="And now I’m learning Romanian." /><br />
          <RO text="Îmi place" en="I like" /> <Blank>hobby</Blank>.{" "}
          <RO text="România este foarte frumoasă." en="Romania is very beautiful." /><br />
          <RO text="Încântat(ă) de cunoștință!" en="Pleased to meet you!" />
        </p>
      </div>

      <SectionHeading>Completed example</SectionHeading>
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

      <InfoBox variant="gold" title="Now write yours">
        <p>
          Replace the blanks with your own information. Read it aloud three times.
          This is your first real paragraph in Romanian.
        </p>
      </InfoBox>
    </LessonSection>
  );
}

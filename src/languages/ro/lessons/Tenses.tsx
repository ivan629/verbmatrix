import {
  LessonSection, SectionHeading, InfoBox, TestBox, DrillBox,
  PhraseGrid, DataTable, MonoBlock, FillerGrid, VocabGrid, ContrastBox,
} from "../../../components/ui";
import { RO } from "../../../components/RO";
import {
  FILLER_WORDS, EXPRESSIONS, COMPLEX_SENTENCES, GRAND_REVIEW_TESTS,
} from "../data/matrices";
import { COGNATES } from "../data/vocabulary";

// ─── Lesson 12 — Imperfect ──────────────────────────────────────

export function Lesson12() {
  return (
    <LessonSection
      id="L12" num="12" tag="lesson_12_tag"
      title="lesson_12_title"
      subtitle="lesson_12_subtitle"
    >
      <SectionHeading>lesson_12_h_conjugation</SectionHeading>
      <DataTable
        headers={["Pronoun", "a fi", "a avea", "a merge", "a vorbi", "a lucra"]}
        rows={[
          ["eu", "eram", "aveam", "mergeam", "vorbeam", "lucram"],
          ["tu", "erai", "aveai", "mergeai", "vorbeai", "lucrai"],
          ["el / ea", "era", "avea", "mergea", "vorbea", "lucra"],
          ["noi", "eram", "aveam", "mergeam", "vorbeam", "lucram"],
          ["voi", "erați", "aveați", "mergeați", "vorbeați", "lucrați"],
          ["ei / ele", "erau", "aveau", "mergeau", "vorbeau", "lucrau"],
        ]}
        highlightCols={[1, 2, 3, 4, 5]}
        speakableCols={[1]}
      />

      <InfoBox variant="blue" title="lesson_12_pattern_title">
        <p>
          Take the verb stem and add the endings <b>-am, -ai, -a, -am, -ați, -au</b>. Works for
          almost every verb in the language.
        </p>
      </InfoBox>

      <SectionHeading>lesson_12_h_compare</SectionHeading>
      <ContrastBox columns={[
        {
          type: "yes",
          title: "lesson_12_perfect_done",
          items: [
            { ro: "Am mâncat la ora 12.", en: "I ate at twelve. (done)" },
          ],
        },
        {
          type: "no",
          title: "lesson_12_imperfect_ongoing",
          items: [
            { ro: "Mâncam când a sunat telefonul.", en: "I was eating when the phone rang." },
          ],
        },
      ]} />

      <SectionHeading>lesson_12_h_using</SectionHeading>
      <PhraseGrid items={[
        { ro: "Când eram mic, locuiam la sat.", en: "When I was small, I lived in the village." },
        { ro: "Mergeam la școală în fiecare zi.", en: "I used to go to school every day." },
        { ro: "Afară ploua și era frig.", en: "Outside it was raining and it was cold." },
        { ro: "Ce făceai ieri la ora cinci?", en: "What were you doing yesterday at five?" },
      ]} />

      <DrillBox
        title="lesson_12_drill_title"
        examples={
          <>
            Când eram mic, <b>___</b> (a locui) la / în <b>___</b>.<br />
            <b>___</b> (a merge) la școală în fiecare zi.<br />
            Bunica mea <b>___</b> (a face) mâncare bună.<br />
            <b>___</b> (a fi) fericit(ă) când <b>___</b> (a juca) afară.
          </>
        }
      >
        <p>Complete these sentences about your own childhood. Read aloud, three times each.</p>
      </DrillBox>

      <TestBox title="lesson_12_test_title" items={[
        { question: "“I used to speak Romanian.” (eu)", answer: "Vorbeam românește." },
        { question: "“She was working when I called.”", answer: "Ea lucra când am sunat." },
        { question: "“They used to have a house in the mountains.”", answer: "Ei aveau o casă la munte." },
      ]} />
    </LessonSection>
  );
}

// ─── Lesson 13 — Commands ───────────────────────────────────────

export function Lesson13() {
  return (
    <LessonSection
      id="L13" num="13" tag="lesson_13_tag"
      title="lesson_13_title"
      subtitle="lesson_13_subtitle"
    >
      <DataTable
        headers={["English", "+ (tu)", "+ (voi / formal)", "− (tu)"]}
        rows={[
          ["Come!", "Vino!", "Veniți!", "Nu veni!"],
          ["Go!", "Du-te!", "Duceți-vă!", "Nu te duce!"],
          ["Wait!", "Stai!", "Stați!", "Nu sta!"],
          ["Speak!", "Vorbește!", "Vorbiți!", "Nu vorbi!"],
          ["Eat!", "Mănâncă!", "Mâncați!", "Nu mânca!"],
          ["Give!", "Dă!", "Dați!", "Nu da!"],
          ["Read!", "Citește!", "Citiți!", "Nu citi!"],
          ["Write!", "Scrie!", "Scrieți!", "Nu scrie!"],
          ["Listen!", "Ascultă!", "Ascultați!", "Nu asculta!"],
          ["Look!", "Uită-te!", "Uitați-vă!", "Nu te uita!"],
        ]}
        speakableCols={[1, 2]}
      />

      <InfoBox variant="green" title="lesson_13_polite_title">
        <MonoBlock>
          <RO text="Veniți, vă rog!" en="Come in, please!" /><br />
          <RO text="Spuneți-mi, vă rog." en="Tell me, please." /><br />
          <RO text="Stai puțin!" en="Wait a moment!" />
        </MonoBlock>
      </InfoBox>

      <TestBox title="lesson_13_test_title" items={[
        { question: "“Come here!” (informal)", answer: "Vino aici!" },
        { question: "“Don’t go!” (informal)", answer: "Nu te duce!" },
        { question: "“Please speak slowly.” (formal)", answer: "Vorbiți încet, vă rog." },
      ]} />
    </LessonSection>
  );
}

// ─── Lesson 14 — Subjunctive ────────────────────────────────────

export function Lesson14() {
  return (
    <LessonSection
      id="L14" num="14" tag="lesson_14_tag"
      title="lesson_14_title"
      subtitle="lesson_14_subtitle"
    >
      <InfoBox variant="blue" title="lesson_14_when_title">
        <p>
          After: <b>vreau</b> (I want), <b>trebuie</b> (must), <b>pot</b> (I can),{" "}
          <b>o să</b> (will), <b>hai</b> (let’s), <b>sper</b> (I hope), <b>cred</b> (I think).
          Only the <b>third person</b> (he / she / they) takes a special form — the rest mostly
          look like the present.
        </p>
      </InfoBox>

      <DataTable
        headers={["Verb", "Present (el)", "Subjunctive (el să …)", "Example"]}
        rows={[
          ["a vorbi", "vorbește", "să vorbească", "Vreau să vorbească."],
          ["a face", "face", "să facă", "Trebuie să facă asta."],
          ["a merge", "merge", "să meargă", "O să meargă acasă."],
          ["a veni", "vine", "să vină", "Trebuie să vină."],
          ["a fi", "este", "să fie", "Vreau să fie bine."],
          ["a avea", "are", "să aibă", "Sper să aibă noroc."],
          ["a mânca", "mănâncă", "să mănânce", "Vreau să mănânce."],
          ["a ști", "știe", "să știe", "Trebuie să știe."],
          ["a putea", "poate", "să poată", "Vreau să poată veni."],
        ]}
        highlightCols={[2]}
        speakableCols={[2]}
      />

      <DrillBox
        title="lesson_14_drill_title"
        examples={
          <>
            <RO text="Vreau să merg acasă." en="I want to go home." /><br />
            <RO text="Trebuie să lucrez mâine." en="I must work tomorrow." /><br />
            <RO text="Pot să te ajut?" en="Can I help you?" /><br />
            <RO text="Sper să fie frumos afară." en="I hope it’s nice outside." />
          </>
        }
      />

      <TestBox title="lesson_14_test_title" items={[
        { question: "“I want to eat something.”", answer: "Vreau să mănânc ceva." },
        { question: "“He must come tomorrow.”", answer: "Trebuie să vină mâine." },
        { question: "“Can she speak Romanian?”", answer: "Poate să vorbească românește?" },
      ]} />
    </LessonSection>
  );
}

// ─── Lesson 15 — Conditionals ───────────────────────────────────

export function Lesson15() {
  return (
    <LessonSection
      id="L15" num="15" tag="lesson_15_tag"
      title="lesson_15_title"
      subtitle="lesson_15_subtitle"
    >
      <SectionHeading>lesson_15_h_conditional</SectionHeading>
      <DataTable
        headers={["Pronoun", "Marker", "+ a face", "+ a fi", "+ a merge"]}
        rows={[
          ["eu", "aș", "aș face", "aș fi", "aș merge"],
          ["tu", "ai", "ai face", "ai fi", "ai merge"],
          ["el / ea", "ar", "ar face", "ar fi", "ar merge"],
          ["noi", "am", "am face", "am fi", "am merge"],
          ["voi", "ați", "ați face", "ați fi", "ați merge"],
          ["ei / ele", "ar", "ar face", "ar fi", "ar merge"],
        ]}
        highlightCols={[1]}
        speakableCols={[2]}
      />

      <SectionHeading>lesson_15_h_if</SectionHeading>
      <InfoBox variant="neutral" title="lesson_15_if_title">
        <p style={{ marginBottom: 6 }}>
          <b>Real / likely</b> — equivalent to the English <b>1st conditional</b>{" "}
          (<i>If + present, will + verb</i>):
        </p>
        <MonoBlock>
          <RO text="Dacă am timp, vin la tine." en="If I have time, I’ll come to your place." /><br />
          <RO text="Dacă plouă, stau acasă." en="If it rains, I (will) stay home." />
        </MonoBlock>
        <p style={{ marginTop: 12, marginBottom: 6 }}>
          <b>Unreal / hypothetical</b> — equivalent to the English <b>2nd conditional</b>{" "}
          (<i>If + past, would + verb</i>):
        </p>
        <MonoBlock>
          <RO text="Dacă aș avea bani, aș călători." en="If I had money, I would travel." /><br />
          <RO text="Dacă aș fi tu, aș pleca." en="If I were you, I would leave." />
        </MonoBlock>
        <p style={{ marginTop: 12, marginBottom: 6 }}>
          <b>Past unreal</b> — equivalent to the English <b>3rd conditional</b>{" "}
          (<i>If + past perfect, would have + verb</i>):
        </p>
        <MonoBlock>
          <RO text="Dacă aș fi știut, aș fi venit." en="If I had known, I would have come." />
        </MonoBlock>
      </InfoBox>

      <SectionHeading>lesson_15_h_reflexive</SectionHeading>
      <DataTable
        headers={["Verb", "Meaning", "Example"]}
        rows={[
          ["a se trezi", "to wake up", "Mă trezesc la 7."],
          ["a se simți", "to feel", "Mă simt bine."],
          ["a se uita", "to look / watch", "Mă uit la televizor."],
          ["a se gândi", "to think about", "Mă gândesc la tine."],
          ["a se numi", "to be called", "Mă numesc Ana."],
          ["a se spăla", "to wash oneself", "Mă spăl pe mâini."],
          ["a se îmbrăca", "to get dressed", "Mă îmbrac repede."],
        ]}
        speakableCols={[0, 2]}
      />

      <InfoBox variant="blue" title="lesson_15_reflexive_pron_title">
        <MonoBlock>
          eu <b>mă</b> &nbsp;·&nbsp; tu <b>te</b> &nbsp;·&nbsp; el / ea <b>se</b> &nbsp;·&nbsp;
          noi <b>ne</b> &nbsp;·&nbsp; voi <b>vă</b> &nbsp;·&nbsp; ei / ele <b>se</b>
        </MonoBlock>
      </InfoBox>

      <SectionHeading>lesson_15_h_relative</SectionHeading>
      <PhraseGrid items={[
        { ro: "Omul care vorbește e profesorul.", en: "The man who is speaking is the teacher." },
        { ro: "Cartea pe care o citesc e bună.", en: "The book (that) I’m reading is good." },
        { ro: "Filmul despre care vorbim.", en: "The movie we’re talking about." },
      ]} />

      <SectionHeading>lesson_15_h_double_neg</SectionHeading>
      <InfoBox variant="neutral" title="lesson_15_double_neg_title">
        <MonoBlock>
          <RO text="Nu vine nimeni." en="Nobody is coming." /><br />
          <RO text="Nu am nimic." en="I have nothing." /><br />
          <RO text="Nimeni nu știe nimic." en="Nobody knows anything." /><br />
          <RO text="Nu merg nicăieri." en="I’m not going anywhere." /><br />
          <RO text="Nu vorbesc niciodată." en="I never speak." />
        </MonoBlock>
      </InfoBox>

      <TestBox title="lesson_15_test_title" items={[
        { question: "“If I had time, I would learn Romanian.”", answer: "Dacă aș avea timp, aș învăța românește." },
        { question: "“I wake up at 7 and I feel good.”", answer: "Mă trezesc la 7 și mă simt bine." },
        { question: "“The woman who works here is my friend.”", answer: "Femeia care lucrează aici e prietena mea." },
        { question: "“Nobody knows anything.”", answer: "Nimeni nu știe nimic." },
      ]} />
    </LessonSection>
  );
}

// ─── Lesson 16 — Advanced ───────────────────────────────────────

export function Lesson16() {
  return (
    <LessonSection
      id="L16" num="16" tag="lesson_16_tag"
      title="lesson_16_title"
      subtitle="lesson_16_subtitle"
    >
      <SectionHeading>lesson_16_h_complex</SectionHeading>
      <PhraseGrid items={COMPLEX_SENTENCES} />

      <SectionHeading>lesson_16_h_mie</SectionHeading>
      <InfoBox variant="green" title="lesson_16_mie_title">
        <MonoBlock>
          <RO text="Mi-e foame." en="I’m hungry. (lit. to me is hunger)" /><br />
          <RO text="Mi-e sete." en="I’m thirsty." /><br />
          <RO text="Mi-e frig." en="I’m cold." /><br />
          <RO text="Mi-e cald." en="I’m hot." /><br />
          <RO text="Mi-e somn." en="I’m sleepy." /><br />
          <RO text="Mi-e frică." en="I’m afraid." /><br />
          <RO text="Mi-e rușine." en="I’m ashamed / embarrassed." /><br />
          <RO text="Mi-e dor de tine." en="I miss you. (uniquely Romanian!)" />
        </MonoBlock>
      </InfoBox>

      <SectionHeading>lesson_16_h_fillers</SectionHeading>
      <FillerGrid items={FILLER_WORDS} />

      <SectionHeading>lesson_16_h_expressions</SectionHeading>
      <PhraseGrid items={EXPRESSIONS} />

      <SectionHeading>lesson_16_h_cognates</SectionHeading>
      <InfoBox variant="gold" title="lesson_16_cognates_title">
        <p>
          <b>-tion → -ție</b>: information → informație, situation → situație<br />
          <b>-ty → -tate</b>: university → universitate, quality → calitate<br />
          <b>-ture → -tură</b>: nature → natură, culture → cultură<br />
          <b>-ment → -ment</b>: moment → moment, apartment → apartament
        </p>
      </InfoBox>
      <VocabGrid items={COGNATES} />
    </LessonSection>
  );
}

// ─── Lesson 17 — Grand review ───────────────────────────────────

export function Lesson17() {
  return (
    <LessonSection
      id="L17" num="17" tag="lesson_17_tag"
      title="lesson_17_title"
      subtitle="lesson_17_subtitle"
    >
      <TestBox title="lesson_17_test_title" items={GRAND_REVIEW_TESTS} />
      <InfoBox variant="gold" title="lesson_17_next_title">
        <p>
          You now have the complete foundation. The most useful next step is exposure: Romanian
          YouTube, ProTV, Digi24, Romanian podcasts, native speakers. The skeleton you’ve drilled
          here doesn’t fully disappear — even after months away, a few drills bring it back fast.
        </p>
      </InfoBox>
    </LessonSection>
  );
}

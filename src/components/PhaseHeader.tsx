import { useTranslation } from "react-i18next";

/**
 * Visual phase break between lesson groups (Foundations → Verbs → Grammar
 * → Tenses → Reference). Chunks the textbook into 5 cognitive phases so
 * the user feels "I'm in Phase 3 of 5" instead of "I'm somewhere around
 * Lesson 11 of 17" — meaningfully less overwhelming.
 *
 * Rendered between lesson sections, not inside them. App.tsx walks
 * navGroups and inserts one of these before the first lesson of each
 * non-first group.
 *
 * The title key follows the engine convention (`nav_groups_<label>`)
 * so existing translations are reused. An optional intro paragraph
 * lives under `phase_<label>_intro` per module.
 */
export function PhaseHeader({
  number,
  total,
  groupLabel,
}: {
  /** 1-based phase number (Phase I, II, III...). */
  number: number;
  /** Total phase count, used for "Phase 2 of 5" copy. */
  total: number;
  /** The navGroup label, e.g. "Foundations". Used to build i18n keys. */
  groupLabel: string;
}) {
  const { t } = useTranslation();
  const romanNumeral = toRoman(number);
  // Reuse the existing nav_groups_<label> translations for the phase title.
  const titleKey = `nav_groups_${groupLabel}`;
  const introKey = `phase_${groupLabel.toLowerCase()}_intro`;

  return (
    <div className="phase-break" role="separator" aria-label={`Phase ${number} of ${total}`}>
      <div className="phase-ornament">
        <span className="phase-ornament-line" />
        <span className="phase-ornament-mark">{romanNumeral}</span>
        <span className="phase-ornament-line" />
      </div>
      <div className="phase-body">
        <div className="phase-counter">
          {t("phase_counter", { number, total })}
        </div>
        <h2 className="phase-title">
          {t(titleKey, { defaultValue: groupLabel })}
        </h2>
        <p className="phase-intro">
          {t(introKey, { defaultValue: "" })}
        </p>
      </div>
    </div>
  );
}

const ROMAN = [
  "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX",
];

function toRoman(n: number): string {
  return ROMAN[n] ?? String(n);
}

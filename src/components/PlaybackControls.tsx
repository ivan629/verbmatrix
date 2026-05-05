import { usePlayback } from "../context/Playback";

const SPEEDS = [
  { value: 0.7, label: "0.7" },
  { value: 0.85, label: "0.85" },
  { value: 1, label: "1" },
];

const REPEATS = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
];

interface SegmentedProps<T extends number> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}

function Segmented<T extends number>({ options, value, onChange, ariaLabel }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex bg-[var(--surface-2)] rounded-md p-0.5 gap-0.5"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`
              flex-1 min-h-[28px] px-1
              text-[11px] font-mono rounded transition-colors
              ${active
                ? "bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-1)]"
                : "text-[var(--ink-3)] hover:text-[var(--ink-2)]"}
            `}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Always-visible minimal playback controls. Two short rows:
 *   Speed   [0.7 | 0.85 | 1]
 *   Repeat  [ 1  |  2   | 3]
 *
 * No collapsing; no fancy chrome. The label sits on the same baseline as
 * the segmented control so the whole panel reads as a tight 2-row grid.
 */
export function PlaybackControls() {
  const { speed, repeat, setSpeed, setRepeat } = usePlayback();

  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2">
      <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--ink-4)]">
        Speed
      </span>
      <Segmented options={SPEEDS} value={speed} onChange={setSpeed} ariaLabel="Playback speed" />

      <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--ink-4)]">
        Repeat
      </span>
      <Segmented options={REPEATS} value={repeat} onChange={setRepeat} ariaLabel="Repeat count" />
    </div>
  );
}

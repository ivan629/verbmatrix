import { usePlayback } from "../context/Playback";

const SPEEDS = [
  { value: 1, label: "1×" },
  { value: 0.85, label: "0.85×" },
  { value: 0.7, label: "0.7×" },
];

const REPEATS = [
  { value: 1, label: "1×" },
  { value: 2, label: "2×" },
  { value: 3, label: "3×" },
];

interface SegmentedProps<T extends number> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}

function Segmented<T extends number>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <div className="flex bg-[var(--surface-2)] rounded-md p-0.5 gap-0.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              flex-1 py-1 text-[11px] font-mono rounded transition-colors
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

export function PlaybackControls() {
  const { speed, repeat, setSpeed, setRepeat } = usePlayback();

  return (
    <div className="space-y-3">
      <div>
        <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--ink-4)] mb-1.5">
          Playback speed
        </div>
        <Segmented options={SPEEDS} value={speed} onChange={setSpeed} />
      </div>
      <div>
        <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--ink-4)] mb-1.5">
          Repeat each click
        </div>
        <Segmented options={REPEATS} value={repeat} onChange={setRepeat} />
      </div>
    </div>
  );
}

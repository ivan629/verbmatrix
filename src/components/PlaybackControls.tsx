import { useState } from "react";
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

/**
 * Collapsible playback panel. Collapsed by default to keep the sidebar
 * minimal — the defaults (1× / 1×) are what most people want, and the
 * controls are one click away when needed.
 */
export function PlaybackControls() {
  const { speed, repeat, setSpeed, setRepeat } = usePlayback();
  const isDefault = speed === 1 && repeat === 1;
  const [open, setOpen] = useState(!isDefault);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="
          w-full flex items-center justify-between gap-2
          font-mono text-[9.5px] uppercase tracking-[0.18em]
          text-[var(--ink-4)] hover:text-[var(--ink-2)] transition-colors
        "
      >
        <span>
          Playback
          {!isDefault && (
            <span className="ml-2 text-[var(--gold)] normal-case tracking-normal">
              {speed}× · ↻ {repeat}
            </span>
          )}
        </span>
        <svg
          width="9"
          height="9"
          viewBox="0 0 9 9"
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1.5 3l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="mt-2 space-y-3">
          <div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--ink-4)] mb-1.5">
              Speed
            </div>
            <Segmented options={SPEEDS} value={speed} onChange={setSpeed} />
          </div>
          <div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--ink-4)] mb-1.5">
              Repeat
            </div>
            <Segmented options={REPEATS} value={repeat} onChange={setRepeat} />
          </div>
        </div>
      )}
    </div>
  );
}

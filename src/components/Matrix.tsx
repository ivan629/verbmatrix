import { useTranslation } from "react-i18next";
import type { MatrixData } from "../types";
import { RO } from "./RO";

function MatrixCell({ lines, variant }: { lines: string[]; variant: "q" | "a" | "n" }) {
  const colorMap = {
    q: "text-[var(--question)]",
    a: "text-[var(--affirm)]",
    n: "text-[var(--neg)]",
  };
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => (
        <div key={i} className={`font-mono text-[0.85rem] leading-[1.7] ${colorMap[variant]}`}>
          <RO text={line} />
        </div>
      ))}
    </div>
  );
}

export function Matrix({ data }: { data: MatrixData }) {
  const { t } = useTranslation();
  return (
    <div className="my-8">
      <h3 className="font-display text-[1.2rem] font-normal text-[var(--ink)] mb-4 tracking-tight">
        {t(data.title)}
      </h3>
      <div className="rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-1)] overflow-x-auto">
        <table className="w-full border-collapse text-[0.86rem]">
          <thead>
            <tr>
              <th className="bg-[var(--surface-2)] py-3 px-4 text-left border-b border-r border-[var(--border)] w-[110px]" />
              <th className="bg-[var(--surface-2)] py-3 px-4 border-b border-r border-[var(--border)]">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] font-semibold text-[var(--question)]">
                  ? {t("matrix_col_question")}
                </span>
              </th>
              <th className="bg-[var(--surface-2)] py-3 px-4 border-b border-r border-[var(--border)]">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] font-semibold text-[var(--affirm)]">
                  + {t("matrix_col_affirmative")}
                </span>
              </th>
              <th className="bg-[var(--surface-2)] py-3 px-4 border-b border-[var(--border)]">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] font-semibold text-[var(--neg)]">
                  − {t("matrix_col_negative")}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr key={i} className="border-b border-[var(--border)] last:border-b-0">
                <td className="bg-[var(--surface-2)] py-3 px-4 align-top border-r border-[var(--border)]">
                  <div className="font-display text-[0.95rem] text-[var(--ink)] tracking-tight">{t(row.tenseName)}</div>
                  {row.tenseSub && (
                    <div className="text-[0.7rem] text-[var(--ink-4)] font-mono mt-0.5">{t(row.tenseSub)}</div>
                  )}
                </td>
                <td className="py-3 px-4 align-top border-r border-[var(--border)] bg-[var(--question-bg)]/40">
                  <MatrixCell lines={row.question.ro} variant="q" />
                  {row.question.en?.map((e, j) => (
                    <div key={j} className="text-[0.74rem] text-[var(--ink-3)] italic mt-0.5">{t(e)}</div>
                  ))}
                </td>
                <td className="py-3 px-4 align-top border-r border-[var(--border)] bg-[var(--affirm-bg)]/40">
                  <MatrixCell lines={row.affirmative.ro} variant="a" />
                  {row.affirmative.en?.map((e, j) => (
                    <div key={j} className="text-[0.74rem] text-[var(--ink-3)] italic mt-0.5">{t(e)}</div>
                  ))}
                </td>
                <td className="py-3 px-4 align-top bg-[var(--neg-bg)]/40">
                  <MatrixCell lines={row.negative.ro} variant="n" />
                  {row.negative.en?.map((e, j) => (
                    <div key={j} className="text-[0.74rem] text-[var(--ink-3)] italic mt-0.5">{t(e)}</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

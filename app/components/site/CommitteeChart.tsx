import { IconTable } from "@tabler/icons-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type Version = "draft" | "edited";

const REVIEWERS = [
  {
    role: "Academic reviewer",
    focus: "Rigour and evidence",
    draft: { score: 3, fix: "Lead with the clinic, not the claim in your first line." },
    edited: { score: 4, fix: "Say what the reorder list changed after you left." },
  },
  {
    role: "Program officer",
    focus: "Fit with the mission",
    draft: { score: 2, fix: "Connect this to leading change at home after the degree." },
    edited: { score: 4, fix: "One sentence on how the master's builds on this." },
  },
  {
    role: "Alumni reviewer",
    focus: "Community leadership",
    draft: { score: 3, fix: "Cut the closing line; it could belong to anyone." },
    edited: { score: 5, fix: "Nothing to fix. The 40 volunteers make it real." },
  },
] as const;

const MAX = 5;
const verdictFor = (avg: number) => (avg >= 4 ? "Likely shortlist" : avg >= 3 ? "Borderline" : "Unlikely");

/** Simulated committee scores for one answer, before and after edits. Single series: one hue, no legend. */
export function CommitteeChart() {
  const [version, setVersion] = useState<Version>("draft");
  const [showTable, setShowTable] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  const rows = REVIEWERS.map((r) => ({ role: r.role, focus: r.focus, ...r[version] }));
  const avg = rows.reduce((s, r) => s + r.score, 0) / rows.length;

  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Committee score for question 1 (simulated)</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tracking-tight tabular-nums">{avg.toFixed(1)}</span>
            <span className="text-muted-foreground">/ 5</span>
            <span
              className={cn(
                "ml-1 rounded-full px-2.5 py-0.5 text-sm font-medium",
                avg >= 4
                  ? "bg-primary/10 text-primary"
                  : "bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
              )}
            >
              {verdictFor(avg)}
            </span>
          </p>
        </div>
        <div role="radiogroup" aria-label="Which version of the answer" className="inline-flex rounded-lg border bg-background p-0.5 text-sm">
          {(
            [
              ["draft", "First draft"],
              ["edited", "After edits"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={version === v}
              onClick={() => setVersion(v)}
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors",
                version === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {showTable ? (
        <table className="mt-6 w-full text-left text-sm">
          <caption className="sr-only">Reviewer scores out of 5</caption>
          <thead className="text-muted-foreground">
            <tr className="border-b">
              <th scope="col" className="py-2 font-medium">Reviewer</th>
              <th scope="col" className="py-2 text-right font-medium">Score</th>
              <th scope="col" className="py-2 pl-4 font-medium">Suggested fix</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.role} className="border-b align-top last:border-0">
                <th scope="row" className="py-2.5 font-normal">{r.role}</th>
                <td className="py-2.5 text-right tabular-nums">{r.score} / 5</td>
                <td className="py-2.5 pl-4 text-muted-foreground">{r.fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="mt-6" role="img" aria-label={`Bar chart: ${rows.map((r) => `${r.role} ${r.score} of 5`).join(", ")}. Average ${avg.toFixed(1)}.`}>
          <ul className="space-y-1" aria-hidden="true">
            {rows.map((r, i) => {
              const pct = (r.score / MAX) * 100;
              return (
                <li
                  key={r.role}
                  className="group relative grid grid-cols-1 gap-1.5 rounded-lg px-2 py-2 sm:grid-cols-[9.5rem_1fr] sm:items-center sm:gap-4"
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onClick={() => setActive(active === i ? null : i)}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">{r.role}</p>
                    <p className="text-xs text-muted-foreground">{r.focus}</p>
                  </div>
                  <div className="relative mr-10 h-8">
                    {/* gridlines at each score step: hairline, recessive */}
                    {Array.from({ length: MAX + 1 }, (_, k) => (
                      <span key={k} className="absolute inset-y-0 w-px bg-border" style={{ left: `${(k / MAX) * 100}%` }} />
                    ))}
                    <span
                      className="absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-[4px] bg-[var(--dossier-chart)] transition-[width] duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                    <span
                      className="absolute top-1/2 -translate-y-1/2 pl-2 text-sm font-semibold tabular-nums transition-[left] duration-700 ease-out"
                      style={{ left: `${pct}%` }}
                    >
                      {r.score}
                    </span>
                  </div>
                  {active === i ? (
                    <div className="pointer-events-none absolute -top-2 left-2 right-2 z-10 -translate-y-full rounded-lg border bg-popover px-3 py-2 text-sm shadow-lg sm:left-[11rem] sm:right-auto sm:max-w-xs">
                      <p className="font-medium">
                        {r.role} · {r.score} / 5
                      </p>
                      <p className="mt-0.5 text-muted-foreground">{r.fix}</p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <div className="mr-10 mt-1 grid grid-cols-1 px-2 sm:ml-[10.5rem] sm:grid-cols-1" aria-hidden="true">
            <div className="relative h-4 text-[11px] text-muted-foreground tabular-nums">
              {Array.from({ length: MAX + 1 }, (_, k) => (
                <span key={k} className="absolute -translate-x-1/2" style={{ left: `${(k / MAX) * 100}%` }}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-4 border-t pt-4 text-xs text-muted-foreground">
        <p>Reviewers are simulated from the program's own criteria. Tap a bar for its fix.</p>
        <button
          type="button"
          onClick={() => setShowTable((s) => !s)}
          aria-pressed={showTable}
          className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 hover:bg-muted hover:text-foreground"
        >
          <IconTable className="size-3.5" /> {showTable ? "Chart" : "Table"}
        </button>
      </div>
    </div>
  );
}

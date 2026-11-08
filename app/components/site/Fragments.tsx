import { IconCircleCheck, IconCircleX, IconDownload, IconHelpCircle, IconLink } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

/** Illustrations of real Dossier screens, built from the same tokens as the app. Data is fictional. */

const frame = "rounded-2xl border bg-card p-5 sm:p-6";

export function ProgramFragment() {
  return (
    <div className={frame} role="img" aria-label="A program card extracted from an official page: deadline in two time zones, eligibility rules, and gaps marked Not stated.">
      <div aria-hidden="true">
        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
          <IconLink className="size-4 shrink-0" />
          <span className="truncate">harborfoundation.example/scholarship/2027</span>
        </div>
        <p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">Scholarship · Harbor Foundation</p>
        <p className="dossier-serif mt-1 text-2xl font-medium">Harbor Leaders Scholarship</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">Deadline, theirs</dt>
            <dd className="mt-0.5 font-medium">Fri 20 Nov, 23:59 GMT</dd>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <dt className="text-xs text-muted-foreground">Deadline, yours</dt>
            <dd className="mt-0.5 font-medium">Fri 20 Nov, 18:59 Toronto</dd>
          </div>
        </dl>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex gap-2">
            <IconCircleCheck className="mt-0.5 size-4 shrink-0 text-primary" /> Open to all nationalities
          </li>
          <li className="flex gap-2">
            <IconCircleCheck className="mt-0.5 size-4 shrink-0 text-primary" /> At least two years of full-time work
          </li>
          <li className="flex gap-2">
            <IconHelpCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <span>
              IELTS 6.5 or equivalent <span className="text-muted-foreground">· confirm your score</span>
            </span>
          </li>
          <li className="flex gap-2 text-muted-foreground">
            <span className="mt-0.5 inline-block size-4 shrink-0 rounded-full border border-dashed" />
            Interview format: <em>Not stated</em>
          </li>
        </ul>
      </div>
    </div>
  );
}

const MAP_QUESTIONS = ["Led change in your community", "Why this course", "Proudest achievement"];
const MAP_STORIES = ["Clinic test kits", "Data club", "Health leaflets", "Night shifts"];
const MAP_SCORES = [
  [92, 74, 66, 38],
  [58, 41, 71, 30],
  [80, 69, 62, 55],
];

function tone(score: number) {
  if (score >= 80) return "bg-primary text-primary-foreground";
  if (score >= 70) return "bg-primary/70 text-primary-foreground";
  if (score >= 50) return "bg-primary/25 text-foreground";
  return "bg-secondary text-muted-foreground";
}

export function StoryMapFragment() {
  return (
    <div className={frame}>
      <table className="w-full table-fixed border-separate border-spacing-1 text-sm">
        <caption className="sr-only">How well each story fits each question, 0 to 100. The highest in each row is the best story for that question.</caption>
        <thead>
          <tr>
            <th scope="col" className="w-[34%] p-1 text-left text-xs font-normal text-muted-foreground">
              Question
            </th>
            {MAP_STORIES.map((s) => (
              <th key={s} scope="col" className="p-1 text-left align-bottom text-xs font-medium leading-tight">
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MAP_QUESTIONS.map((q, i) => {
            const row = MAP_SCORES[i]!;
            const best = Math.max(...row);
            return (
              <tr key={q}>
                <th scope="row" className="p-1 text-left text-xs font-normal leading-tight">
                  {q}
                </th>
                {row.map((score, j) => (
                  <td key={j} className="p-0">
                    <div
                      title={`${MAP_STORIES[j]} for “${q}”: ${score}`}
                      className={cn(
                        "flex h-11 items-center justify-center rounded-md font-semibold tabular-nums",
                        tone(score),
                        score === best && "ring-2 ring-foreground/70 ring-offset-1 ring-offset-card",
                      )}
                    >
                      {score}
                      {score === best ? <span className="sr-only"> (best)</span> : null}
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted-foreground">Fit scores, 0–100 · outlined = best story for that question</p>
    </div>
  );
}

const CHECKS = [
  { ok: true, label: "Eligibility: every rule met" },
  { ok: true, label: "Checklist: 5 of 5 done" },
  { ok: true, label: "Question 1: 248 / 250 words" },
  { ok: true, label: "Question 2: committee says Likely shortlist" },
  { ok: false, label: "Question 3 has no answer", fix: "Draft it from “Health leaflets”" },
];

export function ReadinessFragment() {
  return (
    <div className={frame} role="img" aria-label="Readiness check: four items done, one must-fix item with its fix, and a button to download the application packet.">
      <div aria-hidden="true">
        <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          <IconCircleX className="size-4 shrink-0" /> Not ready yet: 1 must-fix item
        </div>
        <ul className="mt-3 divide-y text-sm">
          {CHECKS.map((c) => (
            <li key={c.label} className="flex items-start gap-2.5 py-2.5">
              {c.ok ? (
                <IconCircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              ) : (
                <IconCircleX className="mt-0.5 size-4 shrink-0 text-red-600" />
              )}
              <span className={cn("flex-1", c.ok && "text-muted-foreground")}>
                {c.label}
                {c.fix ? <span className="block text-xs text-muted-foreground">{c.fix}</span> : null}
              </span>
              {c.fix ? <span className="text-xs font-medium text-primary">Fix</span> : null}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5 text-sm">
          <IconDownload className="size-4 shrink-0" />
          <span className="flex-1">Application packet · harbor-leaders.md</span>
          <span className="text-xs text-muted-foreground">Print or PDF</span>
        </div>
      </div>
    </div>
  );
}

export function ChatFragment() {
  return (
    <div className={cn(frame, "space-y-4")} role="img" aria-label="A chat with Dossier: asked what is due in the next two weeks, it names the deadline in both time zones and the two remaining tasks.">
      <div aria-hidden="true" className="space-y-4">
        <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-foreground px-4 py-2.5 text-sm text-background">
          What's due in the next two weeks?
        </div>
        <div className="max-w-[92%] space-y-2 text-sm leading-relaxed">
          <p>
            <span className="font-medium">Harbor Leaders Scholarship</span> closes Friday 20 November at 23:59 GMT. That's
            18:59 on Friday in Toronto.
          </p>
          <p>Two things are left:</p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Upload your certified transcript</li>
            <li>Question 3 has no answer yet</li>
          </ul>
          <p>Want me to draft question 3 from your “Health leaflets” story? You'll see it as a suggestion first.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border px-3 py-1">Draft question 3</span>
          <span className="rounded-full border px-3 py-1">Open the checklist</span>
        </div>
      </div>
    </div>
  );
}

const FLAGS = [
  { sentence: "In today's fast-paced world, healthcare is more important than ever.", reason: "Stock opening. Your samples start with a concrete moment." },
  { sentence: "This prestigious scholarship would be a unique opportunity.", reason: "Could be in anyone's essay. You never write like this." },
];

export function VoiceFragment() {
  return (
    <div className={frame} role="img" aria-label="Voice check: a sounds-like-you score of 54 out of 100 and two sentences flagged as possibly generic, each with a reason.">
      <div aria-hidden="true">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Sounds like you</p>
            <p className="mt-1 text-4xl font-semibold tabular-nums">
              54<span className="text-lg font-normal text-muted-foreground">/100</span>
            </p>
          </div>
          <p className="max-w-[12rem] text-right text-xs text-muted-foreground">Compared with 1 writing sample you added</p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
          <div className="h-full w-[54%] rounded-full bg-[var(--dossier-chart)]" />
        </div>
        <ul className="mt-5 space-y-4">
          {FLAGS.map((f) => (
            <li key={f.sentence} className="text-sm">
              <p className="dossier-serif dossier-flag text-base leading-relaxed">{f.sentence}</p>
              <p className="mt-1 text-xs text-muted-foreground">May sound generic: {f.reason}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

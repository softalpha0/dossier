import { sendToAgentChat } from "@agent-native/core/client/agent-chat";
import { useActionQuery } from "@agent-native/core/client/hooks";
import { IconUsersGroup } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const VERDICT_TONE: Record<string, string> = {
  "Likely shortlist": "bg-primary/10 text-primary",
  Borderline: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  Unlikely: "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200",
};

export function CommitteePanel({ programId, programTitle }: { programId: string; programTitle: string }) {
  const panel = useActionQuery("get-review-panel", { programId });

  const build = () =>
    sendToAgentChat({
      message: `Build the simulated committee panel for "${programTitle}" from its selection criteria.`,
      context: JSON.stringify({ task: "build-review-panel", programId }),
      submit: true,
      // Each task gets its own chat, so a stuck or long earlier chat can't hold it in a queue.
      newTab: true,
      openSidebar: true,
    });
  const review = () =>
    sendToAgentChat({
      message: `Have the committee review my answer for "${programTitle}".\nQuestion: \nMy answer:\n`,
      context: JSON.stringify({ task: "panel-review", programId }),
      submit: false,
      openSidebar: true,
    });

  return (
    <section id="committee" aria-labelledby="committee-title">
      <div className="mb-3 flex items-baseline justify-between border-b pb-2">
        <h2 id="committee-title" className="dossier-serif text-xl font-medium">
          Committee panel
        </h2>
        <span className="text-xs text-muted-foreground">Simulated reviewers</span>
      </div>

      {panel.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-3" aria-busy="true">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : panel.error ? (
        <p role="alert" className="text-sm text-muted-foreground">
          We couldn't load the committee.{" "}
          <button className="underline" onClick={() => panel.refetch()}>
            Try again
          </button>
        </p>
      ) : !panel.data?.reviewers.length ? (
        <div className="rounded-lg border border-dashed bg-card p-5">
          <p className="text-sm text-muted-foreground">
            Three simulated reviewers, built from this program's own criteria, score your answers
            before the real committee does.
          </p>
          <Button className="mt-4" onClick={build}>
            <IconUsersGroup className="size-4" /> Build committee panel
          </Button>
        </div>
      ) : (
        <>
          <ul className="grid gap-3 sm:grid-cols-3">
            {panel.data.reviewers.map((r) => (
              <li key={r.id} className="rounded-lg border bg-card p-4">
                <p className="font-medium">{r.name}</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{r.role}</p>
                {r.values ? <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{r.values}</p> : null}
              </li>
            ))}
          </ul>

          {panel.data.latestRun ? (
            <div className="mt-4 rounded-lg border bg-card p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-sm font-medium",
                    VERDICT_TONE[panel.data.latestRun.verdict] ?? "bg-secondary",
                  )}
                >
                  {panel.data.latestRun.verdict}
                </span>
                <span className="text-sm text-muted-foreground">
                  Average {panel.data.latestRun.average.toFixed(1)} / 5 · latest review
                </span>
              </div>
              <ul className="mt-3 space-y-3">
                {panel.data.latestRun.reviews.map((rv) => (
                  <li key={rv.reviewerId} className="text-sm">
                    <p>
                      <span className="font-medium">{rv.reviewerName}</span>{" "}
                      <span className="text-muted-foreground">· {rv.score}/5</span>
                    </p>
                    {rv.bestLine ? <p className="text-muted-foreground">Best: "{rv.bestLine}"</p> : null}
                    {rv.weakestLine ? <p className="text-muted-foreground">Weakest: "{rv.weakestLine}"</p> : null}
                    {rv.fix ? <p>Fix: {rv.fix}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={review}>Review an answer</Button>
            <Button variant="ghost" onClick={build}>
              Rebuild panel
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

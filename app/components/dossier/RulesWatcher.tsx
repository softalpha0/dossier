import { actionErrorMessage, useActionMutation, useActionQuery } from "@agent-native/core/client/hooks";
import { IconCheck, IconEye, IconMessageCircle, IconMinus, IconPlus, IconRefresh } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { sendAgentTask } from "@/lib/agent-task";
import { cn } from "@/lib/utils";

type Change = {
  id: string;
  programId: string;
  programTitle: string;
  added: string[];
  removed: string[];
  detectedAt: string;
};

const when = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "never";

/** Program page: what changed on the official page since the last check. */
export function ProgramChangesBanner({ programId, programTitle }: { programId: string; programTitle: string }) {
  const query = useActionQuery("list-program-changes", { programId });
  const review = useActionMutation("review-program-change");
  const [expanded, setExpanded] = useState(false);
  const changes = (query.data?.changes ?? []) as Change[];
  if (!changes.length) return null;
  const latest = changes[0]!;
  const lines = [
    ...latest.removed.map((t) => ({ kind: "removed" as const, t })),
    ...latest.added.map((t) => ({ kind: "added" as const, t })),
  ];
  const shown = expanded ? lines : lines.slice(0, 6);

  return (
    <section
      aria-labelledby="changes-title"
      className="mt-6 rounded-lg border border-amber-300 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/30 sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="changes-title" className="font-medium">
          The official page changed
        </h2>
        <p className="text-xs text-muted-foreground">
          Detected {when(latest.detectedAt)}
          {changes.length > 1 ? ` · ${changes.length - 1} earlier change${changes.length > 2 ? "s" : ""} not reviewed` : ""}
        </p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Dossier hasn't changed your program card. Check what's different and update anything that matters.
      </p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {shown.map((l, i) => (
          <li key={i} className="flex gap-2">
            {l.kind === "added" ? (
              <IconPlus className="mt-0.5 size-4 shrink-0 text-primary" aria-label="Added" />
            ) : (
              <IconMinus className="mt-0.5 size-4 shrink-0 text-red-600" aria-label="Removed" />
            )}
            <span className={cn(l.kind === "removed" && "text-muted-foreground line-through decoration-muted-foreground/40")}>
              {l.t}
            </span>
          </li>
        ))}
      </ul>
      {lines.length > 6 ? (
        <button type="button" className="mt-2 text-sm underline underline-offset-4" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Show less" : `Show all ${lines.length} lines`}
        </button>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            void sendAgentTask({
              message: `The official page for "${programTitle}" changed. List each change as before → after in plain words, then tell me exactly what to update in my checklist, deadline or answers, and offer to make those updates.`,
              context: JSON.stringify({ task: "explain-program-change", programId, changeId: latest.id }),
            })
          }
        >
          <IconMessageCircle className="size-4" /> Ask coach what this means
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={review.isPending}
          onClick={() =>
            review.mutate(
              { id: latest.id },
              {
                onSuccess: () => toast.success("Marked as reviewed."),
                onError: (e) => toast.error(actionErrorMessage(e) ?? "Couldn't update. Try again."),
              },
            )
          }
        >
          {review.isPending ? <Spinner className="size-4" /> : <IconCheck className="size-4" />} Mark as reviewed
        </Button>
      </div>
    </section>
  );
}

/** Program page: "Last checked … · Check now" next to the official link. */
export function CheckForChanges({ programId, lastCheckedAt }: { programId: string; lastCheckedAt: string | null }) {
  const recheck = useActionMutation("recheck-program");
  return (
    <span className="ml-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      Last checked {when(lastCheckedAt)} ·
      <button
        type="button"
        disabled={recheck.isPending}
        className="inline-flex items-center gap-1 underline-offset-4 hover:text-foreground hover:underline disabled:opacity-60"
        onClick={() =>
          recheck.mutate(
            { programId },
            {
              onSuccess: (r) => {
                const status = (r as { status: string }).status;
                if (status === "changed") toast.warning("The official page changed. See what's different above.");
                else if (status === "baseline") toast.success("Saved a copy of the page. Future checks compare against it.");
                else if (status === "unchanged") toast.success("No changes since the last check.");
                else if (status === "sample") toast.info("Sample programs use a fictional page, so there's nothing to check online.");
                else if (status === "error") toast.error((r as { message?: string }).message ?? "Couldn't read the page.");
              },
              onError: (e) => toast.error(actionErrorMessage(e) ?? "Couldn't check the page. Try again."),
            },
          )
        }
      >
        {recheck.isPending ? <Spinner className="size-3" /> : <IconRefresh className="size-3" />}
        {recheck.isPending ? "Checking…" : "Check now"}
      </button>
    </span>
  );
}

/**
 * Board: the rules watcher switch, unreviewed changes across programs, and a quiet
 * re-check of programs not checked for 3+ days each time the board opens.
 */
export function BoardWatcher() {
  const changesQuery = useActionQuery("list-program-changes", {});
  const watcher = useActionMutation("rules-watcher");
  const due = useActionMutation("recheck-due-programs");
  const [state, setState] = useState<{ enabled: boolean; nextRun: string | null } | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    watcher.mutate({}, { onSuccess: (r) => setState(r as { enabled: boolean; nextRun: string | null }) });
    due.mutate({ max: 3 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changes = (changesQuery.data?.changes ?? []) as Change[];
  const byProgram = [...new Map(changes.map((c) => [c.programId, c])).values()];

  function toggle() {
    const next = !state?.enabled;
    watcher.mutate(
      { enabled: next },
      {
        onSuccess: (r) => {
          setState(r as { enabled: boolean; nextRun: string | null });
          toast.success(next ? "Rules watcher on. Official pages are re-checked every 3 days." : "Rules watcher off.");
        },
        onError: (e) => toast.error(actionErrorMessage(e) ?? "Couldn't change the watcher. Try again."),
      },
    );
  }

  return (
    <div className="mb-6 space-y-3">
      {byProgram.length ? (
        <div role="status" className="rounded-lg border border-amber-300 bg-amber-50/70 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <p className="font-medium">
            {byProgram.length === 1 ? "An official page changed" : `${byProgram.length} official pages changed`}
          </p>
          <ul className="mt-1 space-y-0.5">
            {byProgram.map((c) => (
              <li key={c.programId}>
                <Link to={`/programs/${c.programId}`} className="underline underline-offset-4">
                  {c.programTitle}
                </Link>{" "}
                <span className="text-muted-foreground">
                  · {c.added.length} line{c.added.length === 1 ? "" : "s"} added, {c.removed.length} removed
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <IconEye className="size-4" aria-hidden="true" />
        <span>
          Rules watcher:{" "}
          <span className="font-medium text-foreground">{state === null ? "…" : state.enabled ? "on" : "off"}</span>
          {state?.enabled && state.nextRun ? ` · next check ${when(state.nextRun)}` : ""}
          {due.isPending ? " · checking pages…" : ""}
        </span>
        <Button size="sm" variant="outline" className="h-7" disabled={state === null || watcher.isPending} onClick={toggle}>
          {state?.enabled ? "Turn off" : "Watch for rule changes"}
        </Button>
      </div>
    </div>
  );
}

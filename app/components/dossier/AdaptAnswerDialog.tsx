import { actionErrorMessage, useActionQuery } from "@agent-native/core/client/hooks";
import { IconArrowsShuffle, IconCheck } from "@tabler/icons-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { sendAgentTask } from "@/lib/agent-task";
import { cn } from "@/lib/utils";

type Target = {
  questionId: string;
  questionNumber: number;
  text: string;
  wordLimit: number | null;
  charLimit: number | null;
  programId: string;
  programTitle: string;
  sameProgram: boolean;
  hasAnswer: boolean;
  answerWords: number;
};

const limitLabel = (t: Target) =>
  t.wordLimit ? `${t.wordLimit} words` : t.charLimit ? `${t.charLimit} characters` : "No limit stated";

/** S6: reuse a finished answer for another program's question. The coach does the rewriting. */
export function AdaptAnswerDialog({
  sourceQuestionId,
  sourceProgramId,
  disabled,
  beforeSend,
}: {
  sourceQuestionId: string;
  sourceProgramId: string;
  disabled?: boolean;
  beforeSend?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const query = useActionQuery("list-adapt-targets", { sourceQuestionId }, { enabled: open });
  const targets = (query.data?.targets ?? []) as Target[];

  const groups = useMemo(() => {
    const map = new Map<string, { title: string; same: boolean; items: Target[] }>();
    for (const t of targets) {
      const g = map.get(t.programId) ?? { title: t.programTitle, same: t.sameProgram, items: [] };
      g.items.push(t);
      map.set(t.programId, g);
    }
    // Other programs first: that's the usual reason to adapt.
    return [...map.entries()].sort((a, b) => Number(a[1].same) - Number(b[1].same));
  }, [targets]);

  const chosen = targets.find((t) => t.questionId === picked);

  function adapt() {
    if (!chosen) return;
    beforeSend?.();
    void sendAgentTask({
      message: `Adapt my answer for ${chosen.programTitle}, question ${chosen.questionNumber}: "${chosen.text}" (${limitLabel(chosen)}).${
        chosen.hasAnswer ? " That question already has an answer, so suggest changes to it instead of replacing it." : ""
      }`,
      context: JSON.stringify({
        task: "adapt-answer",
        sourceQuestionId,
        sourceProgramId,
        targetQuestionId: chosen.questionId,
        targetProgramId: chosen.programId,
      }),
    });
    setOpen(false);
    setPicked(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <IconArrowsShuffle className="size-4" /> Adapt for another program
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Adapt this answer</DialogTitle>
          <DialogDescription>
            Pick the question to reuse it for. The coach reshapes it for that question and its limit, using only facts from
            your answer and stories. Empty answers get a draft; answers with text get suggestions.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto pr-1">
          {query.isLoading ? (
            <div className="space-y-2" aria-busy="true" aria-label="Loading questions">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : query.error ? (
            <p role="alert" className="text-sm text-muted-foreground">
              {actionErrorMessage(query.error) ?? "We couldn't load your other questions."}{" "}
              <button className="underline" onClick={() => query.refetch()}>
                Try again
              </button>
            </p>
          ) : groups.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              No other questions yet. Add another program, then come back to reuse this answer.
            </p>
          ) : (
            <div className="space-y-5" role="radiogroup" aria-label="Question to adapt for">
              {groups.map(([programId, g]) => (
                <section key={programId}>
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {g.same ? `${g.title} · this program` : g.title}
                  </h3>
                  <ul className="space-y-1.5">
                    {g.items.map((t) => {
                      const on = picked === t.questionId;
                      return (
                        <li key={t.questionId}>
                          <button
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => setPicked(t.questionId)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                              on ? "border-primary bg-primary/5" : "hover:bg-muted/60",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                                on && "border-primary bg-primary text-primary-foreground",
                              )}
                            >
                              {on ? <IconCheck className="size-3" /> : null}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="line-clamp-2">
                                Q{t.questionNumber}. {t.text}
                              </span>
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {limitLabel(t)} · {t.hasAnswer ? `has ${t.answerWords} words, will get suggestions` : "empty, will get a draft"}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={adapt} disabled={!chosen}>
            <IconArrowsShuffle className="size-4" /> Adapt answer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

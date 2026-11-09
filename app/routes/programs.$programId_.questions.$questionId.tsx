import { sendToAgentChat } from "@agent-native/core/client/agent-chat";
import {
  actionErrorMessage,
  useActionMutation,
  useActionQuery,
  writeClientAppState,
} from "@agent-native/core/client/hooks";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCheck,
  IconMessageCircle,
  IconWriting,
  IconUsersGroup,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TAB_ID } from "@/lib/tab-id";
import { cn } from "@/lib/utils";
import { AdaptAnswerDialog } from "@/components/dossier/AdaptAnswerDialog";
import { sendAgentTask } from "@/lib/agent-task";

export function meta() {
  return [{ title: "Answer · Dossier" }];
}

const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);
const ORIGIN: Record<string, string> = { coach: "Coach", voice: "Your voice", panel: "Committee" };
const VERDICT_TONE: Record<string, string> = {
  "Likely shortlist": "bg-primary/10 text-primary",
  Borderline: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  Unlikely: "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200",
};

export default function AnswerEditor() {
  const { programId = "", questionId = "" } = useParams();
  const query = useActionQuery("get-answer", { questionId });
  const save = useActionMutation("save-answer");
  const resolve = useActionMutation("resolve-suggestion");

  const [text, setText] = useState("");
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const loaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const serverContent = query.data?.answer?.content ?? "";
  // Adopt server text on first load, and whenever the agent changes it while
  // the user has no unsaved typing (draft created, suggestion accepted).
  useEffect(() => {
    if (!query.data) return;
    if (!loaded.current || !dirty) {
      setText(serverContent);
      loaded.current = true;
    }
  }, [query.data, serverContent, dirty]);

  useEffect(() => {
    if (!dirty) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      save.mutate(
        { questionId, content: text },
        {
          onSuccess: (r) => {
            setSavedAt(r.savedAt);
            setDirty(false);
          },
          onError: (err) => toast.error(actionErrorMessage(err) ?? "Couldn't save — keep this tab open and try again."),
        },
      );
    }, 900);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, dirty, questionId]);

  const words = countWords(text);
  const chars = [...text].length;
  const q = query.data?.question;
  const wordTone = limitTone(words, q?.wordLimit ?? null);
  const charTone = limitTone(chars, q?.charLimit ?? null);

  const flaggedSentences = useMemo(() => {
    const voice = query.data?.answer?.voiceFlags ?? [];
    const generic = query.data?.genericHits ?? [];
    const out: { sentence: string; reason: string }[] = [...voice];
    for (const g of generic)
      if (!out.some((o) => o.sentence === g.sentence))
        out.push({ sentence: g.sentence, reason: `Stock phrase “${g.phrase}” — may sound generic` });
    return out.filter((f) => text.includes(f.sentence));
  }, [query.data, text]);

  function onSelect(e: React.SyntheticEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    const selected = el.value.slice(el.selectionStart, el.selectionEnd).trim();
    void writeClientAppState(
      `selection:${TAB_ID}`,
      selected ? { kind: "answer-text", programId, questionId, text: selected.slice(0, 500) } : null,
      { requestSource: TAB_ID },
    ).catch(() => {});
  }

  function ask(message: string, submit: boolean, task: string) {
    if (dirty) save.mutate({ questionId, content: text });
    const context = JSON.stringify({ task, programId, questionId });
    // Submitted tasks (voice check, committee) get their own chat; "Ask coach" prefills the current one.
    if (submit) void sendAgentTask({ message, context });
    else sendToAgentChat({ message, context, submit: false, openSidebar: true });
  }

  if (query.isLoading)
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 sm:px-6" aria-busy="true" aria-label="Loading answer">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-80 w-full" />
      </div>
    );

  if (query.error || !query.data || !q)
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <BackLink programId={programId} />
        <div role="alert" className="mt-6 rounded-lg border bg-card p-6">
          <h1 className="dossier-serif text-2xl font-medium">We couldn't open this question</h1>
          <p className="mt-2 text-muted-foreground">{actionErrorMessage(query.error) ?? "It may have been deleted."}</p>
          <Button className="mt-4" variant="outline" onClick={() => query.refetch()}>
            Try again
          </Button>
        </div>
      </div>
    );

  const { answer, suggestions } = query.data;
  const panelTone = answer?.panelVerdict ? VERDICT_TONE[answer.panelVerdict] : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <BackLink programId={programId} title={query.data.program.title} />
      <h1 className="dossier-serif mt-3 max-w-3xl text-2xl font-medium leading-snug sm:text-3xl">{q.text}</h1>
      {q.notes ? <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{q.notes}</p> : null}

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="sticky top-0 z-10 -mx-1 mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 bg-background/95 px-1 py-2 text-sm backdrop-blur-none">
            <span className={cn("font-medium tabular-nums", wordTone.cls)} aria-live="polite">
              {words}
              {q.wordLimit ? ` / ${q.wordLimit}` : ""} words
            </span>
            <span className={cn("tabular-nums", charTone.cls)}>
              {chars}
              {q.charLimit ? ` / ${q.charLimit}` : ""} characters
            </span>
            {wordTone.note || charTone.note ? (
              <span className="text-red-700 dark:text-red-300">{wordTone.note || charTone.note}</span>
            ) : null}
            <span className="ml-auto text-xs text-muted-foreground">
              {save.isPending || dirty ? "Saving…" : savedAt || answer ? "Saved" : ""}
            </span>
          </div>

          {!answer && !text ? (
            <div className="mb-3 rounded-lg border border-dashed bg-card p-4 text-sm">
              <p className="text-muted-foreground">
                Start typing, or let the coach write a first draft from one of your stories. You'll edit it from there.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    ask(
                      `Draft a first answer to this question from my best-fitting story. Keep it within the limit and use only facts from my story.`,
                      true,
                      "draft-answer",
                    )
                  }
                >
                  Draft from my best story
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/programs/${programId}/map`}>Pick a story on the map</Link>
                </Button>
              </div>
            </div>
          ) : null}

          <label htmlFor="answer-text" className="sr-only">
            Your answer
          </label>
          <textarea
            id="answer-text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setDirty(true);
            }}
            onSelect={onSelect}
            placeholder="Write your answer here…"
            className="dossier-serif min-h-[55vh] w-full resize-y rounded-lg border bg-card p-5 text-[1.15rem] leading-relaxed shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-7"
          />
        </div>

        <aside className="space-y-6" aria-label="Feedback">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!text.trim()}
              onClick={() => ask("Check my voice on this answer.", true, "voice-check")}
            >
              <IconWriting className="size-4" /> Check my voice
            </Button>
            <Button
              size="sm"
              disabled={!text.trim()}
              onClick={() => ask("Run the committee review on this answer.", true, "panel-review")}
            >
              <IconUsersGroup className="size-4" /> Run committee review
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => ask("Help me improve this answer: ", false, "coach")}
            >
              <IconMessageCircle className="size-4" /> Ask coach
            </Button>
            <AdaptAnswerDialog
              sourceQuestionId={questionId}
              sourceProgramId={programId}
              disabled={!text.trim()}
              beforeSend={() => {
                if (dirty) save.mutate({ questionId, content: text });
              }}
            />
          </div>

          <Panel title="Suggestions" aside={suggestions.length ? String(suggestions.length) : undefined}>
            {suggestions.length ? (
              <ul className="space-y-3">
                {suggestions.map((s) => (
                  <li key={s.id} className="rounded-lg border bg-card p-3 text-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{ORIGIN[s.origin] ?? s.origin}</p>
                    <p className="mt-1 text-red-800 line-through decoration-red-400 dark:text-red-300">{s.findText}</p>
                    {s.replaceText ? <p className="mt-1 text-primary">{s.replaceText}</p> : <p className="mt-1 text-muted-foreground">(remove)</p>}
                    {s.reason ? <p className="mt-2 text-muted-foreground">{s.reason}</p> : null}
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        disabled={resolve.isPending || dirty}
                        onClick={() =>
                          resolve.mutate(
                            { id: s.id, decision: "accept" },
                            {
                              onSuccess: (r) => {
                                if ("content" in r && typeof r.content === "string") setText(r.content);
                                toast.success("Suggestion applied");
                              },
                              onError: (err) => toast.error(actionErrorMessage(err) ?? "Couldn't apply it."),
                            },
                          )
                        }
                      >
                        <IconCheck className="size-4" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={resolve.isPending}
                        onClick={() =>
                          resolve.mutate(
                            { id: s.id, decision: "reject" },
                            { onError: (err) => toast.error(actionErrorMessage(err) ?? "Couldn't reject it.") },
                          )
                        }
                      >
                        <IconX className="size-4" /> Reject
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                The coach's edits appear here for you to accept or reject. Your words are never changed without you.
              </p>
            )}
          </Panel>

          <Panel
            title="Sounds like you"
            aside={answer?.voiceScore != null ? `${answer.voiceScore}/100` : undefined}
          >
            {answer?.voiceScore != null ? (
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
                <div
                  className={cn("h-full rounded-full", answer.voiceScore >= 70 ? "bg-primary" : answer.voiceScore >= 50 ? "bg-amber-500" : "bg-red-500")}
                  style={{ width: `${answer.voiceScore}%` }}
                />
              </div>
            ) : null}
            {flaggedSentences.length ? (
              <ul className="space-y-2 text-sm">
                {flaggedSentences.map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                    <span>
                      “{f.sentence}”<span className="block text-muted-foreground">{f.reason}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {answer?.voiceScore != null
                  ? "Nothing flagged right now."
                  : "Run “Check my voice” to compare this answer with your writing samples."}
              </p>
            )}
          </Panel>

          <Panel title="Committee" aside="Simulated">
            {answer?.panelVerdict ? (
              <p className="text-sm">
                <span className={cn("rounded px-2 py-0.5 font-medium", panelTone)}>{answer.panelVerdict}</span>
                <span className="ml-2 text-muted-foreground">
                  average {answer.panelAverage?.toFixed(1)} / 5 ·{" "}
                  <Link className="underline-offset-4 hover:underline" to={`/programs/${programId}#committee`}>
                    details
                  </Link>
                </span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Three reviewers built from this program's criteria score your answer.</p>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function limitTone(count: number, limit: number | null) {
  if (!limit) return { cls: "text-muted-foreground", note: "" };
  if (count > limit) return { cls: "text-red-700 dark:text-red-300", note: `${count - limit} over the limit` };
  if (count >= limit * 0.9) return { cls: "text-amber-700 dark:text-amber-300", note: "" };
  return { cls: "text-foreground", note: "" };
}

function Panel({ title, aside, children }: { title: string; aside?: string | undefined; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between border-b pb-1.5">
        <h2 className="text-sm font-semibold">{title}</h2>
        {aside ? <span className="text-xs text-muted-foreground">{aside}</span> : null}
      </div>
      {children}
    </section>
  );
}

function BackLink({ programId, title }: { programId: string; title?: string }) {
  return (
    <Link
      to={`/programs/${programId}`}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <IconArrowLeft className="size-4" /> {title ?? "Back to program"}
    </Link>
  );
}

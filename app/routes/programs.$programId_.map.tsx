import { sendToAgentChat } from "@agent-native/core/client/agent-chat";
import { actionErrorMessage, useActionQuery } from "@agent-native/core/client/hooks";
import { IconAlertTriangle, IconArrowLeft, IconMap2 } from "@tabler/icons-react";
import { Link, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function meta() {
  return [{ title: "Story map · Dossier" }];
}

function cellTone(score: number | undefined) {
  if (score == null) return "bg-muted/40 text-muted-foreground";
  if (score >= 80) return "bg-primary text-primary-foreground";
  if (score >= 70) return "bg-primary/70 text-primary-foreground";
  if (score >= 50) return "bg-primary/25 text-foreground";
  return "bg-secondary text-muted-foreground";
}

export default function StoryMap() {
  const { programId = "" } = useParams();
  const query = useActionQuery("get-story-map", { programId });

  const map = () =>
    sendToAgentChat({
      message: "Map my stories to this program's questions.",
      context: JSON.stringify({ task: "map-stories", programId }),
      submit: true,
      // Each task gets its own chat, so a stuck or long earlier chat can't hold it in a queue.
      newTab: true,
      openSidebar: true,
    });
  const draftFrom = (questionId: string, storyTitle: string, storyId: string) =>
    sendToAgentChat({
      message: `Draft my answer to this question from my story "${storyTitle}", then open the editor.`,
      context: JSON.stringify({ task: "draft-answer", programId, questionId, storyId }),
      submit: true,
      // Each task gets its own chat, so a stuck or long earlier chat can't hold it in a queue.
      newTab: true,
      openSidebar: true,
    });

  const back = (
    <Link to={`/programs/${programId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <IconArrowLeft className="size-4" /> {query.data?.program.title ?? "Back to program"}
    </Link>
  );

  if (query.isLoading)
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 sm:px-6" aria-busy="true" aria-label="Loading story map">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  if (query.error || !query.data)
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {back}
        <p role="alert" className="mt-6 text-muted-foreground">
          {actionErrorMessage(query.error) ?? "We couldn't load the story map."}{" "}
          <button className="underline" onClick={() => query.refetch()}>
            Try again
          </button>
        </p>
      </div>
    );

  const { questions, stories, fits, mapped, uncovered } = query.data;
  const fitOf = (qId: string, sId: string) => fits.find((f) => f.questionId === qId && f.storyId === sId);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
      {back}
      <header className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="dossier-serif text-3xl font-medium sm:text-4xl">Story map</h1>
          <p className="mt-1 max-w-xl text-muted-foreground">
            Which of your experiences answers each question best — so you use your strongest story where it counts.
          </p>
        </div>
        {stories.length && questions.length ? (
          <Button size="lg" variant={mapped ? "outline" : "default"} onClick={map}>
            <IconMap2 className="size-4" /> {mapped ? "Map again" : "Map my stories"}
          </Button>
        ) : null}
      </header>

      {!questions.length ? (
        <Empty>This program has no application questions to map.</Empty>
      ) : !stories.length ? (
        <Empty>
          Your story bank is empty. <Link className="underline" to="/stories">Add two or three stories</Link> first.
        </Empty>
      ) : !mapped ? (
        <Empty>
          {stories.length} {stories.length === 1 ? "story" : "stories"} × {questions.length}{" "}
          {questions.length === 1 ? "question" : "questions"}. Click <strong>Map my stories</strong> and the coach scores how
          well each story fits each question.
        </Empty>
      ) : (
        <>
          {uncovered.length ? (
            <p className="mt-6 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              <IconAlertTriangle className="size-4 shrink-0" />
              {uncovered.length} question{uncovered.length === 1 ? " has" : "s have"} no strong story yet — consider adding one to
              your story bank.
            </p>
          ) : null}
          <div className="mt-6 overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th scope="col" className="w-[38%] border-b p-3 text-left font-medium text-muted-foreground">
                    Question
                  </th>
                  {stories.map((s) => (
                    <th key={s.id} scope="col" className="border-b p-3 text-left align-bottom font-medium">
                      <span className="block">{s.title}</span>
                      {s.overused ? (
                        <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                          Over-used
                        </span>
                      ) : null}
                    </th>
                  ))}
                  <th scope="col" className="border-b p-3" />
                </tr>
              </thead>
              <tbody>
                {questions.map((q, i) => {
                  const best = stories.find((s) => s.id === q.bestStoryId);
                  return (
                    <tr key={q.id} className="align-top">
                      <th scope="row" className="border-b p-3 text-left font-normal">
                        <span className="text-xs text-muted-foreground">Q{i + 1}</span>
                        <span className="block line-clamp-3">{q.text}</span>
                        {!q.covered ? <span className="mt-1 block text-xs text-amber-700">No strong story</span> : null}
                      </th>
                      {stories.map((s) => {
                        const f = fitOf(q.id, s.id);
                        const isBest = q.bestStoryId === s.id;
                        return (
                          <td key={s.id} className="border-b p-2">
                            <div
                              title={f?.reason ?? "Not scored"}
                              className={cn(
                                "flex min-h-12 flex-col justify-center rounded-md px-2 py-1.5 text-center tabular-nums",
                                cellTone(f?.score),
                                isBest && "ring-2 ring-foreground/70",
                              )}
                            >
                              <span className="font-semibold">{f?.score ?? "–"}</span>
                              {f?.reason ? <span className="line-clamp-2 text-[11px] leading-tight opacity-90">{f.reason}</span> : null}
                            </div>
                          </td>
                        );
                      })}
                      <td className="border-b p-2 text-right">
                        {best ? (
                          <Button size="sm" onClick={() => draftFrom(q.id, best.title, best.id)}>
                            Draft from “{best.title}”
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/programs/${programId}/questions/${q.id}`}>Write it</Link>
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Scores 0–100 · outlined cell = best story for that question · 70+ counts as a strong fit.</p>
        </>
      )}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="mt-8 rounded-xl border border-dashed bg-card px-6 py-10 text-center text-muted-foreground">{children}</div>;
}

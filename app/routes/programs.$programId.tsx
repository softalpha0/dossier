import {
  actionErrorMessage,
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconExternalLink,
  IconTrash,
} from "@tabler/icons-react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@agent-native/toolkit/ui/alert-dialog";
import { CommitteePanel } from "@/components/dossier/CommitteePanel";
import { CheckForChanges, ProgramChangesBanner } from "@/components/dossier/RulesWatcher";
import { ChecklistSection, EligibilitySection } from "@/components/dossier/ProgramSections";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { deadlineView, STAGES, TONE_CLASSES, typeLabel } from "@/lib/dossier";
import { cn } from "@/lib/utils";

export function meta() {
  return [{ title: "Program · Dossier" }];
}


export default function ProgramDetail() {
  const { programId = "" } = useParams();
  const navigate = useNavigate();
  const query = useActionQuery("get-program", { id: programId });
  const profile = useActionQuery("get-profile", {});
  const setStatus = useActionMutation("update-program-status");
  const remove = useActionMutation("delete-program");

  if (query.isLoading) return <DetailSkeleton />;

  if (query.error || !query.data) {
    const notFound = /not found/i.test(actionErrorMessage(query.error) ?? "");
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <BackLink />
        <div role="alert" className="mt-6 rounded-lg border bg-card p-6">
          <h1 className="dossier-serif text-2xl font-medium">
            {notFound ? "This program isn't in your Dossier" : "We couldn't load this program"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {notFound
              ? "It may have been deleted, or the link is wrong."
              : (actionErrorMessage(query.error) ?? "Check your connection and try again.")}
          </p>
          {!notFound && (
            <Button className="mt-4" variant="outline" onClick={() => query.refetch()}>
              Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  const { program, requirements, questions } = query.data;
  const dl = deadlineView(program.deadlineAt, program.deadlineTz, profile.data?.profile?.timezone);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
      <BackLink />

      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {typeLabel(program.type)}
            {program.provider ? ` · ${program.provider}` : " · Provider not stated"}
          </p>
          <h1 className="dossier-serif mt-1 text-3xl font-medium leading-tight sm:text-4xl">
            {program.title}
          </h1>
        </div>
        <label className="flex shrink-0 flex-col gap-1 text-xs font-medium text-muted-foreground">
          Stage
          <select
            value={program.status}
            disabled={setStatus.isPending}
            onChange={(e) =>
              setStatus.mutate(
                { id: program.id, status: e.target.value as (typeof STAGES)[number]["id"] },
                {
                  onSuccess: () => {
                    toast.success("Stage updated");
                    void query.refetch();
                  },
                  onError: (err) => toast.error(actionErrorMessage(err) ?? "Couldn't change the stage."),
                },
              )
            }
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <ProgramChangesBanner programId={program.id} programTitle={program.title} />

      <section aria-label="Deadline" className="mt-6 rounded-lg border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold">Deadline</h2>
          <span className={cn("rounded px-2 py-0.5 text-xs font-medium", TONE_CLASSES[dl.tone])}>{dl.badge}</span>
        </div>
        {dl.yours ? (
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Your time</dt>
              <dd className="font-medium">{dl.yours}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Program's time</dt>
              <dd className="font-medium">{dl.theirs ?? (program.deadlineTz ? "Same as yours" : "Timezone not stated")}</dd>
            </div>
          </dl>
        ) : null}
        {program.deadlineText ? (
          <p className="mt-2 text-sm text-muted-foreground">As written: "{program.deadlineText}"</p>
        ) : null}
      </section>

      {program.summary ? <p className="mt-6 text-lg leading-relaxed">{program.summary}</p> : null}
      {program.sourceUrl ? (
        <p className="mt-3 flex flex-wrap items-center">
        <a
          href={program.sourceUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
        >
          Official page <IconExternalLink className="size-3.5" />
        </a>
        <CheckForChanges programId={program.id} lastCheckedAt={program.lastCheckedAt ?? null} />
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Added from pasted text — no official link saved.</p>
      )}

      <nav aria-label="Program tools" className="mt-6 flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link to={`/programs/${program.id}/map`}>Story map</Link>
        </Button>
        <Button asChild>
          <Link to={`/programs/${program.id}/ready`}>Readiness &amp; export</Link>
        </Button>
      </nav>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <EligibilitySection
          programId={program.id}
          programTitle={program.title}
          rules={program.eligibility}
          result={program.eligibilityResult}
          checkedAt={program.eligibilityCheckedAt}
        />
        <ChecklistSection programId={program.id} items={requirements} onChanged={() => void query.refetch()} />
      </div>

      <div className="mt-10">
        <Section title="Questions" empty="No application questions stated.">
          {questions.length ? (
            <ol className="space-y-3">
              {questions.map((q, i) => {
                const a = q.answer;
                const over = a && q.wordLimit ? a.wordCount > q.wordLimit : false;
                return (
                  <li key={q.id}>
                    <Link
                      to={`/programs/${program.id}/questions/${q.id}`}
                      className="block rounded-lg border bg-card p-4 transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <p className="text-xs font-medium text-muted-foreground">Question {i + 1}</p>
                      <p className="mt-1">{q.text}</p>
                      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {a ? (
                          <span className={cn("font-medium", over ? "text-red-700" : "text-foreground")}>
                            {a.wordCount}
                            {q.wordLimit ? ` / ${q.wordLimit}` : ""} words
                          </span>
                        ) : (
                          <span>{q.wordLimit ? `${q.wordLimit} words max` : "Word limit not stated"}</span>
                        )}
                        {q.charLimit ? <span>{q.charLimit} characters max</span> : null}
                        {a?.voiceScore != null ? <span>Sounds like you {a.voiceScore}/100</span> : null}
                        {a?.panelVerdict ? <span>Committee: {a.panelVerdict}</span> : null}
                        <span className="ml-auto font-medium text-primary">{a ? "Edit answer →" : "Write answer →"}</span>
                      </p>
                      {q.notes ? <p className="mt-1 text-sm text-muted-foreground">{q.notes}</p> : null}
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : null}
        </Section>
      </div>

      <div className="mt-10">
        <Section title="What the committee looks for" empty="Selection criteria not stated.">
          {program.criteria.length ? (
            <ul className="space-y-2">
              {program.criteria.map((c, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium">{c.criterion}</span>
                  {c.detail ? <span className="text-muted-foreground"> — {c.detail}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </Section>
      </div>

      <div className="mt-10">
        <CommitteePanel programId={program.id} programTitle={program.title} />
      </div>

      <footer className="mt-12 border-t pt-6">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-muted-foreground hover:text-destructive">
              <IconTrash className="size-4" /> Delete program
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{program.title}"?</AlertDialogTitle>
              <AlertDialogDescription>
                Its checklist and questions are deleted too. This can't be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  remove.mutate(
                    { id: program.id },
                    {
                      onSuccess: () => {
                        toast.success("Program deleted");
                        navigate("/programs");
                      },
                      onError: (err) => toast.error(actionErrorMessage(err) ?? "Couldn't delete it."),
                    },
                  )
                }
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </footer>
    </div>
  );
}

function Section({
  title,
  aside,
  empty,
  children,
}: {
  title: string;
  aside?: string | undefined;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between border-b pb-2">
        <h2 className="dossier-serif text-xl font-medium">{title}</h2>
        {aside ? <span className="text-sm text-muted-foreground">{aside}</span> : null}
      </div>
      {children ?? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconAlertTriangle className="size-4" /> {empty}
        </p>
      )}
    </section>
  );
}

function BackLink() {
  return (
    <Link
      to="/programs"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <IconArrowLeft className="size-4" /> All programs
    </Link>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-10 sm:px-6" aria-busy="true" aria-label="Loading program">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

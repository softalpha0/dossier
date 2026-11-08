import {
  actionErrorMessage,
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import { IconAlertTriangle, IconChecklist, IconDots, IconFileText } from "@tabler/icons-react";
import { Link } from "react-router";
import { toast } from "sonner";

import { AddProgramDialog } from "@/components/dossier/AddProgramDialog";
import { isSample, SampleDataNotice, TrySampleDataButton } from "@/components/dossier/SampleData";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { deadlineView, STAGES, TONE_CLASSES, typeLabel } from "@/lib/dossier";
import { cn } from "@/lib/utils";

export function meta() {
  return [{ title: "Programs · Dossier" }];
}

type ProgramRow = {
  id: string;
  title: string;
  type: string;
  provider: string | null;
  status: string;
  deadlineAt: string | null;
  deadlineTz: string | null;
  checklistTotal: number;
  checklistDone: number;
  questionCount: number;
};

export default function ProgramsBoard() {
  const programs = useActionQuery("list-programs", {});
  const profile = useActionQuery("get-profile", {});
  const userTz = profile.data?.profile?.timezone ?? null;
  const rows = (programs.data?.programs ?? []) as ProgramRow[];
  const hasSamples = rows.some((r) => isSample(r.title));

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="dossier-serif text-3xl font-medium sm:text-4xl">Your applications</h1>
          <p className="mt-1 max-w-xl text-muted-foreground">
            Every program you're applying to, from first look to result.
          </p>
        </div>
        <AddProgramDialog size="lg" />
      </header>

      {hasSamples ? <SampleDataNotice /> : null}

      {programs.isLoading ? (
        <BoardSkeleton />
      ) : programs.error ? (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <IconAlertTriangle className="mt-0.5 size-5 text-destructive" />
          <div>
            <p className="font-medium">We couldn't load your programs.</p>
            <p className="text-sm text-muted-foreground">
              {actionErrorMessage(programs.error) ?? "Check your connection and try again."}
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => programs.refetch()}>
              Try again
            </Button>
          </div>
        </div>
      ) : rows.length === 0 ? (
        <EmptyBoard />
      ) : (
        <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-6 xl:gap-4">
          {STAGES.map((stage) => {
            const items = rows.filter((r) => r.status === stage.id);
            return (
              <section key={stage.id} aria-labelledby={`stage-${stage.id}`} className="min-w-0">
                <h2
                  id={`stage-${stage.id}`}
                  className="mb-3 flex items-center justify-between border-b pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {stage.label}
                  <span className="font-normal">{items.length}</span>
                </h2>
                {items.length === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground/70">Nothing here</p>
                ) : (
                  <ul className="space-y-3">
                    {items.map((p) => (
                      <li key={p.id}>
                        <ProgramCard program={p} userTz={userTz} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      {!programs.isLoading && !programs.error && rows.length > 0 && !hasSamples ? (
        <div className="mt-12 flex flex-col items-start gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Want to see a finished example? Load three fictional programs next to yours — remove them any time.</p>
          <TrySampleDataButton size="sm" />
        </div>
      ) : null}
    </div>
  );
}

function ProgramCard({ program, userTz }: { program: ProgramRow; userTz: string | null }) {
  const dl = deadlineView(program.deadlineAt, program.deadlineTz, userTz);
  const move = useActionMutation("update-program-status");
  return (
    <div className="relative rounded-lg border bg-card transition-colors hover:border-primary/50 focus-within:border-primary/50">
      <Link
        to={`/programs/${program.id}`}
        className="block rounded-lg p-4 pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {typeLabel(program.type)}
          {program.provider ? ` · ${program.provider}` : ""}
        </p>
        <p className="mt-1 font-medium leading-snug">{program.title}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className={cn("rounded px-2 py-0.5 font-medium", TONE_CLASSES[dl.tone])}>{dl.badge}</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <IconChecklist className="size-3.5" />
            {program.checklistDone}/{program.checklistTotal}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <IconFileText className="size-3.5" />
            {program.questionCount} {program.questionCount === 1 ? "question" : "questions"}
          </span>
        </div>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Move ${program.title} to another stage`}
          className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconDots className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Move to</DropdownMenuLabel>
          {STAGES.filter((st) => st.id !== program.status).map((st) => (
            <DropdownMenuItem
              key={st.id}
              onSelect={() =>
                move.mutate(
                  { id: program.id, status: st.id },
                  {
                    onSuccess: () => toast.success(`Moved to ${st.label}`),
                    onError: (err) => toast.error(actionErrorMessage(err) ?? "Couldn't move it."),
                  },
                )
              }
            >
              {st.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function EmptyBoard() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-dashed bg-card px-6 py-12 text-center">
      <h2 className="dossier-serif text-2xl font-medium">Start with one program</h2>
      <p className="mt-2 text-muted-foreground">
        Paste the link to a scholarship, fellowship, grant or accelerator call. Dossier
        reads the rules and questions so nothing slips through.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <AddProgramDialog size="lg" />
        <TrySampleDataButton />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Sample data is fictional: three programs, five stories and a first draft that needs work. Remove it any time.
      </p>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-6 xl:gap-4" aria-busy="true" aria-label="Loading programs">
      {STAGES.map((s) => (
        <div key={s.id} className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-28 w-full" />
        </div>
      ))}
    </div>
  );
}

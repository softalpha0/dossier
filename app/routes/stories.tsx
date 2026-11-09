import {
  actionErrorMessage,
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import { IconAlertTriangle, IconMessageCircle, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { sendAgentTask } from "@/lib/agent-task";

export function meta() {
  return [{ title: "Story bank · Dossier" }];
}

type Story = {
  id: string;
  title: string;
  situation: string | null;
  action: string | null;
  result: string | null;
  themes: string[];
};

type Draft = { title: string; situation: string; action: string; result: string; themes: string };
const EMPTY: Draft = { title: "", situation: "", action: "", result: "", themes: "" };

function toDraft(s: Story): Draft {
  return {
    title: s.title,
    situation: s.situation ?? "",
    action: s.action ?? "",
    result: s.result ?? "",
    themes: s.themes.join(", "),
  };
}

export default function StoriesPage() {
  const query = useActionQuery("list-stories", {});
  const create = useActionMutation("add-story");
  const update = useActionMutation("update-story");
  const remove = useActionMutation("delete-story");
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);
  const stories = (query.data?.stories ?? []) as Story[];
  const allThemes = Array.from(new Set(stories.flatMap((s) => s.themes))).sort();
  const [theme, setTheme] = useState<string | null>(null);
  const visible = theme ? stories.filter((s) => s.themes.includes(theme)) : stories;

  const withCoach = () =>
    void sendAgentTask({
      message:
        "Help me add a story to my story bank. Ask me one question at a time about the situation, what I did, and the result, then save it in my own words.",
      context: JSON.stringify({ task: "add-story" }),
    });

  function save() {
    if (!editing) return;
    const d = editing.draft;
    if (d.title.trim().length < 2) {
      toast.error("Give the story a short name.");
      return;
    }
    if (!d.situation.trim() && !d.action.trim() && !d.result.trim()) {
      toast.error("Add at least the situation, what you did, or the result.");
      return;
    }
    const clean = (v: string) => (v.trim() ? v.trim() : null);
    const payload = {
      title: d.title.trim(),
      situation: clean(d.situation),
      action: clean(d.action),
      result: clean(d.result),
      themes: d.themes
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 8),
    };
    const done = {
      onSuccess: () => {
        toast.success(editing.id ? "Story updated" : "Story saved");
        setEditing(null);
      },
      onError: (err: unknown) => toast.error(actionErrorMessage(err) ?? "Couldn't save the story."),
    };
    if (editing.id) update.mutate({ id: editing.id, ...payload }, done);
    else create.mutate(payload, done);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="dossier-serif text-3xl font-medium sm:text-4xl">Story bank</h1>
          <p className="mt-1 max-w-xl text-muted-foreground">
            Your real experiences, written once and reused across applications. Dossier drafts only
            from these — never from invented ones.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={withCoach}>
            <IconMessageCircle className="size-4" /> Write one with the coach
          </Button>
          <Button size="lg" onClick={() => setEditing({ id: null, draft: EMPTY })}>
            <IconPlus className="size-4" /> Add story
          </Button>
        </div>
      </header>

      {allThemes.length > 1 ? (
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by theme">
          <ThemeChip active={theme === null} onClick={() => setTheme(null)}>
            All
          </ThemeChip>
          {allThemes.map((t) => (
            <ThemeChip key={t} active={theme === t} onClick={() => setTheme(theme === t ? null : t)}>
              {t}
            </ThemeChip>
          ))}
        </div>
      ) : null}

      <div className="mt-8">
        {query.isLoading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading stories">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : query.error ? (
          <div role="alert" className="flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
            <IconAlertTriangle className="size-5 text-destructive" />
            <div>
              <p className="font-medium">We couldn't load your stories.</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => query.refetch()}>
                Try again
              </Button>
            </div>
          </div>
        ) : stories.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card px-6 py-12 text-center">
            <h2 className="dossier-serif text-2xl font-medium">Your first story</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Think of a time you led something, fixed a problem, or changed your mind. Three or four
              good stories cover most application questions.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={withCoach}>
                Write one with the coach
              </Button>
              <Button onClick={() => setEditing({ id: null, draft: EMPTY })}>Add story</Button>
            </div>
          </div>
        ) : (
          <ul className="divide-y rounded-lg border bg-card">
            {visible.map((s) => (
              <li key={s.id} className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-medium">{s.title}</h2>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Edit ${s.title}`}
                      onClick={() => setEditing({ id: s.id, draft: toDraft(s) })}
                    >
                      <IconPencil className="size-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" aria-label={`Delete ${s.title}`}>
                          <IconTrash className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete "{s.title}"?</AlertDialogTitle>
                          <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep it</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              remove.mutate(
                                { id: s.id },
                                {
                                  onSuccess: () => toast.success("Story deleted"),
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
                  </div>
                </div>
                <dl className="mt-2 grid gap-3 text-sm sm:grid-cols-3">
                  <StoryPart label="Situation" value={s.situation} />
                  <StoryPart label="What I did" value={s.action} />
                  <StoryPart label="Result" value={s.result} />
                </dl>
                {s.themes.length ? (
                  <p className="mt-3 flex flex-wrap gap-1.5">
                    {s.themes.map((t) => (
                      <span key={t} className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="dossier-serif text-2xl font-medium">
              {editing?.id ? "Edit story" : "Add a story"}
            </DialogTitle>
            <DialogDescription>Write it plainly, in your own words. Numbers only if they're true.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <div className="space-y-4">
              <StoryField id="st-title" label="Short name" placeholder="e.g. Clinic test drive">
                {(props) => (
                  <Input
                    {...props}
                    value={editing.draft.title}
                    onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, title: e.target.value } })}
                  />
                )}
              </StoryField>
              {(["situation", "action", "result"] as const).map((k) => (
                <StoryField
                  key={k}
                  id={`st-${k}`}
                  label={k === "situation" ? "Situation" : k === "action" ? "What you did" : "Result"}
                  placeholder={
                    k === "situation"
                      ? "What was going on, and why did it matter?"
                      : k === "action"
                        ? "What did you personally do?"
                        : "What changed? What did you learn?"
                  }
                >
                  {(props) => (
                    <Textarea
                      {...props}
                      rows={3}
                      value={editing.draft[k]}
                      onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, [k]: e.target.value } })}
                    />
                  )}
                </StoryField>
              ))}
              <StoryField id="st-themes" label="Themes" placeholder="leadership, resilience, community">
                {(props) => (
                  <Input
                    {...props}
                    value={editing.draft.themes}
                    onChange={(e) => setEditing({ ...editing, draft: { ...editing.draft, themes: e.target.value } })}
                  />
                )}
              </StoryField>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? "Saving…" : "Save story"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StoryPart({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 line-clamp-4">{value ?? <span className="text-muted-foreground">—</span>}</dd>
    </div>
  );
}

function StoryField({
  id,
  label,
  placeholder,
  children,
}: {
  id: string;
  label: string;
  placeholder: string;
  children: (props: { id: string; placeholder: string }) => React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children({ id, placeholder })}
    </div>
  );
}

function ThemeChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        active
          ? "min-h-9 rounded-full border border-primary bg-primary/10 px-3 text-sm font-medium text-primary"
          : "min-h-9 rounded-full border px-3 text-sm text-muted-foreground hover:border-foreground/30"
      }
    >
      {children}
    </button>
  );
}

import { actionErrorMessage, useActionMutation, useActionQuery } from "@agent-native/core/client/hooks";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

const words = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

export function WritingSamples() {
  const query = useActionQuery("list-writing-samples", {});
  const add = useActionMutation("add-writing-sample");
  const remove = useActionMutation("delete-writing-sample");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const count = words(content);

  function save() {
    if (!title.trim()) return toast.error("Give the sample a name.");
    if (count < 80) return toast.error("Add at least 80 words so Dossier can learn your style.");
    add.mutate(
      { title: title.trim(), content },
      {
        onSuccess: () => {
          toast.success("Writing sample saved");
          setOpen(false);
          setTitle("");
          setContent("");
        },
        onError: (err) => toast.error(actionErrorMessage(err) ?? "Couldn't save the sample."),
      },
    );
  }

  const samples = query.data?.samples ?? [];

  return (
    <section aria-labelledby="samples-title" className="mt-12 border-t pt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="samples-title" className="dossier-serif text-2xl font-medium">
            Writing samples
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste things you wrote yourself — an old essay, a statement, a long post. Dossier learns
            how you sound, so it can tell when a draft stops sounding like you.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <IconPlus className="size-4" /> Add sample
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="dossier-serif text-2xl font-medium">Add a writing sample</DialogTitle>
              <DialogDescription>Only your own writing, unedited. 80 words or more.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="ws-title">Name</Label>
                <Input id="ws-title" placeholder="e.g. Undergrad personal statement" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ws-content">Text</Label>
                <Textarea id="ws-content" rows={10} value={content} onChange={(e) => setContent(e.target.value)} maxLength={30000} />
                <p className={count && count < 80 ? "text-xs text-amber-700" : "text-xs text-muted-foreground"}>
                  {count} words{count && count < 80 ? " — add a bit more" : ""}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={add.isPending}>
                {add.isPending ? "Saving…" : "Save sample"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-5">
        {query.isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : query.error ? (
          <p role="alert" className="text-sm text-muted-foreground">
            We couldn't load your samples.{" "}
            <button className="underline" onClick={() => query.refetch()}>
              Try again
            </button>
          </p>
        ) : samples.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-card p-4 text-sm text-muted-foreground">
            No samples yet. One or two pieces of 300+ words work best.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border bg-card">
            {samples.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.wordCount} words</p>
                  {"preview" in s && s.preview ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.preview}</p>
                  ) : null}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete ${s.title}`}
                  onClick={() =>
                    remove.mutate(
                      { id: s.id },
                      {
                        onSuccess: () => toast.success("Sample deleted"),
                        onError: (err) => toast.error(actionErrorMessage(err) ?? "Couldn't delete it."),
                      },
                    )
                  }
                >
                  <IconTrash className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

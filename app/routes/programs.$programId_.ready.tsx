import { actionErrorMessage, useActionQuery } from "@agent-native/core/client/hooks";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCircleCheck,
  IconCircleX,
  IconDownload,
  IconPrinter,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function meta() {
  return [{ title: "Readiness · Dossier" }];
}

export default function Readiness() {
  const { programId = "" } = useParams();
  const query = useActionQuery("readiness-check", { programId });
  const packet = useActionQuery("export-packet", { programId });
  const [printing, setPrinting] = useState(false);

  function download() {
    if (!packet.data) return toast.error("The packet isn't ready yet — try again in a moment.");
    const blob = new Blob([packet.data.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = packet.data.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  function print() {
    if (!packet.data) return toast.error("The packet isn't ready yet — try again in a moment.");
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 50);
  }

  const back = (
    <Link to={`/programs/${programId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground print:hidden">
      <IconArrowLeft className="size-4" /> {query.data?.program.title ?? "Back to program"}
    </Link>
  );

  if (query.isLoading)
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6" aria-busy="true" aria-label="Checking readiness">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  if (query.error || !query.data)
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {back}
        <p role="alert" className="mt-6 text-muted-foreground">
          {actionErrorMessage(query.error) ?? "We couldn't run the readiness check."}{" "}
          <button className="underline" onClick={() => query.refetch()}>
            Try again
          </button>
        </p>
      </div>
    );

  const { ready, polished, checks } = query.data;
  const failing = checks.filter((c) => !c.ok);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-10">
      <div className={cn(printing && "hidden")}>
        {back}
        <h1 className="dossier-serif mt-3 text-3xl font-medium sm:text-4xl">Ready to submit?</h1>
        <div
          className={cn(
            "mt-6 flex items-start gap-3 rounded-lg border px-4 py-4",
            polished
              ? "border-primary/40 bg-primary/5"
              : ready
                ? "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
                : "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
          )}
        >
          {ready ? <IconCircleCheck className="mt-0.5 size-6 text-primary" /> : <IconAlertTriangle className="mt-0.5 size-6 text-red-600" />}
          <div>
            <p className="font-medium">
              {polished
                ? "Everything checks out."
                : ready
                  ? "Ready to submit — a few things could still be stronger."
                  : `Not ready yet — ${failing.filter((c) => c.blocking).length} must-fix item${failing.filter((c) => c.blocking).length === 1 ? "" : "s"}.`}
            </p>
            <p className="text-sm text-muted-foreground">Dossier never submits for you. Use the official application page.</p>
          </div>
        </div>

        <ul className="mt-6 divide-y rounded-lg border bg-card">
          {checks.map((c) => (
            <li key={c.id} className="flex items-start gap-3 p-4">
              {c.ok ? (
                <IconCircleCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-label="Done" />
              ) : (
                <IconCircleX className={cn("mt-0.5 size-5 shrink-0", c.blocking ? "text-red-600" : "text-amber-600")} aria-label="To do" />
              )}
              <div className="min-w-0 flex-1">
                <p className={cn(c.ok && "text-muted-foreground")}>
                  {c.label}
                  {!c.ok && c.blocking ? <span className="ml-2 text-xs font-medium text-red-700">must fix</span> : null}
                </p>
                {c.fix ? <p className="text-sm text-muted-foreground">{c.fix}</p> : null}
              </div>
              {!c.ok && c.path ? (
                c.path.startsWith("http") ? (
                  <a href={c.path} target="_blank" rel="noreferrer noopener" className="shrink-0 text-sm text-primary underline-offset-4 hover:underline">
                    Open
                  </a>
                ) : (
                  <Link to={c.path} className="shrink-0 text-sm text-primary underline-offset-4 hover:underline">
                    Fix
                  </Link>
                )
              ) : null}
            </li>
          ))}
        </ul>

        <section className="mt-10 border-t pt-6">
          <h2 className="dossier-serif text-2xl font-medium">Your application packet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Program details, checklist and every answer in one file — to keep, share with a mentor, or copy into the official form.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="lg" onClick={download} disabled={!packet.data}>
              <IconDownload className="size-4" /> Download packet (.md)
            </Button>
            <Button size="lg" variant="outline" onClick={print} disabled={!packet.data}>
              <IconPrinter className="size-4" /> Print / Save as PDF
            </Button>
          </div>
        </section>
      </div>

      {packet.data ? (
        <article className={cn("dossier-print hidden", printing && "block", "print:block")}>
          <PacketView markdown={packet.data.markdown} />
        </article>
      ) : null}
    </div>
  );
}

/** Small renderer for the packet's own Markdown (headings, checklist, paragraphs). */
function PacketView({ markdown }: { markdown: string }) {
  const blocks = markdown.split(/\n{2,}/);
  return (
    <div className="dossier-serif space-y-3 text-[12pt] leading-relaxed text-black">
      {blocks.map((b, i) => {
        if (b.startsWith("# ")) return <h1 key={i} className="text-2xl font-semibold">{b.slice(2)}</h1>;
        if (b.startsWith("## ")) return <h2 key={i} className="mt-6 text-xl font-semibold">{b.slice(3)}</h2>;
        if (b.startsWith("### ")) return <h3 key={i} className="mt-4 font-semibold">{b.slice(4)}</h3>;
        if (b.startsWith("---")) return <hr key={i} />;
        if (b.startsWith("- ["))
          return (
            <ul key={i} className="space-y-1">
              {b.split("\n").map((l, j) => (
                <li key={j}>{l.replace(/^- \[x\] /, "☑ ").replace(/^- \[ \] /, "☐ ")}</li>
              ))}
            </ul>
          );
        return (
          <p key={i} className="whitespace-pre-wrap">
            {b.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^_(.+)_$/s, "$1").replace(/ {2}\n/g, "\n")}
          </p>
        );
      })}
    </div>
  );
}

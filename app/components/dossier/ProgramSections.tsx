import { sendToAgentChat } from "@agent-native/core/client/agent-chat";
import { actionErrorMessage, useActionMutation } from "@agent-native/core/client/hooks";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconHelpCircle,
  IconPlus,
  IconShieldCheck,
  IconX,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type EligibilityItem = { rule: string; status: "ok" | "blocker" | "unknown"; reason: string };
type EligibilityResult = {
  overall: "eligible" | "blockers" | "needs_info" | "no_rules";
  items: EligibilityItem[];
  missing: string[];
};

const OVERALL: Record<EligibilityResult["overall"], { label: string; tone: string }> = {
  eligible: { label: "You look eligible", tone: "border-primary/40 bg-primary/5 text-primary" },
  blockers: {
    label: "Possible blockers",
    tone: "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
  },
  needs_info: {
    label: "A few things to confirm",
    tone: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  },
  no_rules: { label: "No eligibility rules stated", tone: "border-border bg-secondary text-foreground" },
};

export function EligibilitySection({
  programId,
  programTitle,
  rules,
  result,
  checkedAt,
}: {
  programId: string;
  programTitle: string;
  rules: { rule: string; category: string }[];
  result: EligibilityResult | null;
  checkedAt: string | null;
}) {
  const check = () =>
    sendToAgentChat({
      message: `Check my eligibility for "${programTitle}" against my profile.`,
      context: JSON.stringify({ task: "check-eligibility", programId }),
      submit: true,
      openSidebar: true,
    });

  return (
    <section aria-labelledby="eligibility-title">
      <div className="mb-3 flex items-baseline justify-between border-b pb-2">
        <h2 id="eligibility-title" className="dossier-serif text-xl font-medium">
          Eligibility
        </h2>
        {checkedAt ? (
          <span className="text-xs text-muted-foreground">
            Checked {new Date(checkedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
          </span>
        ) : null}
      </div>

      {result ? (
        <div className={cn("mb-4 rounded-lg border px-4 py-3", OVERALL[result.overall].tone)}>
          <p className="flex items-center gap-2 font-medium">
            {result.overall === "eligible" ? (
              <IconShieldCheck className="size-5" />
            ) : result.overall === "blockers" ? (
              <IconAlertTriangle className="size-5" />
            ) : (
              <IconHelpCircle className="size-5" />
            )}
            {OVERALL[result.overall].label}
          </p>
          {result.missing.length ? (
            <ul className="mt-2 list-disc pl-6 text-sm">
              {result.missing.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {result?.items.length ? (
        <ul className="space-y-3">
          {result.items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              {item.status === "ok" ? (
                <IconCircleCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-label="Meets" />
              ) : item.status === "blocker" ? (
                <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-label="Blocker" />
              ) : (
                <IconHelpCircle className="mt-0.5 size-4 shrink-0 text-amber-600" aria-label="Unknown" />
              )}
              <span>
                {item.rule}
                <span className="block text-muted-foreground">{item.reason}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : rules.length ? (
        <ul className="space-y-2">
          {rules.map((e, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="mt-0.5 shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                {e.category}
              </span>
              <span>{e.rule}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconAlertTriangle className="size-4" /> No eligibility rules stated.
        </p>
      )}

      {rules.length ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant={result ? "outline" : "default"} onClick={check}>
            {result ? "Check again" : "Check my eligibility"}
          </Button>
          <Link to="/profile" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Uses your profile
          </Link>
        </div>
      ) : null}
    </section>
  );
}

type Requirement = {
  id: string;
  kind: string;
  label: string;
  details: string | null;
  done: boolean;
};

const KIND_LABELS: Record<string, string> = {
  document: "Document",
  reference: "Reference",
  form: "Form",
  test: "Test",
  fee: "Fee",
  interview: "Interview",
  other: "Other",
};

export function ChecklistSection({
  programId,
  items,
  onChanged,
}: {
  programId: string;
  items: Requirement[];
  onChanged: () => void;
}) {
  const toggle = useActionMutation("update-checklist-item");
  const add = useActionMutation("add-checklist-item");
  const remove = useActionMutation("delete-checklist-item");
  const [draft, setDraft] = useState("");
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
  const done = items.filter((r) => optimistic[r.id] ?? r.done).length;

  const onToggle = (r: Requirement) => {
    const next = !(optimistic[r.id] ?? r.done);
    setOptimistic((o) => ({ ...o, [r.id]: next }));
    toggle.mutate(
      { id: r.id, done: next },
      {
        onSuccess: onChanged,
        onError: (err) => {
          setOptimistic((o) => ({ ...o, [r.id]: !next }));
          toast.error(actionErrorMessage(err) ?? "Couldn't update the checklist.");
        },
      },
    );
  };

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const label = draft.trim();
    if (!label) return;
    add.mutate(
      { programId, label, kind: "other" },
      {
        onSuccess: () => {
          setDraft("");
          onChanged();
        },
        onError: (err) => toast.error(actionErrorMessage(err) ?? "Couldn't add the item."),
      },
    );
  };

  return (
    <section aria-labelledby="checklist-title">
      <div className="mb-3 flex items-baseline justify-between border-b pb-2">
        <h2 id="checklist-title" className="dossier-serif text-xl font-medium">
          Checklist
        </h2>
        {items.length ? (
          <span className="text-sm text-muted-foreground">
            {done} of {items.length} done
          </span>
        ) : null}
      </div>
      {items.length ? (
        <ul className="space-y-1">
          {items.map((r) => {
            const isDone = optimistic[r.id] ?? r.done;
            return (
              <li key={r.id} className="group flex items-start gap-1">
                <label className="flex min-h-10 flex-1 cursor-pointer items-start gap-3 rounded-md px-1 py-2 hover:bg-secondary/60">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => onToggle(r)}
                    className="mt-0.5 size-4 shrink-0 accent-[hsl(var(--primary))]"
                  />
                  <span className="text-sm">
                    <span className={cn(isDone && "text-muted-foreground line-through")}>{r.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{KIND_LABELS[r.kind] ?? r.kind}</span>
                    {r.details ? <span className="block text-muted-foreground">{r.details}</span> : null}
                  </span>
                </label>
                <button
                  type="button"
                  aria-label={`Remove "${r.label}"`}
                  onClick={() =>
                    remove.mutate({ id: r.id }, { onSuccess: onChanged, onError: (err) => toast.error(actionErrorMessage(err) ?? "Couldn't remove it.") })
                  }
                  className="mt-1.5 rounded p-1 text-muted-foreground opacity-60 hover:bg-secondary hover:text-foreground focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <IconX className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconAlertTriangle className="size-4" /> No documents or references stated.
        </p>
      )}
      <form onSubmit={onAdd} className="mt-3 flex gap-2">
        <Input
          aria-label="Add your own checklist item"
          placeholder="Add your own item…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" variant="outline" disabled={!draft.trim() || add.isPending} aria-label="Add item">
          <IconPlus className="size-4" />
        </Button>
      </form>
    </section>
  );
}

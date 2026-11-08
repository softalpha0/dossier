import {
  actionErrorMessage,
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { WritingSamples } from "@/components/dossier/WritingSamples";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { browserTimezone, PROGRAM_TYPES, typeLabel } from "@/lib/dossier";

export function meta() {
  return [{ title: "Profile · Dossier" }];
}

type Form = {
  firstName: string;
  country: string;
  citizenship: string;
  educationLevel: string;
  field: string;
  workYears: string;
  goals: string;
  timezone: string;
  programTypes: string[];
};

const EMPTY: Form = {
  firstName: "",
  country: "",
  citizenship: "",
  educationLevel: "",
  field: "",
  workYears: "",
  goals: "",
  timezone: "",
  programTypes: [],
};

function timezones(): string[] {
  try {
    return (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone") ?? [];
  } catch {
    return [];
  }
}

export default function ProfilePage() {
  const query = useActionQuery("get-profile", {});
  const save = useActionMutation("update-profile");
  const [form, setForm] = useState<Form>(EMPTY);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!query.data || dirty) return;
    const p = query.data.profile;
    setForm({
      firstName: p?.firstName ?? "",
      country: p?.country ?? "",
      citizenship: p?.citizenship ?? "",
      educationLevel: p?.educationLevel ?? "",
      field: p?.field ?? "",
      workYears: p?.workYears != null ? String(p.workYears) : "",
      goals: p?.goals ?? "",
      timezone: p?.timezone ?? browserTimezone(),
      programTypes: p?.programTypes ?? [],
    });
  }, [query.data, dirty]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setDirty(true);
    setForm((f) => ({ ...f, [key]: value }));
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const years = form.workYears.trim();
    if (years && !/^\d{1,2}$/.test(years)) {
      toast.error("Work years should be a whole number, like 3.");
      return;
    }
    const clean = (v: string) => (v.trim() ? v.trim() : null);
    save.mutate(
      {
        firstName: clean(form.firstName),
        country: clean(form.country),
        citizenship: clean(form.citizenship),
        educationLevel: clean(form.educationLevel),
        field: clean(form.field),
        workYears: years ? Number(years) : null,
        goals: clean(form.goals),
        timezone: clean(form.timezone),
        programTypes: form.programTypes as (typeof PROGRAM_TYPES)[number][],
      },
      {
        onSuccess: () => {
          toast.success("Profile saved");
          setDirty(false);
          void query.refetch();
        },
        onError: (err) => toast.error(actionErrorMessage(err) ?? "Couldn't save your profile."),
      },
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:py-10">
      <h1 className="dossier-serif text-3xl font-medium sm:text-4xl">Your profile</h1>
      <p className="mt-1 text-muted-foreground">
        Dossier uses this to check eligibility and show deadlines in your time. Only add what
        you're comfortable with — we never ask for passport, address or ID numbers.
      </p>

      {query.isLoading ? (
        <div className="mt-8 space-y-4" aria-busy="true" aria-label="Loading profile">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : query.error ? (
        <div role="alert" className="mt-8 flex gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <IconAlertTriangle className="size-5 text-destructive" />
          <div>
            <p className="font-medium">We couldn't load your profile.</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => query.refetch()}>
              Try again
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="firstName" label="First name" value={form.firstName} onChange={(v) => set("firstName", v)} autoComplete="given-name" />
            <Field id="country" label="Country you live in" value={form.country} onChange={(v) => set("country", v)} autoComplete="country-name" />
            <Field id="citizenship" label="Citizenship" hint="Separate several with commas" value={form.citizenship} onChange={(v) => set("citizenship", v)} />
            <Field id="educationLevel" label="Highest education" hint='e.g. "BSc Economics", "Master’s (in progress)"' value={form.educationLevel} onChange={(v) => set("educationLevel", v)} />
            <Field id="field" label="Field of study or work" value={form.field} onChange={(v) => set("field", v)} />
            <Field id="workYears" label="Years of full-time work" value={form.workYears} onChange={(v) => set("workYears", v)} inputMode="numeric" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Your timezone</Label>
            <Input id="timezone" list="tz-list" value={form.timezone} onChange={(e) => set("timezone", e.target.value)} />
            <datalist id="tz-list">
              {timezones().map((tz) => (
                <option key={tz} value={tz} />
              ))}
            </datalist>
            <p className="text-sm text-muted-foreground">Deadlines are shown in this time.</p>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">What are you applying to?</legend>
            <div className="flex flex-wrap gap-2">
              {PROGRAM_TYPES.filter((t) => t !== "other").map((t) => {
                const on = form.programTypes.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      set("programTypes", on ? form.programTypes.filter((x) => x !== t) : [...form.programTypes, t])
                    }
                    className={
                      on
                        ? "min-h-10 rounded-full border border-primary bg-primary/10 px-4 text-sm font-medium text-primary"
                        : "min-h-10 rounded-full border px-4 text-sm text-muted-foreground hover:border-foreground/30"
                    }
                  >
                    {typeLabel(t)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="goals">Your goals</Label>
            <Textarea id="goals" rows={4} value={form.goals} onChange={(e) => set("goals", e.target.value)} placeholder="In your own words: what you want to do next and why." />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" size="lg" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save profile"}
            </Button>
            {dirty && !save.isPending ? <span className="text-sm text-muted-foreground">Unsaved changes</span> : null}
          </div>
        </form>
      )}

      <WritingSamples />
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  ...rest
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "id" | "size">) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

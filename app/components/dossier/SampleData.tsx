import { actionErrorMessage, useActionMutation } from "@agent-native/core/client/hooks";
import { IconFlask, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export const SAMPLE_SUFFIX = "(sample)";
export const isSample = (title: string) => title.trim().endsWith(SAMPLE_SUFFIX);

/** "Try with sample data" — loads three fictional programs, five stories, a writing sample and one over-long draft. */
export function TrySampleDataButton({ size = "lg" }: { size?: "sm" | "lg" }) {
  const seed = useActionMutation("seed-demo");
  return (
    <Button
      variant="outline"
      size={size}
      disabled={seed.isPending}
      onClick={() =>
        seed.mutate(
          {},
          {
            onSuccess: (r) =>
              toast.success(
                r.alreadyLoaded
                  ? "Sample data is already loaded."
                  : "Sample data loaded. Open the Harbor Leaders Scholarship to see a draft that needs work.",
              ),
            onError: (e) => toast.error(actionErrorMessage(e) ?? "We couldn't load the sample data. Try again."),
          },
        )
      }
    >
      {seed.isPending ? <Spinner className="size-4" /> : <IconFlask className="size-4" />}
      {seed.isPending ? "Loading sample data…" : "Try with sample data"}
    </Button>
  );
}

/** Notice shown on the board while sample programs exist, with a two-step remove. */
export function SampleDataNotice() {
  const remove = useActionMutation("remove-demo");
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border bg-card px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">You're exploring sample data.</span> Everything marked “(sample)” is
        fictional. Your own programs and stories are never touched.
      </p>
      {confirming ? (
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={remove.isPending}>
            Keep it
          </Button>
          <Button
            variant="outline-destructive"
            size="sm"
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(
                {},
                {
                  onSuccess: () => {
                    setConfirming(false);
                    toast.success("Sample data removed.");
                  },
                  onError: (e) => toast.error(actionErrorMessage(e) ?? "We couldn't remove the sample data. Try again."),
                },
              )
            }
          >
            {remove.isPending ? <Spinner className="size-4" /> : <IconTrash className="size-4" />}
            {remove.isPending ? "Removing…" : "Yes, remove sample data"}
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="shrink-0" onClick={() => setConfirming(true)}>
          <IconTrash className="size-4" /> Remove sample data
        </Button>
      )}
    </div>
  );
}

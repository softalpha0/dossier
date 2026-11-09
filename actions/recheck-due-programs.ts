import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { requireUser } from "../server/lib/dossier.js";
import { dueProgramsFor, recheckProgram } from "../server/lib/watch.js";

export default defineAction({
  description:
    "Rules watcher: re-check the user's programs whose official page hasn't been checked for 3+ days (oldest first, a few at a time) and record any changes. Used by the scheduled rules-watcher automation and when the board opens.",
  schema: z.object({
    max: z.coerce.number().int().min(1).max(10).default(3).describe("How many programs to check in this call"),
  }),
  run: async ({ max }, ctx) => {
    const { ownerEmail } = requireUser(ctx, "check programs for changes");
    const due = await dueProgramsFor(ownerEmail, max);
    const results = [];
    for (const program of due) results.push(await recheckProgram(program, ownerEmail));
    return {
      checked: results.length,
      changed: results.filter((r) => r.status === "changed"),
      results,
    };
  },
});

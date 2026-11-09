import { defineAction } from "@agent-native/core/action";
import { resourceDelete, resourceGetByPath, resourcePut } from "@agent-native/core/resources";
import { z } from "zod";

import { requireUser } from "../server/lib/dossier.js";
import { describeWatcherJob, WATCHER_JOB_PATH, watcherJobContent } from "../server/lib/watcher-job.js";

export default defineAction({
  description:
    "Turn the rules watcher on or off, or read its state. When on, an Agent-Native automation (jobs/dossier-rules-watcher.md) re-checks the user's programs' official pages every 3 days and reports changes. Only change it when the user asks.",
  schema: z.object({
    enabled: z.coerce.boolean().optional().describe("true = turn on, false = turn off; omit to just read the state"),
  }),
  run: async ({ enabled }, ctx) => {
    const { ownerEmail, orgId } = requireUser(ctx, "manage the rules watcher");
    const existing = await resourceGetByPath(ownerEmail, WATCHER_JOB_PATH);
    if (enabled === true && !existing) {
      await resourcePut(ownerEmail, WATCHER_JOB_PATH, watcherJobContent(ownerEmail, orgId), "text/markdown");
    } else if (enabled === false && existing) {
      await resourceDelete(existing.id);
    }
    const now = enabled === undefined ? existing : await resourceGetByPath(ownerEmail, WATCHER_JOB_PATH);
    return {
      ...describeWatcherJob(now?.content),
      schedule: "Every 3 days",
      note: "Programs are also re-checked when the board opens if their last check is 3+ days old.",
    };
  },
});

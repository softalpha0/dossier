import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Tick a checklist item done or not done, or edit its label/details. Only mark items done when the user says they are done.",
  schema: z.object({
    id: z.string().describe("Checklist item (requirement) id from get-program"),
    done: z.boolean().optional().describe("true when the user has finished this item"),
    label: z.string().min(1).max(300).optional(),
    details: z.string().max(1000).nullable().optional(),
  }),
  run: async (args, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const r = schema.requirements;
    const patch: Partial<typeof r.$inferInsert> = {};
    if (args.done !== undefined) patch.done = args.done;
    if (args.label !== undefined) patch.label = args.label;
    if (args.details !== undefined) patch.details = args.details;
    if (!Object.keys(patch).length) fail("Nothing to change.", { errorCode: "empty_patch" });
    const [row] = await getDb()
      .update(r)
      .set(patch)
      .where(and(eq(r.id, args.id), eq(r.ownerEmail, ownerEmail)))
      .returning({ id: r.id, done: r.done, label: r.label, programId: r.programId });
    if (!row) fail("Checklist item not found.", { errorCode: "not_found", statusCode: 404 });
    return row;
  },
});

import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { nowIso, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description: "Mark a detected page change as reviewed so its banner goes away. Only when the user says they've seen it.",
  schema: z.object({ id: z.string().describe("Change id from list-program-changes") }),
  run: async ({ id }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const c = schema.programChanges;
    const [row] = await getDb()
      .update(c)
      .set({ status: "reviewed", reviewedAt: nowIso() })
      .where(and(eq(c.id, id), eq(c.ownerEmail, ownerEmail)))
      .returning({ id: c.id, programId: c.programId });
    if (!row) fail("Change not found.", { errorCode: "not_found", statusCode: 404 });
    return { ...row, status: "reviewed" };
  },
});

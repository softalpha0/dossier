import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description: "Remove an item from a program's checklist. Only when the user asks.",
  schema: z.object({ id: z.string().describe("Checklist item id") }),
  run: async ({ id }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const r = schema.requirements;
    const [row] = await getDb()
      .delete(r)
      .where(and(eq(r.id, id), eq(r.ownerEmail, ownerEmail)))
      .returning({ id: r.id });
    if (!row) fail("Checklist item not found.", { errorCode: "not_found", statusCode: 404 });
    return { id, deleted: true };
  },
});

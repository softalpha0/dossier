import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description: "Delete one of the user's writing samples. Only when the user asks.",
  schema: z.object({ id: z.string().describe("Writing sample id") }),
  run: async ({ id }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const w = schema.writingSamples;
    const [row] = await getDb()
      .delete(w)
      .where(and(eq(w.id, id), eq(w.ownerEmail, ownerEmail)))
      .returning({ id: w.id });
    if (!row) fail("Writing sample not found.", { errorCode: "not_found", statusCode: 404 });
    return { id, deleted: true };
  },
});

import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description: "Delete a story from the story bank. Only when the user asks; confirm first.",
  schema: z.object({ id: z.string().describe("Story id") }),
  run: async ({ id }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const s = schema.stories;
    const [row] = await getDb()
      .delete(s)
      .where(and(eq(s.id, id), eq(s.ownerEmail, ownerEmail)))
      .returning({ id: s.id, title: s.title });
    if (!row) fail("Story not found.", { errorCode: "not_found", statusCode: 404 });
    return { ...row, deleted: true };
  },
});

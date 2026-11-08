import { defineAction } from "@agent-native/core/action";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "List the user's writing samples (their own past writing). Set includeContent to read the full text, e.g. to learn their voice.",
  schema: z.object({
    includeContent: z.coerce.boolean().optional().describe("Return the full text (default: a 200-character preview)"),
  }),
  http: { method: "GET" },
  readOnly: true,
  run: async ({ includeContent }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const w = schema.writingSamples;
    const rows = await getDb()
      .select()
      .from(w)
      .where(eq(w.ownerEmail, ownerEmail))
      .orderBy(desc(w.createdAt))
      .limit(50);
    return {
      samples: rows.map((r) => ({
        id: r.id,
        title: r.title,
        wordCount: r.wordCount,
        createdAt: r.createdAt,
        ...(includeContent ? { content: r.content } : { preview: r.content.slice(0, 200) }),
      })),
    };
  },
});

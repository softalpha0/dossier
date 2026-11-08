import { defineAction } from "@agent-native/core/action";
import { buildDeepLink } from "@agent-native/core/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { parseJsonArray, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "List the user's story bank: real experiences as situation → action → result with theme tags. Use these (never invented ones) when drafting answers.",
  schema: z.object({}),
  http: { method: "GET" },
  readOnly: true,
  link: () => ({ url: buildDeepLink({ view: "stories", to: "/stories" }), label: "Open story bank" }),
  run: async (_args, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const s = schema.stories;
    const rows = await getDb()
      .select()
      .from(s)
      .where(eq(s.ownerEmail, ownerEmail))
      .orderBy(desc(s.updatedAt))
      .limit(200);
    return {
      stories: rows.map((r) => ({
        id: r.id,
        title: r.title,
        situation: r.situation,
        action: r.action,
        result: r.result,
        themes: parseJsonArray<string>(r.themes),
        updatedAt: r.updatedAt,
      })),
    };
  },
});

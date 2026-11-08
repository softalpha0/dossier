import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { nowIso, requireUser } from "../server/lib/dossier.js";
import { storyFields } from "../server/lib/story-fields.js";

export default defineAction({
  description: "Edit a story in the story bank. Only fields you pass change. Never add details the user didn't give.",
  schema: z.object({
    id: z.string().describe("Story id"),
    title: storyFields.title.optional(),
    situation: storyFields.situation.optional(),
    action: storyFields.action.optional(),
    result: storyFields.result.optional(),
    themes: storyFields.themes.optional(),
  }),
  run: async (args, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const s = schema.stories;
    const patch: Partial<typeof s.$inferInsert> = { updatedAt: nowIso() };
    if (args.title !== undefined) patch.title = args.title;
    if (args.situation !== undefined) patch.situation = args.situation;
    if (args.action !== undefined) patch.action = args.action;
    if (args.result !== undefined) patch.result = args.result;
    if (args.themes !== undefined)
      patch.themes = JSON.stringify(args.themes.map((t) => t.trim().toLowerCase()).filter(Boolean));
    const [row] = await getDb()
      .update(s)
      .set(patch)
      .where(and(eq(s.id, args.id), eq(s.ownerEmail, ownerEmail)))
      .returning({ id: s.id, title: s.title });
    if (!row) fail("Story not found.", { errorCode: "not_found", statusCode: 404 });
    return row;
  },
});

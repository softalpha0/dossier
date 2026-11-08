import { defineAction, fail } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { countWords, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Save a sample of the user's own writing (an old essay, a blog post, a long email) so Dossier can learn how they sound. Only text the user wrote themselves.",
  schema: z.object({
    title: z.string().min(1).max(120).describe('e.g. "Undergrad personal statement"'),
    content: z.string().min(1).max(30000).describe("The writing itself, unchanged"),
  }),
  run: async (args, ctx) => {
    const { ownerEmail, orgId } = requireUser(ctx, "save writing samples");
    const words = countWords(args.content);
    if (words < 80)
      fail("That's under 80 words — add a longer piece so Dossier can learn your style.", {
        errorCode: "too_short",
      });
    const row = {
      id: crypto.randomUUID(),
      title: args.title,
      content: args.content.trim(),
      wordCount: words,
      createdAt: new Date().toISOString(),
      ownerEmail,
      orgId,
    };
    await getDb().insert(schema.writingSamples).values(row);
    return { id: row.id, title: row.title, wordCount: words };
  },
});

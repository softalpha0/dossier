import { defineAction } from "@agent-native/core/action";
import { buildDeepLink } from "@agent-native/core/server";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { nowIso, requireUser } from "../server/lib/dossier.js";
import { storyFields } from "../server/lib/story-fields.js";



export default defineAction({
  description:
    "Save a story to the user's story bank. Only record what the user told you; never invent details, numbers or outcomes — ask instead. Keep their wording.",
  schema: z.object(storyFields),
  link: () => ({ url: buildDeepLink({ view: "stories", to: "/stories" }), label: "Open story bank" }),
  run: async (args, ctx) => {
    const { ownerEmail, orgId } = requireUser(ctx, "save stories");
    const now = nowIso();
    const row = {
      id: crypto.randomUUID(),
      title: args.title,
      situation: args.situation,
      action: args.action,
      result: args.result,
      themes: JSON.stringify(args.themes.map((t) => t.trim().toLowerCase()).filter(Boolean)),
      ownerEmail,
      orgId,
      createdAt: now,
      updatedAt: now,
    };
    await getDb().insert(schema.stories).values(row);
    return { id: row.id, title: row.title };
  },
});

import { defineAction, fail } from "@agent-native/core/action";
import { z } from "zod";

import { deleteStoriesData } from "../server/lib/cleanup.js";
import { requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description: "Delete a story from the story bank (and its story-map scores). Only when the user asks; confirm first.",
  schema: z.object({ id: z.string().describe("Story id") }),
  run: async ({ id }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const [row] = await deleteStoriesData([id], ownerEmail);
    if (!row) fail("Story not found.", { errorCode: "not_found", statusCode: 404 });
    return { ...row, deleted: true };
  },
});

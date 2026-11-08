import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import { deleteProgramData } from "../server/lib/cleanup.js";
import { requireProgram, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Delete a program with its checklist, questions, answers, story-map scores and review panel. Only do this when the user explicitly asks; confirm first in chat.",
  schema: z.object({ id: z.string().describe("Program id") }),
  run: async ({ id }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const program = await requireProgram(id, ownerEmail);
    await deleteProgramData(id, ownerEmail);
    return { id, deleted: true, title: program.title };
  },
});

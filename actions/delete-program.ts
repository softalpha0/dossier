import { defineAction } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { requireProgram, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Delete a program with its checklist and questions. Only do this when the user explicitly asks; confirm first in chat.",
  schema: z.object({ id: z.string().describe("Program id") }),
  run: async ({ id }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const program = await requireProgram(id, ownerEmail);
    const db = getDb();
    await db.transaction(async (tx) => {
      await tx
        .delete(schema.requirements)
        .where(
          and(
            eq(schema.requirements.programId, id),
            eq(schema.requirements.ownerEmail, ownerEmail),
          ),
        );
      await tx
        .delete(schema.questions)
        .where(
          and(
            eq(schema.questions.programId, id),
            eq(schema.questions.ownerEmail, ownerEmail),
          ),
        );
      await tx
        .delete(schema.programs)
        .where(
          and(eq(schema.programs.id, id), eq(schema.programs.ownerEmail, ownerEmail)),
        );
    });
    return { id, deleted: true, title: program.title };
  },
});

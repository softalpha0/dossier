import { defineAction } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import {
  nowIso,
  PROGRAM_STATUSES,
  requireProgram,
  requireUser,
} from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Move a program to another stage on the board: researching → preparing → ready → submitted → shortlisted → result. Only the user marks a program submitted; Dossier never submits anything.",
  schema: z.object({
    id: z.string().describe("Program id"),
    status: z.enum(PROGRAM_STATUSES).describe("New stage"),
  }),
  run: async ({ id, status }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    await requireProgram(id, ownerEmail);
    const p = schema.programs;
    await getDb()
      .update(p)
      .set({ status, updatedAt: nowIso() })
      .where(and(eq(p.id, id), eq(p.ownerEmail, ownerEmail)));
    return { id, status };
  },
});

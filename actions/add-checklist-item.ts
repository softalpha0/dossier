import { defineAction } from "@agent-native/core/action";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { REQUIREMENT_KINDS, requireProgram, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description: "Add the user's own item to a program's checklist (e.g. 'Ask Prof. Ade for a reference').",
  schema: z.object({
    programId: z.string().describe("Program id"),
    label: z.string().min(1).max(300).describe("Short task"),
    kind: z.enum(REQUIREMENT_KINDS).default("other"),
    details: z.string().max(1000).nullable().optional(),
  }),
  run: async (args, ctx) => {
    const { ownerEmail, orgId } = requireUser(ctx);
    await requireProgram(args.programId, ownerEmail);
    const r = schema.requirements;
    const db = getDb();
    const [max] = await db
      .select({ v: sql<number>`coalesce(max(${r.sort}), -1)` })
      .from(r)
      .where(and(eq(r.programId, args.programId), eq(r.ownerEmail, ownerEmail)));
    const row = {
      id: crypto.randomUUID(),
      programId: args.programId,
      kind: args.kind,
      label: args.label,
      details: args.details ?? null,
      sort: Number(max?.v ?? -1) + 1,
      ownerEmail,
      orgId,
    };
    await db.insert(r).values(row);
    return { id: row.id, label: row.label, kind: row.kind };
  },
});

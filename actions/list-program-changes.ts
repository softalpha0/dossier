import { defineAction } from "@agent-native/core/action";
import { and, desc, eq, type SQL } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { parseJsonArray, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Changes the rules watcher found on programs' official pages: lines that appeared and disappeared, when, and whether the user has reviewed them. Pass programId for one program; omit it for every unreviewed change.",
  schema: z.object({
    programId: z.string().optional().describe("Limit to one program"),
    includeReviewed: z.coerce.boolean().default(false).describe("Also return already-reviewed changes"),
  }),
  http: { method: "GET" },
  readOnly: true,
  run: async ({ programId, includeReviewed }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const c = schema.programChanges;
    const p = schema.programs;
    const where: SQL[] = [eq(c.ownerEmail, ownerEmail)];
    if (programId) where.push(eq(c.programId, programId));
    if (!includeReviewed) where.push(eq(c.status, "new"));
    const rows = await getDb()
      .select({
        id: c.id,
        programId: c.programId,
        programTitle: p.title,
        sourceUrl: c.sourceUrl,
        added: c.addedJson,
        removed: c.removedJson,
        status: c.status,
        detectedAt: c.detectedAt,
        reviewedAt: c.reviewedAt,
      })
      .from(c)
      .innerJoin(p, and(eq(p.id, c.programId), eq(p.ownerEmail, ownerEmail)))
      .where(and(...where))
      .orderBy(desc(c.detectedAt))
      .limit(50);
    return {
      changes: rows.map((r) => ({
        ...r,
        added: parseJsonArray<string>(r.added),
        removed: parseJsonArray<string>(r.removed),
      })),
    };
  },
});

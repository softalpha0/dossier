import { defineAction } from "@agent-native/core/action";
import { buildDeepLink } from "@agent-native/core/server";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "List the user's programs (newest first) with type, provider, status, deadline and checklist progress.",
  schema: z.object({}),
  http: { method: "GET" },
  readOnly: true,
  link: () => ({
    url: buildDeepLink({ view: "programs", to: "/programs" }),
    label: "Open programs",
  }),
  run: async (_args, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const p = schema.programs;
    const db = getDb();
    const rows = await db
      .select({
        id: p.id,
        title: p.title,
        type: p.type,
        provider: p.provider,
        status: p.status,
        deadlineAt: p.deadlineAt,
        deadlineTz: p.deadlineTz,
        deadlineText: p.deadlineText,
        sourceUrl: p.sourceUrl,
        createdAt: p.createdAt,
      })
      .from(p)
      .where(eq(p.ownerEmail, ownerEmail))
      .orderBy(sql`${p.createdAt} desc`)
      .limit(200);
    const ids = rows.map((r) => r.id);
    const r = schema.requirements;
    const q = schema.questions;
    const reqCounts = ids.length
      ? await db
          .select({
            programId: r.programId,
            total: count(),
            done: sql<number>`sum(case when ${r.done} then 1 else 0 end)`,
          })
          .from(r)
          .where(and(eq(r.ownerEmail, ownerEmail), inArray(r.programId, ids)))
          .groupBy(r.programId)
      : [];
    const qCounts = ids.length
      ? await db
          .select({ programId: q.programId, total: count() })
          .from(q)
          .where(and(eq(q.ownerEmail, ownerEmail), inArray(q.programId, ids)))
          .groupBy(q.programId)
      : [];
    return {
      programs: rows.map((row) => {
        const rc = reqCounts.find((c) => c.programId === row.id);
        const qc = qCounts.find((c) => c.programId === row.id);
        return {
          ...row,
          checklistTotal: Number(rc?.total ?? 0),
          checklistDone: Number(rc?.done ?? 0),
          questionCount: Number(qc?.total ?? 0),
        };
      }),
    };
  },
});

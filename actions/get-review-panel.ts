import { defineAction } from "@agent-native/core/action";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { parseJsonArray, requireProgram, requireUser, verdictFor } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Get a program's simulated committee (3 reviewers with their sub-agent profile paths) and the latest review run, optionally for one question.",
  schema: z.object({
    programId: z.string().describe("Program id"),
    questionId: z.string().optional().describe("Only the latest run for this question"),
  }),
  http: { method: "GET" },
  readOnly: true,
  run: async ({ programId, questionId }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    await requireProgram(programId, ownerEmail);
    const db = getDb();
    const r = schema.reviewers;
    const reviewers = await db
      .select()
      .from(r)
      .where(and(eq(r.ownerEmail, ownerEmail), eq(r.programId, programId)))
      .orderBy(asc(r.sort))
      .limit(3);
    const pr = schema.panelReviews;
    const where = questionId
      ? and(eq(pr.ownerEmail, ownerEmail), eq(pr.programId, programId), eq(pr.questionId, questionId))
      : and(eq(pr.ownerEmail, ownerEmail), eq(pr.programId, programId));
    const [latest] = await db
      .select({ runId: pr.runId })
      .from(pr)
      .where(where)
      .orderBy(desc(pr.createdAt))
      .limit(1);
    let latestRun = null;
    if (latest) {
      const rows = await db
        .select()
        .from(pr)
        .where(and(eq(pr.runId, latest.runId), eq(pr.ownerEmail, ownerEmail)))
        .limit(3);
      const average = Math.round((rows.reduce((s, x) => s + x.score, 0) / rows.length) * 10) / 10;
      latestRun = {
        runId: latest.runId,
        questionId: rows[0]?.questionId ?? null,
        answerText: rows[0]?.answerText ?? "",
        createdAt: rows[0]?.createdAt ?? null,
        average,
        verdict: verdictFor(average),
        reviews: rows.map((x) => ({
          reviewerId: x.reviewerId,
          reviewerName: reviewers.find((rv) => rv.id === x.reviewerId)?.name ?? "Reviewer",
          score: x.score,
          bestLine: x.bestLine,
          weakestLine: x.weakestLine,
          fix: x.fix,
        })),
      };
    }
    return {
      simulated: true,
      reviewers: reviewers.map((x) => ({
        id: x.id,
        name: x.name,
        role: x.role,
        values: x.values,
        penalises: x.penalises,
        rubric: parseJsonArray<{ criterion: string; lookFor: string }>(x.rubricJson),
        agentPath: x.agentPath,
      })),
      latestRun,
    };
  },
});

import { defineAction, fail } from "@agent-native/core/action";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { requireProgram, requireUser, verdictFor } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Save one committee review run: each simulated reviewer's score (1–5), best line, weakest line and one fix for the same answer text. Dossier computes the average and verdict (≥4 Likely shortlist, 3–3.9 Borderline, <3 Unlikely). Quote lines exactly from the answer. Fixes should then be offered as suggestions, never applied directly.",
  schema: z.object({
    programId: z.string().describe("Program id"),
    questionId: z.string().nullable().describe("Question id the answer responds to, or null"),
    answerId: z.string().nullable().optional().describe("Saved answer id, when there is one"),
    answerText: z.string().min(20).max(20000).describe("The exact answer text that was reviewed"),
    reviews: z
      .array(
        z.object({
          reviewerId: z.string().describe("Reviewer id from build-review-panel / get-review-panel"),
          score: z.coerce.number().int().min(1).max(5),
          bestLine: z.string().max(1000).nullable(),
          weakestLine: z.string().max(1000).nullable(),
          fix: z.string().max(600).nullable(),
        }),
      )
      .min(1)
      .max(3),
  }),
  run: async (args, ctx) => {
    const { ownerEmail, orgId } = requireUser(ctx, "save a review");
    await requireProgram(args.programId, ownerEmail);
    const db = getDb();
    const r = schema.reviewers;
    const ids = args.reviews.map((x) => x.reviewerId);
    const known = await db
      .select({ id: r.id, name: r.name })
      .from(r)
      .where(and(eq(r.ownerEmail, ownerEmail), eq(r.programId, args.programId), inArray(r.id, ids)));
    if (known.length !== new Set(ids).size)
      fail("Some reviewer ids don't belong to this program's panel. Call get-review-panel.", {
        errorCode: "unknown_reviewer",
      });
    if (args.questionId) {
      const q = schema.questions;
      const [row] = await db
        .select({ id: q.id })
        .from(q)
        .where(and(eq(q.id, args.questionId), eq(q.ownerEmail, ownerEmail), eq(q.programId, args.programId)))
        .limit(1);
      if (!row) fail("Question not found in this program.", { errorCode: "not_found", statusCode: 404 });
    }
    const runId = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.insert(schema.panelReviews).values(
      args.reviews.map((rev) => ({
        id: crypto.randomUUID(),
        runId,
        programId: args.programId,
        questionId: args.questionId,
        answerId: args.answerId ?? null,
        answerText: args.answerText,
        reviewerId: rev.reviewerId,
        score: rev.score,
        bestLine: rev.bestLine,
        weakestLine: rev.weakestLine,
        fix: rev.fix,
        ownerEmail,
        orgId,
        createdAt: now,
      })),
    );
    const average = Math.round((args.reviews.reduce((s, x) => s + x.score, 0) / args.reviews.length) * 10) / 10;
    return { runId, average, verdict: verdictFor(average), reviewers: args.reviews.length, simulated: true };
  },
});

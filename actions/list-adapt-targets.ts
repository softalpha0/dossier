import { defineAction } from "@agent-native/core/action";
import { and, asc, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { requireQuestion, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "List the questions an existing answer could be adapted for: every other question in the user's programs, with its program, word/character limit and how much of an answer it already has. Use before adapting an answer (workflow: adapt an answer).",
  schema: z.object({ sourceQuestionId: z.string().describe("The question whose answer will be adapted") }),
  http: { method: "GET" },
  readOnly: true,
  run: async ({ sourceQuestionId }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const source = await requireQuestion(sourceQuestionId, ownerEmail);
    const q = schema.questions;
    const p = schema.programs;
    const a = schema.answers;
    const rows = await getDb()
      .select({
        questionId: q.id,
        text: q.text,
        wordLimit: q.wordLimit,
        charLimit: q.charLimit,
        sort: q.sort,
        programId: p.id,
        programTitle: p.title,
        deadlineAt: p.deadlineAt,
        answerWords: a.wordCount,
      })
      .from(q)
      .innerJoin(p, and(eq(p.id, q.programId), eq(p.ownerEmail, ownerEmail)))
      .leftJoin(a, and(eq(a.questionId, q.id), eq(a.ownerEmail, ownerEmail)))
      .where(and(eq(q.ownerEmail, ownerEmail), ne(q.id, source.id)))
      .orderBy(asc(p.deadlineAt), asc(p.title), asc(q.sort));

    return {
      source: { questionId: source.id, programId: source.programId, text: source.text },
      targets: rows.map((r) => ({
        questionId: r.questionId,
        questionNumber: r.sort + 1,
        text: r.text,
        wordLimit: r.wordLimit,
        charLimit: r.charLimit,
        programId: r.programId,
        programTitle: r.programTitle,
        sameProgram: r.programId === source.programId,
        hasAnswer: (r.answerWords ?? 0) > 0,
        answerWords: r.answerWords ?? 0,
      })),
    };
  },
});

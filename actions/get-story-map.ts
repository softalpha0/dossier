import { defineAction } from "@agent-native/core/action";
import { and, asc, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { parseJsonArray, requireProgram, requireUser } from "../server/lib/dossier.js";

const STRONG = 70;

export default defineAction({
  description:
    "Story map for a program: questions × stories with fit scores, the best story per question, uncovered questions (no story scores 70+), and stories over-used as the best pick across this and other programs.",
  schema: z.object({ programId: z.string().describe("Program id") }),
  http: { method: "GET" },
  readOnly: true,
  run: async ({ programId }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const program = await requireProgram(programId, ownerEmail);
    const db = getDb();
    const questions = await db
      .select({ id: schema.questions.id, text: schema.questions.text, wordLimit: schema.questions.wordLimit, sort: schema.questions.sort })
      .from(schema.questions)
      .where(and(eq(schema.questions.ownerEmail, ownerEmail), eq(schema.questions.programId, programId)))
      .orderBy(asc(schema.questions.sort))
      .limit(100);
    const storyRows = await db
      .select({ id: schema.stories.id, title: schema.stories.title, themes: schema.stories.themes })
      .from(schema.stories)
      .where(eq(schema.stories.ownerEmail, ownerEmail))
      .limit(200);
    const f = schema.storyFits;
    const fits = await db
      .select({ questionId: f.questionId, storyId: f.storyId, score: f.score, reason: f.reason })
      .from(f)
      .where(and(eq(f.ownerEmail, ownerEmail), eq(f.programId, programId)))
      .limit(2000);
    const others = await db
      .select({ questionId: f.questionId, storyId: f.storyId, score: f.score })
      .from(f)
      .where(and(eq(f.ownerEmail, ownerEmail), ne(f.programId, programId)))
      .limit(5000);
    const bestOf = (rows: { questionId: string; storyId: string; score: number }[]) => {
      const m = new Map<string, { storyId: string; score: number }>();
      for (const r of rows) {
        const cur = m.get(r.questionId);
        if (!cur || r.score > cur.score) m.set(r.questionId, { storyId: r.storyId, score: r.score });
      }
      return m;
    };
    const best = bestOf(fits);
    const bestElsewhere = bestOf(others);
    const usage = new Map<string, { here: number; elsewhere: number }>();
    for (const b of best.values())
      if (b.score >= STRONG) usage.set(b.storyId, { here: (usage.get(b.storyId)?.here ?? 0) + 1, elsewhere: usage.get(b.storyId)?.elsewhere ?? 0 });
    for (const b of bestElsewhere.values())
      if (b.score >= STRONG) usage.set(b.storyId, { here: usage.get(b.storyId)?.here ?? 0, elsewhere: (usage.get(b.storyId)?.elsewhere ?? 0) + 1 });
    return {
      program: { id: program.id, title: program.title },
      questions: questions.map((q) => {
        const b = best.get(q.id);
        return {
          id: q.id,
          text: q.text,
          wordLimit: q.wordLimit,
          bestStoryId: b && b.score >= STRONG ? b.storyId : null,
          bestScore: b?.score ?? null,
          covered: !!b && b.score >= STRONG,
        };
      }),
      stories: storyRows.map((s) => {
        const u = usage.get(s.id) ?? { here: 0, elsewhere: 0 };
        return {
          id: s.id,
          title: s.title,
          themes: parseJsonArray<string>(s.themes),
          bestForHere: u.here,
          bestForElsewhere: u.elsewhere,
          overused: u.here >= 2 || u.here + u.elsewhere >= 3,
        };
      }),
      fits,
      mapped: fits.length > 0,
      uncovered: questions.filter((q) => !best.get(q.id) || best.get(q.id)!.score < STRONG).map((q) => q.id),
    };
  },
});

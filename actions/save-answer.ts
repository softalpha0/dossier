import { defineAction } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import {
  countChars,
  countWords,
  findAnswer,
  nowIso,
  requireQuestion,
  requireUser,
} from "../server/lib/dossier.js";

// The user's own typing in the editor. Hidden from the agent on purpose:
// the agent proposes changes with suggest-edit and never overwrites the answer.
export default defineAction({
  description: "Save the user's own edits to an answer (editor autosave).",
  schema: z.object({
    questionId: z.string(),
    content: z.string().max(20000),
  }),
  agentTool: false,
  run: async (args, ctx) => {
    const { ownerEmail, orgId } = requireUser(ctx, "save answers");
    const question = await requireQuestion(args.questionId, ownerEmail);
    const existing = await findAnswer(args.questionId, ownerEmail);
    const row = {
      content: args.content,
      wordCount: countWords(args.content),
      charCount: countChars(args.content),
      updatedAt: nowIso(),
    };
    const a = schema.answers;
    let id: string;
    if (existing) {
      await getDb().update(a).set(row).where(and(eq(a.id, existing.id), eq(a.ownerEmail, ownerEmail)));
      id = existing.id;
      // A pending suggestion whose text is gone can no longer apply.
      const pending = await getDb()
        .select({ id: schema.suggestions.id, findText: schema.suggestions.findText })
        .from(schema.suggestions)
        .where(
          and(
            eq(schema.suggestions.answerId, id),
            eq(schema.suggestions.ownerEmail, ownerEmail),
            eq(schema.suggestions.status, "pending"),
          ),
        )
        .limit(50);
      for (const s of pending)
        if (!args.content.includes(s.findText))
          await getDb()
            .update(schema.suggestions)
            .set({ status: "stale", resolvedAt: nowIso() })
            .where(and(eq(schema.suggestions.id, s.id), eq(schema.suggestions.ownerEmail, ownerEmail)));
    } else {
      id = crypto.randomUUID();
      await getDb()
        .insert(a)
        .values({ id, programId: question.programId, questionId: question.id, ownerEmail, orgId, ...row });
    }
    return { id, wordCount: row.wordCount, charCount: row.charCount, savedAt: row.updatedAt };
  },
});

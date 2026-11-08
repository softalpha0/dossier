import { defineAction, fail } from "@agent-native/core/action";
import { buildDeepLink } from "@agent-native/core/server";
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

export default defineAction({
  description:
    "Write the FIRST draft of an answer, built only from the user's own story (list-stories) and profile — no invented facts or numbers. Only works while the answer is empty; once the user has text, propose changes with suggest-edit instead. Aim at or under the word limit and answer the exact question.",
  schema: z.object({
    questionId: z.string().describe("Question id"),
    storyId: z.string().nullable().describe("The story the draft is built from, or null"),
    content: z.string().min(20).max(20000).describe("The draft text, plain paragraphs"),
  }),
  link: ({ result }) => ({
    url: buildDeepLink({
      view: "answer",
      to: result.path,
      params: { programId: result.programId, questionId: result.questionId },
    }),
    label: "Open answer",
  }),
  run: async (args, ctx) => {
    const { ownerEmail, orgId } = requireUser(ctx, "draft answers");
    const question = await requireQuestion(args.questionId, ownerEmail);
    if (args.storyId) {
      const [story] = await getDb()
        .select({ id: schema.stories.id })
        .from(schema.stories)
        .where(and(eq(schema.stories.id, args.storyId), eq(schema.stories.ownerEmail, ownerEmail)))
        .limit(1);
      if (!story) fail("Story not found in the story bank.", { errorCode: "unknown_story", statusCode: 404 });
    }
    const existing = await findAnswer(args.questionId, ownerEmail);
    if (existing && existing.content.trim())
      fail("This answer already has text. Propose changes with suggest-edit; the user's words are never overwritten.", {
        errorCode: "answer_not_empty",
        statusCode: 409,
      });
    const content = args.content.trim();
    const row = {
      content,
      storyId: args.storyId,
      wordCount: countWords(content),
      charCount: countChars(content),
      updatedAt: nowIso(),
    };
    const a = schema.answers;
    let id: string;
    if (existing) {
      await getDb().update(a).set(row).where(and(eq(a.id, existing.id), eq(a.ownerEmail, ownerEmail)));
      id = existing.id;
    } else {
      id = crypto.randomUUID();
      await getDb()
        .insert(a)
        .values({ id, programId: question.programId, questionId: question.id, ownerEmail, orgId, ...row });
    }
    return {
      id,
      programId: question.programId,
      questionId: question.id,
      wordCount: row.wordCount,
      wordLimit: question.wordLimit,
      path: `/programs/${question.programId}/questions/${question.id}`,
    };
  },
});

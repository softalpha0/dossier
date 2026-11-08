import { defineAction } from "@agent-native/core/action";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import {
  findAnswer,
  genericPhraseHits,
  limitStatus,
  parseJsonArray,
  requireProgram,
  requireQuestion,
  requireUser,
} from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Get the answer for one question: the exact question and its word/character limits, the current answer text with counts, pending suggestions, sentences with stock phrases that may sound generic, the latest voice check and committee verdict.",
  schema: z.object({ questionId: z.string().describe("Question id from get-program") }),
  http: { method: "GET" },
  readOnly: true,
  run: async ({ questionId }, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    const question = await requireQuestion(questionId, ownerEmail);
    const program = await requireProgram(question.programId, ownerEmail);
    const answer = await findAnswer(questionId, ownerEmail);
    const suggestions = answer
      ? await getDb()
          .select({
            id: schema.suggestions.id,
            findText: schema.suggestions.findText,
            replaceText: schema.suggestions.replaceText,
            reason: schema.suggestions.reason,
            origin: schema.suggestions.origin,
            createdAt: schema.suggestions.createdAt,
          })
          .from(schema.suggestions)
          .where(
            and(
              eq(schema.suggestions.answerId, answer.id),
              eq(schema.suggestions.ownerEmail, ownerEmail),
              eq(schema.suggestions.status, "pending"),
            ),
          )
          .orderBy(desc(schema.suggestions.createdAt))
          .limit(50)
      : [];
    const content = answer?.content ?? "";
    const words = answer?.wordCount ?? 0;
    const chars = answer?.charCount ?? 0;
    return {
      program: { id: program.id, title: program.title },
      question: {
        id: question.id,
        text: question.text,
        wordLimit: question.wordLimit,
        charLimit: question.charLimit,
        notes: question.notes,
      },
      answer: answer
        ? {
            id: answer.id,
            content,
            wordCount: words,
            charCount: chars,
            storyId: answer.storyId,
            voiceScore: answer.voiceScore,
            voiceFlags: parseJsonArray<{ sentence: string; reason: string }>(answer.voiceFlagsJson),
            voiceCheckedAt: answer.voiceCheckedAt,
            panelVerdict: answer.panelVerdict,
            panelAverage: answer.panelAverage,
            updatedAt: answer.updatedAt,
          }
        : null,
      limits: limitStatus(words, chars, question.wordLimit, question.charLimit),
      suggestions,
      genericHits: genericPhraseHits(content),
    };
  },
});

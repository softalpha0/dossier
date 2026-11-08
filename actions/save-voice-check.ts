import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { findAnswer, nowIso, requireQuestion, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Save a voice check for an answer: a 0–100 'Sounds like you' score compared with the voice profile, and the sentences that may sound generic or unlike the user, each with a short reason. Say 'may sound generic' — never claim the text is AI-written. Then propose rewrites in the user's voice with suggest-edit (origin 'voice').",
  schema: z.object({
    questionId: z.string(),
    score: z.coerce.number().int().min(0).max(100),
    flags: z
      .array(
        z.object({
          sentence: z.string().min(3).max(1000).describe("Exact sentence from the answer"),
          reason: z.string().min(3).max(200).describe('e.g. "Stock phrase — may sound generic"'),
        }),
      )
      .max(20),
  }),
  run: async (args, ctx) => {
    const { ownerEmail } = requireUser(ctx);
    await requireQuestion(args.questionId, ownerEmail);
    const answer = await findAnswer(args.questionId, ownerEmail);
    if (!answer || !answer.content.trim()) fail("There's no answer to check yet.", { errorCode: "no_answer", statusCode: 409 });
    const flags = args.flags.filter((f) => answer.content.includes(f.sentence));
    const a = schema.answers;
    const checkedAt = nowIso();
    await getDb()
      .update(a)
      .set({ voiceScore: args.score, voiceFlagsJson: JSON.stringify(flags), voiceCheckedAt: checkedAt })
      .where(and(eq(a.id, answer.id), eq(a.ownerEmail, ownerEmail)));
    return { answerId: answer.id, score: args.score, flags: flags.length, dropped: args.flags.length - flags.length, checkedAt };
  },
});

import { defineAction, fail } from "@agent-native/core/action";
import { z } from "zod";

import { getDb, schema } from "../server/db/index.js";
import { findAnswer, requireQuestion, requireUser } from "../server/lib/dossier.js";

export default defineAction({
  description:
    "Propose one edit to the user's answer as a suggestion they accept or reject — never change the answer directly. `find` must be copied exactly from the current answer (get-answer) and appear once; `replace` is the new text (empty string to delete). Keep the user's voice and facts; never add achievements or numbers they didn't give. Use several small suggestions rather than one rewrite.",
  schema: z.object({
    questionId: z.string().describe("Question id"),
    find: z.string().min(1).max(4000).describe("Exact text from the current answer"),
    replace: z.string().max(4000).describe("Replacement text ('' removes it)"),
    reason: z.string().min(1).max(300).describe("Why, in one short plain sentence"),
    origin: z.enum(["coach", "voice", "panel"]).describe("coach = writing help, voice = sounds-like-you rewrite, panel = committee fix"),
  }),
  run: async (args, ctx) => {
    const { ownerEmail, orgId } = requireUser(ctx);
    await requireQuestion(args.questionId, ownerEmail);
    const answer = await findAnswer(args.questionId, ownerEmail);
    if (!answer || !answer.content.trim())
      fail("There's no answer yet. Use draft-answer for a first draft.", { errorCode: "no_answer", statusCode: 409 });
    const first = answer.content.indexOf(args.find);
    if (first === -1)
      fail("That text isn't in the current answer. Call get-answer and copy it exactly.", { errorCode: "find_not_found" });
    if (answer.content.indexOf(args.find, first + 1) !== -1)
      fail("That text appears more than once. Include more surrounding words so it is unique.", { errorCode: "find_ambiguous" });
    if (args.find === args.replace) fail("The replacement is the same as the original.", { errorCode: "no_change" });
    const id = crypto.randomUUID();
    await getDb().insert(schema.suggestions).values({
      id,
      answerId: answer.id,
      findText: args.find,
      replaceText: args.replace,
      reason: args.reason,
      origin: args.origin,
      ownerEmail,
      orgId,
    });
    return { id, status: "pending", note: "The user accepts or rejects this in the editor." };
  },
});
